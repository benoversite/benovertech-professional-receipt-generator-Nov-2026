import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import type { Database } from './types';

declare global {
  var __benovertechSupabaseClient: SupabaseClient<Database> | undefined;
}

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL?.trim();
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY?.trim();
let parsedUrl: URL | null = null;
try {
  if (SUPABASE_URL) parsedUrl = new URL(SUPABASE_URL);
} catch {
  parsedUrl = null;
}

export const isSupabaseConfigured = Boolean(
  parsedUrl &&
    parsedUrl.protocol === 'https:' &&
    SUPABASE_PUBLISHABLE_KEY
);

export const SUPABASE_CONFIG_ERROR =
  'Supabase is not configured. Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in the deployment environment, then redeploy.';

const requestTimeoutMs = 10_000;

const fetchWithTimeout: typeof fetch = async (input, init) => {
  const controller = new AbortController();
  const callerSignal = init?.signal;
  const abortFromCaller = () => controller.abort(callerSignal?.reason);
  if (callerSignal?.aborted) abortFromCaller();
  else callerSignal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeout = setTimeout(
    () => controller.abort(new DOMException('Supabase request timed out.', 'TimeoutError')),
    requestTimeoutMs
  );
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (error) {
    if (controller.signal.aborted && !callerSignal?.aborted) {
      throw new TypeError(`Supabase request timed out after ${requestTimeoutMs / 1000} seconds.`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
    callerSignal?.removeEventListener('abort', abortFromCaller);
  }
};

const supabaseUrl = isSupabaseConfigured ? SUPABASE_URL! : 'http://127.0.0.1:54321';
const supabaseKey = isSupabaseConfigured ? SUPABASE_PUBLISHABLE_KEY! : 'missing-supabase-configuration';

export const supabase =
  globalThis.__benovertechSupabaseClient ??
  createClient<Database>(supabaseUrl, supabaseKey, {
    global: { fetch: fetchWithTimeout },
    auth: {
      storage: typeof localStorage === 'undefined' ? undefined : localStorage,
      persistSession: true,
      autoRefreshToken: true,
    },
  });

if (import.meta.env.DEV) {
  globalThis.__benovertechSupabaseClient = supabase;
}