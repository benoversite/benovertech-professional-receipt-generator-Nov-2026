import { forwardRef, useEffect, useState } from "react";
import QRCode from "qrcode";
import { BUSINESS, formatNGN, whatsappLinkForBusiness } from "@/lib/business";
import { Receipt } from "@/types/receipt";

type Props = { receipt: Receipt };

/**
 * Print-ready receipt styled after the supplied BENOVERTECH sales receipt.
 */
export const ReceiptDocument = forwardRef<HTMLDivElement, Props>(({ receipt }, ref) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>("");

  useEffect(() => {
    QRCode.toDataURL(whatsappLinkForBusiness(`Hi BENOVERTECH, regarding receipt ${receipt.receipt_number}`), {
      margin: 1,
      width: 240,
      color: { dark: "#0a0a0a", light: "#ffffff00" },
    })
      .then(setQrDataUrl)
      .catch(() => setQrDataUrl(""));
  }, [receipt.receipt_number]);

  return (
    <div
      ref={ref}
      className="receipt-document mx-auto w-full max-w-[760px] overflow-hidden bg-white text-[#171717] shadow-xl"
    >
      <div className="flex h-1.5">
        <div className="w-1/4 bg-[#f3b923]" />
        <div className="w-1/4 bg-[#7542d8]" />
        <div className="w-1/4 bg-[#f3b923]" />
        <div className="w-1/4 bg-[#222222]" />
      </div>

      <div className="px-6 pt-5 sm:px-8 sm:pt-6">
        <header className="flex flex-col justify-between gap-4 border-b border-[#e7e5e4] pb-5 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <img
              src="/images/benovertech-logo.png"
              alt="BENOVERTECH logo"
              className="h-[68px] w-[100px] shrink-0 object-contain"
              style={{ filter: "brightness(0)" }}
            />
            <div className="min-w-0">
              <h1 className="text-base font-extrabold tracking-wide text-[#171717] sm:text-lg">
                BENOVERTECH GADGETS
              </h1>
              <p className="mt-0.5 text-[9px] font-semibold tracking-[0.18em] text-[#555]">
                IPHONES · LAPTOPS · ACCESSORIES
              </p>
              <p className="mt-2 text-[9px] leading-relaxed text-[#666]">
                {BUSINESS.phone} · {BUSINESS.email}
              </p>
            </div>
          </div>

          <div className="sm:text-right">
            <div className="inline-flex rounded-full bg-[#f4b51b] px-4 py-1 text-[9px] font-extrabold uppercase tracking-[0.15em] text-[#171717]">
              Sales receipt
            </div>
            <p className="number-mono mt-2 text-sm font-extrabold text-[#171717]">
              {receipt.receipt_number}
            </p>
            <p className="mt-1 text-[10px] text-[#777]">
              Date: {new Date(receipt.created_at).toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
                year: "numeric",
              })}
            </p>
          </div>
        </header>

        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 border-b border-[#e7e5e4] py-2.5 text-[9px]">
          <span className="font-extrabold uppercase tracking-[0.16em] text-[#7044c5]">Locations</span>
          <span className="text-[#555]">{BUSINESS.address}</span>
        </div>

        <section className="grid grid-cols-1 gap-4 border-b border-[#e7e5e4] py-4 sm:grid-cols-2">
          <div>
            <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#7044c5]">Billed to</div>
            <div className="mt-1.5 text-[12px] font-bold uppercase text-[#171717]">{receipt.customer_name}</div>
            <div className="mt-1 text-[10px] text-[#555]">Phone: {receipt.customer_phone}</div>
            {receipt.customer_address && (
              <div className="mt-0.5 text-[10px] capitalize text-[#555]">{receipt.customer_address}</div>
            )}
          </div>
          <div className="sm:text-right">
            <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#7044c5]">Payment</div>
            <div className="mt-1.5 text-[12px] font-bold text-[#171717]">Paid in full</div>
            <div className="mt-1 text-[10px] text-[#666]">Reference: {receipt.receipt_number}</div>
          </div>
        </section>

        <div className="mt-4 overflow-hidden">
          <div className="grid grid-cols-[minmax(0,1fr)_30px_75px] items-center gap-1 bg-[#181818] px-3 py-2 text-[8px] font-bold uppercase tracking-wide text-[#f4b51b] sm:grid-cols-[minmax(0,1fr)_90px_48px_120px] sm:gap-2">
            <span>Item</span>
            <span className="hidden text-right sm:block">Category</span>
            <span className="text-right">Qty</span>
            <span className="text-right">Unit price</span>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_30px_75px] items-start gap-1 border-b border-[#e7e5e4] px-3 py-3 text-[10px] sm:grid-cols-[minmax(0,1fr)_90px_48px_120px] sm:gap-2">
            <div className="flex min-w-0 items-start gap-2.5">
              {receipt.product_image_url && (
                <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg border border-[#e7e5e4] bg-[#f7f7f7] p-1 sm:h-[76px] sm:w-[76px]">
                  <img
                    src={receipt.product_image_url}
                    alt={receipt.product_name}
                    className="h-full w-full rounded-md object-contain"
                    crossOrigin="anonymous"
                  />
                </div>
              )}
              <div className="min-w-0 pt-0.5">
                <div className="font-bold uppercase text-[#171717]">{receipt.product_name}</div>
                {(receipt.product_color || receipt.serial_number || receipt.part_number) && (
                  <div className="mt-1 break-words text-[9px] text-[#666]">
                    {[receipt.product_color, receipt.serial_number, receipt.part_number].filter(Boolean).join(" · ")}
                  </div>
                )}
              </div>
            </div>
            <span className="hidden text-right text-[#555] sm:block">Gadgets</span>
            <span className="text-right text-[#555]">1</span>
            <span className="number-mono text-right font-semibold text-[#171717]">{formatNGN(receipt.price)}</span>
          </div>
        </div>

        <div className="ml-auto mt-3 max-w-[300px] space-y-1.5 text-[10px]">
          <div className="flex justify-between gap-4">
            <span className="text-[#666]">Subtotal</span>
            <span className="number-mono text-[#444]">{formatNGN(receipt.price)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-[#666]">Discount</span>
            <span className="number-mono text-[#444]">{formatNGN(0)}</span>
          </div>
          <div className="flex justify-between gap-4 rounded-full bg-[#171717] px-4 py-2.5 text-[#f4b51b]">
            <span className="font-extrabold uppercase tracking-wide">Total</span>
            <span className="number-mono font-extrabold">{formatNGN(receipt.price)}</span>
          </div>
          <div className="flex justify-between gap-4 pt-1 text-[#555]">
            <span>Amount paid</span>
            <span className="number-mono">{formatNGN(receipt.price)}</span>
          </div>
          <div className="flex justify-between gap-4 font-bold text-[#7044c5]">
            <span>Balance</span>
            <span className="number-mono">{formatNGN(0)}</span>
          </div>
        </div>

        <section className="mt-5 rounded-xl border border-[#ebe8f1] bg-[#faf9fc] px-4 py-3.5 text-[9px] leading-relaxed text-[#555] sm:px-5">
          <div className="text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#7044c5]">Warranty</div>
          <p className="mt-1 text-[#333]">{receipt.warranty_note}</p>
          <div className="mt-3 text-[9px] font-extrabold uppercase tracking-[0.2em] text-[#7044c5]">Notice</div>
          <p className="mt-1 font-bold uppercase text-[#222]">No refunds after payment</p>
          <p className="mt-1.5">
            Please inspect and verify all items before leaving the store. Once payment has been made
            and the goods received in good condition, all sales are final and no refunds will be issued.
          </p>
          <p className="mt-1.5">
            Exchanges or warranty claims, where applicable, are handled according to the manufacturer's
            warranty terms and our store policy.
          </p>
          <p className="mt-1.5">Thank you for choosing BENOVERTECH GADGETS.</p>
        </section>

        <footer className="flex flex-col items-center justify-between gap-4 py-5 sm:flex-row">
          <div className="text-center sm:text-left">
            <h2 className="text-[13px] font-extrabold text-[#171717]">Thank you for your patronage.</h2>
            <p className="mt-1 max-w-[410px] text-[9px] leading-relaxed text-[#666]">
              Goods sold in good condition and must not be returned except covered under warranty.
              Please retain your receipt for warranty claims and verification.
            </p>
            <p className="mt-2 text-[9px] font-semibold text-[#7044c5]">
              {BUSINESS.phone} · {BUSINESS.email}
            </p>
          </div>
          {qrDataUrl && (
            <img
              src={qrDataUrl}
              alt="Scan to chat with BENOVERTECH on WhatsApp"
              className="h-[84px] w-[84px] shrink-0 rounded-lg border-2 border-[#f4b51b] bg-white p-1.5"
            />
          )}
        </footer>
      </div>
    </div>
  );
});

ReceiptDocument.displayName = "ReceiptDocument";
