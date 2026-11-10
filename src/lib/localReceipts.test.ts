import { afterEach, describe, expect, it } from "vitest";
import {
  createLocalReceipt,
  getCachedRemoteReceipt,
  getLocalReceipts,
  isNetworkError,
  saveLocalReceipt,
} from "@/lib/localReceipts";

const receiptInput = {
  user_id: "11111111-1111-1111-1111-111111111111",
  customer_name: "Test Customer",
  customer_phone: "08012345678",
  customer_address: null,
  product_name: "Test Product",
  product_color: null,
  serial_number: null,
  part_number: null,
  price: 25000,
  product_image_url: null,
  warranty_note: "7-day service warranty",
};

afterEach(() => {
  localStorage.clear();
});

describe("local receipt storage", () => {
  it("creates and retrieves a receipt for offline use", async () => {
    const { receipt } = await createLocalReceipt(receiptInput);

    expect(receipt.receipt_number).toMatch(/^BNV-\d{4}-\d{2}-LOCAL-0001$/);
    expect(getLocalReceipts()).toEqual([receipt]);
  });

  it("increments local receipt numbers", async () => {
    const first = await createLocalReceipt(receiptInput);
    const second = await createLocalReceipt(receiptInput);

    expect(second.receipt.receipt_number).toBe(
      `${first.receipt.receipt_number.slice(0, -4)}0002`
    );
  });

  it("replaces a saved receipt with the same id", () => {
    const now = new Date().toISOString();
    const receipt = {
      ...receiptInput,
      id: "local-receipt",
      receipt_number: "BNV-2026-11-LOCAL-0001",
      pdf_url: null,
      created_at: now,
      updated_at: now,
    };

    saveLocalReceipt(receipt);
    saveLocalReceipt({ ...receipt, customer_name: "Updated Customer" });

    expect(getLocalReceipts()).toHaveLength(1);
    expect(getLocalReceipts()[0].customer_name).toBe("Updated Customer");
  });

  it("reads a remote receipt from the dashboard cache", () => {
    const now = new Date().toISOString();
    const receipt = {
      ...receiptInput,
      id: "remote-receipt",
      receipt_number: "BNV-2026-11-0001",
      pdf_url: null,
      created_at: now,
      updated_at: now,
    };
    localStorage.setItem("benovertech-dashboard-cache", JSON.stringify({ receipts: [receipt] }));

    expect(getCachedRemoteReceipt(receipt.id)).toEqual(receipt);
    expect(getCachedRemoteReceipt("missing-receipt")).toBeUndefined();
  });

  it("identifies network fetch failures without masking other errors", () => {
    expect(isNetworkError(new TypeError("Failed to fetch"))).toBe(true);
    expect(isNetworkError({ message: "Network request failed" })).toBe(true);
    expect(isNetworkError(new Error("Invalid input"))).toBe(false);
  });

  it("reports corrupted local receipt data", () => {
    localStorage.setItem("benovertech-local-receipts", "{");

    expect(() => getLocalReceipts()).toThrow();
  });
});
