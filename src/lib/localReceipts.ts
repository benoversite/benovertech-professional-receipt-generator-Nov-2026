import { Receipt } from "@/types/receipt";
import { OPEN_SITE_USER_ID } from "@/lib/business";

const STORAGE_KEY = "benovertech-local-receipts";

type LocalReceiptInput = Omit<
  Receipt,
  "id" | "receipt_number" | "pdf_url" | "created_at" | "updated_at"
>;

const isReceipt = (value: unknown): value is Receipt => {
  if (!value || typeof value !== "object") return false;
  const receipt = value as Record<string, unknown>;
  const requiredStrings = [
    "id",
    "user_id",
    "receipt_number",
    "customer_name",
    "customer_phone",
    "product_name",
    "warranty_note",
    "created_at",
    "updated_at",
  ];
  const nullableStrings = [
    "customer_address",
    "product_color",
    "serial_number",
    "part_number",
    "product_image_url",
    "pdf_url",
  ];

  return (
    requiredStrings.every((key) => typeof receipt[key] === "string") &&
    nullableStrings.every((key) => receipt[key] === null || typeof receipt[key] === "string") &&
    typeof receipt.price === "number"
  );
};

export function getLocalReceipts(): Receipt[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return [];

  const parsed: unknown = JSON.parse(stored);
  if (!Array.isArray(parsed) || !parsed.every(isReceipt)) {
    throw new Error("Locally saved receipts are invalid. Clear this browser's saved receipt data to continue.");
  }
  return parsed;
}

export function saveLocalReceipt(receipt: Receipt): void {
  const receipts = getLocalReceipts().filter((saved) => saved.id !== receipt.id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify([receipt, ...receipts]));
}

export function isLocalReceipt(id: string): boolean {
  return getLocalReceipts().some((receipt) => receipt.id === id);
}

export async function createLocalReceipt(
  input: LocalReceiptInput,
  productImage?: File | null
): Promise<{ receipt: Receipt; imageOmitted: boolean }> {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const prefix = `BNV-${year}-${month}-LOCAL-`;
  const nextNumber =
    getLocalReceipts().filter((receipt) => receipt.receipt_number.startsWith(prefix)).length + 1;
  let imageUrl = input.product_image_url;
  let imageOmitted = false;
  if (productImage) {
    try {
      imageUrl = await compressImageToDataUrl(productImage);
    } catch (error) {
      console.warn("Could not save product image for the offline receipt:", error);
      imageUrl = null;
      imageOmitted = true;
    }
  }
  const receipt: Receipt = {
    ...input,
    id: crypto.randomUUID(),
    receipt_number: `${prefix}${String(nextNumber).padStart(4, "0")}`,
    product_image_url: imageUrl,
    pdf_url: null,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  try {
    saveLocalReceipt(receipt);
  } catch (error) {
    if (!imageUrl || !isStorageQuotaError(error)) throw error;
    receipt.product_image_url = null;
    saveLocalReceipt(receipt);
    imageOmitted = true;
  }
  return { receipt, imageOmitted };
}

export function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) return true;
  const message =
    error instanceof Error
      ? error.message
      : error && typeof error === "object" && "message" in error
        ? String(error.message)
        : "";
  return /failed to fetch|network error|network request failed|load failed/i.test(message);
}

function isStorageQuotaError(error: unknown): boolean {
  return error instanceof DOMException && error.name === "QuotaExceededError";
}

async function compressImageToDataUrl(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const maxDimension = 1200;
  const scale = Math.min(1, maxDimension / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("Could not prepare the product image for offline storage.");
  }
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  const imageBlob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode the product image."))),
      "image/jpeg",
      0.8
    );
  });
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      typeof reader.result === "string"
        ? resolve(reader.result)
        : reject(new Error("Could not read the prepared product image."));
    reader.onerror = () =>
      reject(reader.error ?? new Error("Could not read the prepared product image."));
    reader.readAsDataURL(imageBlob);
  });
}
