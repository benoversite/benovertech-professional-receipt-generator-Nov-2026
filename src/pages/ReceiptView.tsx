import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Receipt } from "@/types/receipt";
import { TopBar } from "@/components/TopBar";
import { Footer } from "@/components/Footer";
import { ReceiptDocument } from "@/components/ReceiptDocument";
import { Button } from "@/components/ui/button";
import { getCachedRemoteReceipt, getLocalReceipts, isLocalReceipt, isNetworkError } from "@/lib/localReceipts";
import { isSupabaseConfigured, SUPABASE_CONFIG_ERROR, supabase } from "@/integrations/supabase/client";
import { whatsappLinkForCustomer, BUSINESS, OPEN_SITE_USER_ID } from "@/lib/business";
import { ArrowLeft, Copy, Download, ImageDown, Loader2, MessageCircle } from "lucide-react";
import { toast } from "sonner";

const ReceiptView = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const printRef = useRef<HTMLDivElement>(null);

  const [receipt, setReceipt] = useState<Receipt | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    (async () => {
      let cachedReceipt: Receipt | undefined;
      try {
        const localReceipt = getLocalReceipts().find((saved) => saved.id === id);
        if (localReceipt) {
          setReceipt(localReceipt);
          setLoading(false);
          return;
        }
        cachedReceipt = getCachedRemoteReceipt(id);
        if (cachedReceipt) {
          setReceipt(cachedReceipt);
          setLoading(false);
        }
        if (!isSupabaseConfigured) {
          if (!cachedReceipt) toast.error(SUPABASE_CONFIG_ERROR);
          return;
        }
        const { data, error } = await supabase.from("receipts").select("*").eq("id", id).maybeSingle();
        if (error) throw error;
        if (!active) return;
        if (!data) toast.error("Receipt not found");
        else setReceipt(data as Receipt);
      } catch (error) {
        if (active) {
          if (cachedReceipt && isNetworkError(error)) {
            toast.warning("Connection unavailable. Showing the saved receipt.");
          } else {
            toast.error(isNetworkError(error) ? "Could not load this receipt while offline." : error instanceof Error ? error.message : "Could not load receipt.");
          }
        }
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [id]);

  // Set page title for SEO
  useEffect(() => {
    if (receipt) document.title = `Receipt ${receipt.receipt_number} — ${BUSINESS.name}`;
    return () => { document.title = `${BUSINESS.name} — Premium Receipt System`; };
  }, [receipt]);

  const handleDownload = async () => {
    if (!receipt || !printRef.current) return;
    setDownloading(true);
    try {
      const { downloadBlob, renderReceiptToPdf } = await import("@/lib/pdf");
      const blob = await renderReceiptToPdf(printRef.current, receipt.receipt_number);
      downloadBlob(blob, `${receipt.receipt_number}.pdf`);
      toast.success("PDF downloaded.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "PDF export failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleDownloadJpeg = async () => {
    if (!receipt || !printRef.current) return;
    setDownloading(true);
    try {
      const { downloadBlob, renderReceiptToJpeg } = await import("@/lib/pdf");
      const blob = await renderReceiptToJpeg(printRef.current);
      downloadBlob(blob, `${receipt.receipt_number}.jpg`);
      toast.success("JPEG downloaded.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "JPEG export failed");
    } finally {
      setDownloading(false);
    }
  };

  const handleShare = async () => {
    if (!receipt || !printRef.current) return;
    setSharing(true);
    try {
      const { downloadBlob, renderReceiptToPdf, uploadReceiptPdf } = await import("@/lib/pdf");
      const currentUserId = OPEN_SITE_USER_ID;
      if (!currentUserId) {
        throw new Error("Open-site user ID is not configured. Set VITE_SUPABASE_OPEN_USER_ID.");
      }
      const blob = await renderReceiptToPdf(printRef.current, receipt.receipt_number);
      const localReceipt = isLocalReceipt(receipt.id);
      let pdfUrl = localReceipt ? null : receipt.pdf_url;
      if (!localReceipt && isSupabaseConfigured) {
        try {
          pdfUrl = await uploadReceiptPdf(blob, currentUserId, receipt.receipt_number);
          const { error } = await supabase
            .from("receipts")
            .update({ pdf_url: pdfUrl })
            .eq("id", receipt.id);
          if (error) throw error;
          setReceipt({ ...receipt, pdf_url: pdfUrl });
        } catch (error) {
          if (!isNetworkError(error)) throw error;
        }
      }

      const message = pdfUrl
        ? `Hello ${receipt.customer_name},\n\nThank you for shopping with ${BUSINESS.name}! Here is your receipt ${receipt.receipt_number} for ${receipt.product_name}.\n\nDownload PDF: ${pdfUrl}\n\nWarranty: ${receipt.warranty_note}.\nFor support: ${BUSINESS.phone}.`
        : `Hello ${receipt.customer_name},\n\nThank you for shopping with ${BUSINESS.name}! Your receipt ${receipt.receipt_number} for ${receipt.product_name} is ready. The PDF has been downloaded; please attach it to this WhatsApp chat.\n\nWarranty: ${receipt.warranty_note}.\nFor support: ${BUSINESS.phone}.`;
      if (!pdfUrl) downloadBlob(blob, `${receipt.receipt_number}.pdf`);
      const link = whatsappLinkForCustomer(receipt.customer_phone, message);
      window.open(link, "_blank", "noopener,noreferrer");
      toast.success(pdfUrl ? "WhatsApp opened with PDF link." : "PDF downloaded. Attach it to the WhatsApp message.");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Could not prepare WhatsApp share");
    } finally {
      setSharing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-gold" />
        </main>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="min-h-screen flex flex-col">
        <TopBar />
        <main className="flex-1 flex flex-col items-center justify-center gap-3">
          <p className="text-sm text-muted-foreground">Receipt not found.</p>
          <Link to="/dashboard" className="text-sm text-gold underline">Back to dashboard</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <main className="container mx-auto px-6 pt-8 pb-12 flex-1">
        <button
          onClick={() => navigate("/dashboard")}
          className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to dashboard
        </button>

        <div className="flex items-end justify-between flex-wrap gap-4 animate-fade-up">
          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">Receipt</div>
            <h1 className="display-font mt-2 text-2xl sm:text-3xl md:text-4xl font-semibold tracking-tight">
              <span className="gold-text">{receipt.receipt_number}</span>
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
              Issued to {receipt.customer_name}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 w-full sm:w-auto">
            <Button
              onClick={handleShare} 
              disabled={sharing}
              className="flex-1 sm:flex-initial h-11 rounded-xl bg-gradient-purple text-paper font-semibold hover:opacity-95 transition touch-target"
            >
              {sharing ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <MessageCircle className="h-4 w-4 mr-1.5" />}
              <span className="hidden sm:inline">Send via WhatsApp</span>
              <span className="sm:hidden">Share</span>
            </Button>
            <Button
              onClick={handleDownload} 
              disabled={downloading}
              className="flex-1 sm:flex-initial h-11 rounded-xl bg-gradient-gold text-ink font-semibold hover:opacity-95 shadow-gold transition touch-target"
            >
              {downloading ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Download className="h-4 w-4 mr-1.5" />}
              <span className="hidden sm:inline">Download PDF</span>
              <span className="sm:hidden">PDF</span>
            </Button>
            <Button
              onClick={handleDownloadJpeg}
              disabled={downloading}
              variant="outline"
              className="flex-1 sm:flex-initial h-11 rounded-xl border-border/60 hover:bg-muted/40 transition touch-target"
            >
              <ImageDown className="h-4 w-4 mr-1.5" />
              <span className="hidden sm:inline">Download JPEG</span>
              <span className="sm:hidden">JPEG</span>
            </Button>
            <Button
              variant="outline" 
              className="h-11 rounded-xl border-border/60 hover:bg-muted/40 transition touch-target hidden sm:flex"
              onClick={() => navigate(`/create-receipt?duplicate=${receipt.id}`)}
            >
              <Copy className="h-4 w-4 mr-1.5" /> Duplicate
            </Button>
          </div>
        </div>

        {/* Paper preview */}
        <section className="mt-8 animate-fade-up" style={{ animationDelay: "60ms" }}>
          <div className="mx-auto max-w-[760px]">
            <ReceiptDocument ref={printRef} receipt={receipt} />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default ReceiptView;
