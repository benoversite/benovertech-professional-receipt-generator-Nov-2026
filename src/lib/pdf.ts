import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { supabase } from "@/integrations/supabase/client";

async function renderReceiptCanvas(element: HTMLElement): Promise<HTMLCanvasElement> {
  return html2canvas(element, {
    backgroundColor: "#ffffff",
    scale: 2,
    useCORS: true,
    logging: false,
    windowWidth: element.scrollWidth,
  });
}

export async function renderReceiptToJpeg(element: HTMLElement): Promise<Blob> {
  const canvas = await renderReceiptCanvas(element);
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("Could not encode receipt as JPEG."))),
      "image/jpeg",
      0.95
    );
  });
}

export async function renderReceiptToPdf(element: HTMLElement, _fileName: string): Promise<Blob> {
  const canvas = await renderReceiptCanvas(element);
  const imgData = canvas.toDataURL("image/jpeg", 0.95);
  const pdf = new jsPDF({ orientation: "p", unit: "pt", format: "a4" });
  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();

  const imgWidth = pageWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pageHeight) {
    pdf.addImage(imgData, "JPEG", 0, 0, imgWidth, imgHeight);
  } else {
    // Multi-page slicing
    let position = 0;
    let heightLeft = imgHeight;
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }
  }

  const blob = pdf.output("blob");
  return blob;
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function uploadReceiptPdf(
  blob: Blob,
  userId: string,
  receiptNumber: string
): Promise<string> {
  const path = `${userId}/${receiptNumber}.pdf`;
  const { error } = await supabase.storage
    .from("receipt-pdfs")
    .upload(path, blob, {
      contentType: "application/pdf",
      upsert: true,
    });
  if (error) throw error;
  const { data } = supabase.storage.from("receipt-pdfs").getPublicUrl(path);
  return data.publicUrl;
}
