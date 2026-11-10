import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Download, Share2, X } from 'lucide-react';

interface ReceiptItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  profit?: number;
}

interface ReceiptProps {
  saleId: string;
  customerName: string;
  customerPhone?: string;
  items: ReceiptItem[];
  totalAmount: number;
  paymentMethod: string;
  date?: Date;
  onClose: () => void;
}

export const Receipt: React.FC<ReceiptProps> = ({
  saleId,
  customerName,
  customerPhone,
  items,
  totalAmount,
  paymentMethod,
  date = new Date(),
  onClose,
}) => {
  const receiptRef = useRef<HTMLDivElement>(null);

  // Generate receipt number
  const generateReceiptNumber = (id: string) => {
    const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
    const lastFour = id.slice(-4).toUpperCase();
    return `BNV-${dateStr.slice(0, 4)}-${dateStr.slice(4)}-${lastFour}`;
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  // Format date
  const formatDate = (d: Date) => {
    return d.toLocaleDateString('en-NG', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Download PDF
  const handleDownloadPDF = async () => {
    if (!receiptRef.current) return;

    try {
      const canvas = await html2canvas(receiptRef.current, {
        backgroundColor: '#ffffff',
        scale: 2,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`receipt-${generateReceiptNumber(saleId)}.pdf`);
    } catch (err) {
      console.error('PDF generation failed:', err);
      alert('Failed to generate PDF');
    }
  };

  // Send via WhatsApp
  const handleWhatsApp = () => {
    const receiptDetails = items
      .map((item) => `• ${item.productName} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`)
      .join('\n');

    const message = `Hello ${customerName}, your receipt from BENOVERTECH GADGETS is ready.\n\nReceipt: ${generateReceiptNumber(saleId)}\nDate: ${formatDate(date)}\n\nItems:\n${receiptDetails}\n\n💰 Total: ${formatCurrency(totalAmount)}\n📱 Payment: ${paymentMethod}\n\nThank you for your purchase!\n7-Day Service Warranty included.`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappPhone = customerPhone?.replace(/\D/g, '') || '2348107271610';
    const whatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodedMessage}`;

    window.open(whatsappUrl, '_blank');
  };

  const receiptNumber = generateReceiptNumber(saleId);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header with close button */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white rounded-t-2xl">
          <h2 className="text-2xl font-bold text-gray-900">Receipt</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            aria-label="Close receipt"
          >
            <X className="w-6 h-6 text-gray-500" />
          </button>
        </div>

        {/* Receipt Content */}
        <div ref={receiptRef} className="p-8 bg-white">
          {/* Business Header */}
          <div className="text-center mb-8 pb-8 border-b-2 border-gray-900">
            <div className="mb-2">
              <div className="inline-block px-4 py-2 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg">
                <h1 className="text-3xl font-black text-white tracking-tight">BENOVERTECH</h1>
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-3 font-medium">Premium Mobile Devices</p>
          </div>

          {/* Receipt Number & Date */}
          <div className="grid grid-cols-2 gap-4 mb-8 pb-6 border-b border-gray-300">
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Receipt #</p>
              <p className="text-lg font-bold text-gray-900">{receiptNumber}</p>
            </div>
            <div>
              <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide">Date & Time</p>
              <p className="text-lg font-bold text-gray-900">{formatDate(date)}</p>
            </div>
          </div>

          {/* Customer Information */}
          <div className="mb-8 pb-6 border-b border-gray-300">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-2">Customer</p>
            <p className="text-lg font-semibold text-gray-900">{customerName}</p>
            {customerPhone && (
              <p className="text-gray-600 text-sm mt-1">📱 {customerPhone}</p>
            )}
          </div>

          {/* Items */}
          <div className="mb-8 pb-6 border-b border-gray-300">
            <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">Items</p>
            <div className="space-y-4">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{item.productName}</p>
                    <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      {formatCurrency(item.price * item.quantity)}
                    </p>
                    <p className="text-xs text-gray-500">@ {formatCurrency(item.price)}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing Section */}
          <div className="mb-8 pb-6 border-b-2 border-gray-900">
            <div className="flex justify-between mb-2">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">{formatCurrency(subtotal)}</span>
            </div>
          </div>

          {/* Total */}
          <div className="mb-8 pb-6 border-b border-gray-300">
            <div className="flex justify-between items-center">
              <span className="text-lg font-bold text-gray-900">Total Paid</span>
              <span className="text-4xl font-black text-gray-900">
                {formatCurrency(totalAmount)}
              </span>
            </div>
            <div className="mt-3 flex justify-between">
              <span className="text-sm text-gray-600">Payment Method:</span>
              <span className="font-semibold text-gray-900">{paymentMethod}</span>
            </div>
          </div>

          {/* Warranty Note */}
          <div className="mb-8 pb-6 border-b border-gray-300 bg-gradient-to-r from-yellow-50 to-orange-50 p-4 rounded-lg">
            <p className="text-xs font-bold text-gray-900 uppercase tracking-wide mb-2">⭐ Warranty</p>
            <p className="text-xs text-gray-700 leading-relaxed">
              7-Day Service Warranty covering factory defects only. Does not cover physical or water damage.
            </p>
          </div>

          {/* Footer */}
          <div className="text-center">
            <p className="text-gray-500 text-xs font-medium mb-2">📞 08107271610</p>
            <p className="text-gray-500 text-xs font-medium mb-4">✉️ benovertech@gmail.com</p>
            <p className="text-gray-400 text-xs">14 Benson Ojukwu Street, Lagos</p>
            <p className="text-gray-400 text-xs mt-1">Thank you for your purchase!</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="sticky bottom-0 flex gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={handleDownloadPDF}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-900 text-white rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            <Download className="w-5 h-5" />
            Download PDF
          </button>
          <button
            onClick={handleWhatsApp}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            <Share2 className="w-5 h-5" />
            WhatsApp
          </button>
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-white text-gray-900 border-2 border-gray-900 rounded-lg font-semibold hover:bg-gray-50 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
