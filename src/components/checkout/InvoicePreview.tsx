import { User, MapPin, Package, Truck, Store } from "lucide-react";
import logoAntam from "@/assets/logo-antam.png";

interface InvoicePreviewProps {
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  productName: string;
  productWeight: string;
  productPrice: number;
  quantity: number;
  shippingMethod: string;
  shippingCost: number;
  totalPrice: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const InvoicePreview = ({
  orderNumber,
  customerName,
  customerEmail,
  customerPhone,
  customerAddress,
  productName,
  productWeight,
  productPrice,
  quantity,
  shippingMethod,
  shippingCost,
  totalPrice,
}: InvoicePreviewProps) => {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const invoiceNumber = `INV-${Date.now().toString().slice(-10)}`;
  const paymentNumber = `LM-PAY/${new Date().getFullYear()}/${Math.floor(Math.random() * 999) + 1}`;
  const subtotal = productPrice * quantity;
  const tax = Math.round(subtotal * 0.0025); // 0.25% pajak

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Header with Logo */}
      <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200 px-4 py-4">
        <div className="flex flex-col items-center gap-2">
          <img 
            src={logoAntam} 
            alt="PT ANTAM Tbk" 
            className="h-10 sm:h-12 object-contain"
          />
          <div className="text-center">
            <h2 className="font-bold text-gray-800 text-base sm:text-lg tracking-wide">
              INSTRUKSI PEMBAYARAN
            </h2>
          </div>
        </div>
      </div>

      {/* Invoice Numbers */}
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
        <div className="flex flex-col sm:flex-row sm:justify-between text-xs sm:text-sm">
          <p className="text-gray-600">
            <span className="font-medium">No:</span> {paymentNumber}
          </p>
          <p className="text-gray-600">
            <span className="font-medium">Invoice:</span> {orderNumber}
          </p>
          <p className="text-gray-600">{today}</p>
        </div>
      </div>

      {/* Greeting */}
      <div className="px-4 py-3 border-b border-gray-100">
        <p className="text-gray-700 text-sm leading-relaxed">
          Yang terhormat,
          <br /><br />
          Terima kasih atas kepercayaan Anda melakukan pemesanan produk Logam Mulia. 
          Berikut kami sampaikan rincian pesanan dan instruksi pembayaran.
        </p>
      </div>

      <div className="p-4 space-y-3 text-gray-800">
        {/* Order Details Table */}
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600 w-2/5">Nama Pemesan</td>
                <td className="py-2 px-3 text-gray-800">{customerName}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Produk</td>
                <td className="py-2 px-3 text-gray-800">{productName}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Jumlah</td>
                <td className="py-2 px-3 text-gray-800">{quantity} pcs</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">
                  {shippingMethod === "Ambil di Butik" ? "Lokasi Pengambilan" : "Alamat Pengiriman"}
                </td>
                <td className="py-2 px-3 text-gray-800 text-xs leading-relaxed">
                  {shippingMethod === "Ambil di Butik" 
                    ? "Butik Mas Antam - Alamat akan diinformasikan via WhatsApp" 
                    : customerAddress}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Ekspedisi</td>
                <td className="py-2 px-3 text-gray-800 flex items-center gap-2">
                  {shippingMethod === "Ambil di Butik" ? (
                    <>
                      <Store className="w-4 h-4 text-green-600" />
                      <span className="text-green-600 font-medium">Gratis Ambil di Butik</span>
                    </>
                  ) : (
                    shippingMethod
                  )}
                </td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Subtotal</td>
                <td className="py-2 px-3 text-gray-800">{formatCurrency(subtotal)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Pajak (0.25%)</td>
                <td className="py-2 px-3 text-gray-800">{formatCurrency(tax)}</td>
              </tr>
              <tr className="border-b border-gray-100">
                <td className="py-2 px-3 bg-gray-50 font-medium text-gray-600">Ongkir</td>
                <td className="py-2 px-3 text-gray-800">
                  {shippingCost === 0 ? (
                    <span className="text-green-600 font-medium">GRATIS</span>
                  ) : (
                    formatCurrency(shippingCost)
                  )}
                </td>
              </tr>
              <tr className="bg-amber-50">
                <td className="py-3 px-3 font-bold text-gray-700">Total Pembayaran</td>
                <td className="py-3 px-3 font-bold text-amber-600 text-base">
                  {formatCurrency(totalPrice + tax)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Payment Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-gray-700 font-medium mb-2">
            Silakan lakukan pembayaran melalui QRIS pada langkah berikutnya.
          </p>
          <p className="text-xs text-gray-600">
            Setelah melakukan pembayaran, mohon upload bukti transfer untuk proses verifikasi.
          </p>
        </div>

        {/* Signature */}
        <div className="text-right pt-2 border-t border-gray-100">
          <p className="text-xs text-gray-500">Hormat kami,</p>
          <p className="text-sm font-semibold text-gray-700 mt-1">Manajer Operasional</p>
          <p className="text-xs text-gray-400 mt-1">{today}</p>
        </div>

        {/* Footer */}
        <p className="text-xs text-gray-500 text-center italic border-t border-gray-100 pt-3">
          Terima kasih atas kepercayaan Anda berbelanja di Butik Mas Antam - Partner Resmi PT ANTAM Tbk
        </p>
      </div>
    </div>
  );
};

export default InvoicePreview;
