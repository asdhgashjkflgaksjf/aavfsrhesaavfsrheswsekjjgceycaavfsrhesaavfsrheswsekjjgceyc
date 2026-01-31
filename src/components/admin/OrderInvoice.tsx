import { forwardRef, type CSSProperties } from 'react';
import logoAntam from "@/assets/logo-antam.png";
import lmWatermark from "@/assets/lm-watermark.png";

interface OrderInvoiceProps {
  order: {
    order_number: string;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    customer_address: string;
    product_name: string;
    product_weight: string;
    product_price: number;
    quantity: number;
    total_price: number;
    shipping_method: string;
    status: string;
    confirmation_code: string | null;
    created_at: string;
  };
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    'pending_payment': 'Belum Lunas',
    'payment_uploaded': 'Sedang Diproses',
    'processing': 'Sedang Diproses',
    'shipped': 'Dalam Pengiriman',
    'completed': 'Lunas',
    'cancelled': 'Dibatalkan'
  };
  return labels[status] || status;
};

const getStatusStyle = (status: string): CSSProperties => {
  switch (status) {
    case 'completed':
      return { backgroundColor: '#dcfce7', color: '#166534', border: '1px solid #86efac' };
    case 'payment_uploaded':
    case 'processing':
    case 'shipped':
      return { backgroundColor: '#fef9c3', color: '#854d0e', border: '1px solid #fde047' };
    case 'pending_payment':
      return { backgroundColor: '#fee2e2', color: '#991b1b', border: '1px solid #fca5a5' };
    case 'cancelled':
      return { backgroundColor: '#f3f4f6', color: '#374151', border: '1px solid #d1d5db' };
    default:
      return { backgroundColor: '#fef3c7', color: '#92400e', border: '1px solid #fcd34d' };
  }
};

