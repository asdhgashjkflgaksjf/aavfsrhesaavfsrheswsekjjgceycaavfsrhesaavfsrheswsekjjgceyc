import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface OrderStatusNotification {
  orderId: string;
  newStatus: string;
  customerName: string;
  customerPhone: string;
  orderNumber: string;
  productName: string;
  productWeight: string;
  quantity: number;
  totalPrice: number;
  shippingMethod: string;
  trackingNumber?: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const getStatusMessage = (data: OrderStatusNotification): string => {
  const { 
    newStatus, 
    customerName, 
    orderNumber, 
    productName, 
    productWeight, 
    quantity, 
    totalPrice, 
    shippingMethod,
    trackingNumber 
  } = data;

  const greeting = `Yth. Bapak/Ibu *${customerName}*,`;
  const orderInfo = `📦 *Detail Pesanan*
━━━━━━━━━━━━━━━━━━
No. Pesanan: *${orderNumber}*
Produk: ${productName}
Berat: ${productWeight}
Jumlah: ${quantity} pcs
Total: ${formatCurrency(totalPrice)}
Pengiriman: ${shippingMethod}`;

  const footer = `
━━━━━━━━━━━━━━━━━━
Terima kasih telah berbelanja di *Logam Mulia Gold*.

Jika ada pertanyaan, silakan hubungi kami.

_Pesan ini dikirim otomatis oleh sistem._`;

  switch (newStatus) {
    case 'payment_uploaded':
      return `${greeting}

✅ *BUKTI PEMBAYARAN DITERIMA*

Kami telah menerima bukti pembayaran Anda untuk pesanan berikut:

${orderInfo}

🔍 Tim kami sedang memverifikasi pembayaran Anda. Proses verifikasi membutuhkan waktu *1x24 jam kerja*.

Anda akan menerima notifikasi selanjutnya setelah pembayaran terverifikasi.
${footer}`;

    case 'processing':
      return `${greeting}

🎉 *PEMBAYARAN TERVERIFIKASI*

Selamat! Pembayaran Anda telah kami verifikasi dan pesanan sedang diproses.

${orderInfo}

⏳ *Status:* Pesanan Sedang Diproses

Tim kami sedang menyiapkan produk Anda dengan teliti. Estimasi pengiriman *1-2 hari kerja*.

Anda akan menerima notifikasi dengan nomor resi pengiriman setelah pesanan dikirim.
${footer}`;

    case 'shipped':
      const trackingInfo = trackingNumber 
        ? `\n\n🚚 *Nomor Resi:* ${trackingNumber}\nSilakan lacak pengiriman Anda melalui website kurir ${shippingMethod}.`
        : '';

      return `${greeting}

📮 *PESANAN TELAH DIKIRIM*

Kabar gembira! Pesanan Anda telah dikirim dan sedang dalam perjalanan.

${orderInfo}
${trackingInfo}

⏳ *Estimasi Tiba:* 2-5 hari kerja (tergantung lokasi)

Mohon pastikan Anda atau penerima yang ditunjuk tersedia untuk menerima paket.
${footer}`;

    case 'completed':
      return `${greeting}

✨ *PESANAN SELESAI*

Terima kasih! Pesanan Anda telah selesai.

${orderInfo}

🌟 Kami harap Anda puas dengan produk dan layanan kami.

Jangan lupa untuk:
• Simpan produk di tempat yang aman
• Periksa keaslian dengan sertifikat yang disertakan
• Berikan ulasan untuk membantu pelanggan lain

Sampai jumpa di pesanan berikutnya! 💛
${footer}`;

    case 'cancelled':
      return `${greeting}

❌ *PESANAN DIBATALKAN*

Dengan menyesal kami informasikan bahwa pesanan berikut telah dibatalkan:

${orderInfo}

Jika Anda memiliki pertanyaan terkait pembatalan ini atau ingin melakukan pemesanan ulang, silakan hubungi tim kami.
${footer}`;

    default:
      return `${greeting}

📢 *UPDATE STATUS PESANAN*

Status pesanan Anda telah diperbarui:

${orderInfo}

Status Baru: *${newStatus}*
${footer}`;
  }
};

const cleanPhoneNumber = (phone: string): string => {
  // Remove all non-numeric characters
  let cleaned = phone.replace(/\D/g, '');
  
  // If starts with 0, replace with 62 (Indonesia code)
  if (cleaned.startsWith('0')) {
    cleaned = '62' + cleaned.substring(1);
  }
  
  // If doesn't start with country code, add 62
  if (!cleaned.startsWith('62')) {
    cleaned = '62' + cleaned;
  }
  
  return cleaned;
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const notificationData: OrderStatusNotification = await req.json();
    
    console.log('Received notification request:', notificationData);

    // Get WhatsApp number from settings
    const { data: settingsData } = await supabase
      .from('settings')
      .select('value')
      .eq('key', 'whatsapp_number')
      .single();

    const storeWhatsApp = settingsData?.value || '6282261152700';
    
    // Format customer phone
    const customerPhone = cleanPhoneNumber(notificationData.customerPhone);
    
    // Generate message
    const message = getStatusMessage(notificationData);
    
    // Create WhatsApp URL (using wa.me deep link)
    const whatsappUrl = `https://wa.me/${customerPhone}?text=${encodeURIComponent(message)}`;
    
    console.log('Generated WhatsApp message for status:', notificationData.newStatus);
    console.log('Customer phone:', customerPhone);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'WhatsApp notification prepared',
        whatsappUrl,
        messagePreview: message.substring(0, 200) + '...',
        customerPhone
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );

  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error preparing WhatsApp notification:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: errorMessage
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});