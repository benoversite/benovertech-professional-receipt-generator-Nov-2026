# BENOVERTECH GADGETS Receipt Generator

A React and Vite application for creating, saving, exporting, and sharing branded sales receipts. The repository root is the deployable Vite app; it builds to `dist/` and is configured for Vercel.

## Requirements

- Node.js 20 or newer
- npm
- A Supabase project for shared receipt storage and authentication

## Local development

```sh
npm ci
```

Copy `.env.example` to `.env.local` and set your Supabase project URL and publishable key. Never put a Supabase service-role key or other secret in a `VITE_` variable; Vite exposes those values to browsers.

```sh
npm run dev
```

## Production checks

```sh
npm run lint
npm test
npm run build
npm run preview
```

The production build is written to `dist/`. Vercel uses `vercel.json` to run the build and serve the SPA entry point for client-side routes such as `/dashboard` and `/receipt/:id`.

## Deploy to Vercel

Import the Git repository into Vercel and use the repository root (`.`) as the project root. The included Vercel configuration specifies the Vite framework, `npm run build`, and `dist` as the output directory.

Add these environment variables in the Vercel project settings for each deployment environment:

- `VITE_SUPABASE_URL` — the Supabase project URL.
- `VITE_SUPABASE_PUBLISHABLE_KEY` — the Supabase publishable (or legacy anon) key.
- `VITE_SUPABASE_OPEN_USER_ID` — optional; defaults to the open-site user configured by the database migrations.

Redeploy after changing environment variables. These are browser-visible settings; do not use a Supabase service-role key.