const OrderInvoice = forwardRef<HTMLDivElement, OrderInvoiceProps>(({ order }, ref) => {
  const today = new Date().toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const orderDate = new Date(order.created_at).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const subtotal = order.product_price * order.quantity;
  const tax = Math.round(subtotal * 0.0025);
  const shippingCost = order.shipping_method === "Ambil di Butik" ? 0 : 50000;
  const statusStyle = getStatusStyle(order.status);

  return (
    <div 
      ref={ref} 
      style={{ 
        fontFamily: 'Arial, sans-serif',
        backgroundColor: 'white',
        padding: '32px',
        color: '#1f2937',
        minWidth: '600px',
        position: 'relative'
      }}
    >
      {/* Watermark - positioned absolutely in center */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        opacity: 0.08,
        pointerEvents: 'none',
        zIndex: 0
      }}>
        <img 
          src={lmWatermark} 
          alt="" 
          style={{ width: '280px', height: 'auto' }}
        />
      </div>

      {/* Main Content */}
      <div style={{ position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'flex-start',
          marginBottom: '24px',
          paddingBottom: '16px',
          borderBottom: '2px solid #d97706'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <img 
              src={logoAntam} 
              alt="PT ANTAM Tbk" 
              style={{ height: '64px', objectFit: 'contain' }}
            />
            <div>
              <h1 style={{ fontSize: '20px', fontWeight: 'bold', color: '#1f2937', margin: 0 }}>
                LOGAM MULIA GOLD
              </h1>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>
                Partner Resmi PT ANTAM Tbk
              </p>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', color: '#d97706', margin: 0 }}>
              INVOICE
            </h2>
            <p style={{ fontSize: '14px', color: '#4b5563', marginTop: '4px' }}>
              #{order.order_number}
            </p>
            <p style={{ fontSize: '14px', color: '#6b7280' }}>{orderDate}</p>
          </div>
        </div>

        {/* Status Badge */}
        <div style={{ 
          marginBottom: '24px',
          padding: '12px 16px',
          borderRadius: '8px',
          ...statusStyle
        }}>
          <span style={{ fontSize: '14px' }}>Status Pesanan: </span>
          <span style={{ fontWeight: '600' }}>{getStatusLabel(order.status)}</span>
        </div>

        {/* Customer Info */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b7280', 
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Ditagihkan Kepada:
          </h3>
          <div style={{ backgroundColor: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
            <p style={{ fontWeight: '600', color: '#1f2937', fontSize: '18px', margin: 0 }}>
              {order.customer_name}
            </p>
            <p style={{ color: '#4b5563', margin: '4px 0' }}>{order.customer_phone}</p>
            <p style={{ color: '#4b5563', margin: 0 }}>{order.customer_email}</p>
            <p style={{ color: '#4b5563', marginTop: '8px' }}>{order.customer_address}</p>
          </div>
        </div>

        {/* Order Table */}
        <div style={{ marginBottom: '24px' }}>
          <h3 style={{ 
            fontSize: '12px', 
            fontWeight: '600', 
            color: '#6b7280', 
            textTransform: 'uppercase',
            marginBottom: '8px'
          }}>
            Detail Pesanan:
          </h3>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f3f4f6' }}>
                <th style={{ textAlign: 'left', padding: '12px 16px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Produk</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Berat</th>
                <th style={{ textAlign: 'center', padding: '12px 16px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Qty</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Harga</th>
                <th style={{ textAlign: 'right', padding: '12px 16px', fontWeight: '600', color: '#374151', borderBottom: '2px solid #e5e7eb' }}>Subtotal</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{ padding: '12px 16px', borderBottom: '1px solid #f3f4f6' }}>{order.product_name}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{order.product_weight}</td>
                <td style={{ padding: '12px 16px', textAlign: 'center', borderBottom: '1px solid #f3f4f6' }}>{order.quantity}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>{formatCurrency(order.product_price)}</td>
                <td style={{ padding: '12px 16px', textAlign: 'right', borderBottom: '1px solid #f3f4f6' }}>{formatCurrency(subtotal)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '24px' }}>
          <div style={{ width: '288px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563' }}>Subtotal</span>
              <span style={{ color: '#1f2937' }}>{formatCurrency(subtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563' }}>Pajak (0.25%)</span>
              <span style={{ color: '#1f2937' }}>{formatCurrency(tax)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: '1px solid #e5e7eb' }}>
              <span style={{ color: '#4b5563' }}>Pengiriman ({order.shipping_method})</span>
              <span style={{ color: '#1f2937' }}>
                {order.shipping_method === "Ambil di Butik" ? "GRATIS" : formatCurrency(shippingCost)}
              </span>
            </div>
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              padding: '12px', 
              backgroundColor: '#fef3c7',
              borderRadius: '8px',
              marginTop: '8px'
            }}>
              <span style={{ fontWeight: 'bold', color: '#1f2937' }}>Total</span>
              <span style={{ fontWeight: 'bold', color: '#d97706', fontSize: '18px' }}>{formatCurrency(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Payment Instructions */}
        <div style={{ 
          marginBottom: '24px', 
          padding: '16px', 
          backgroundColor: '#eff6ff', 
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <h4 style={{ fontWeight: '600', color: '#1e40af', marginBottom: '8px' }}>Instruksi Pembayaran:</h4>
          <p style={{ fontSize: '14px', color: '#1d4ed8', margin: 0 }}>
            Silakan lakukan pembayaran melalui QRIS atau transfer bank. Setelah melakukan pembayaran, 
            mohon upload bukti pembayaran melalui halaman status pesanan.
          </p>
        </div>

        {/* Footer */}
        <div style={{ paddingTop: '16px', borderTop: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Dokumen ini dicetak pada:</p>
              <p style={{ fontSize: '14px', color: '#4b5563', margin: 0 }}>{today}</p>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '14px', color: '#4b5563', marginBottom: '24px' }}>Hormat kami,</p>
              <p style={{ fontWeight: '600', color: '#1f2937', margin: 0 }}>Admin Logam Mulia Gold</p>
              <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>Authorized Signature</p>
            </div>
          </div>
          <p style={{ 
            textAlign: 'center', 
            fontSize: '12px', 
            color: '#9ca3af', 
            marginTop: '24px', 
            paddingTop: '16px',
            borderTop: '1px solid #f3f4f6'
          }}>
            Terima kasih atas kepercayaan Anda berbelanja di Logam Mulia Gold - Partner Resmi PT ANTAM Tbk
          </p>
        </div>
      </div>
    </div>
  );
});

OrderInvoice.displayName = 'OrderInvoice';

export default OrderInvoice;
