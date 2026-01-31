import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SecureNotificationRequest {
  orderId: string;
}

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mask sensitive data
const maskPhone = (phone: string): string => {
  if (phone.length <= 6) return "****";
  return phone.substring(0, 4) + "****" + phone.substring(phone.length - 3);
};

const maskName = (name: string): string => {
  const parts = name.split(" ");
  return parts.map(part => {
    if (part.length <= 2) return part[0] + "*";
    return part[0] + "*".repeat(part.length - 2) + part[part.length - 1];
  }).join(" ");
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const TELEGRAM_BOT_TOKEN = Deno.env.get("TELEGRAM_BOT_TOKEN");
    const TELEGRAM_CHAT_ID = Deno.env.get("TELEGRAM_CHAT_ID");
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      console.error("Missing Telegram configuration");
      throw new Error("Telegram configuration missing");
    }

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.error("Missing Supabase configuration");
      throw new Error("Supabase configuration missing");
    }

    // Create Supabase client with service role for secure data access
    const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Only receive orderId from client - fetch all data server-side
    const { orderId }: SecureNotificationRequest = await req.json();
    
    // Validate orderId format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!orderId || typeof orderId !== 'string' || !uuidRegex.test(orderId)) {
      console.error("Invalid order ID format:", orderId);
      throw new Error("Invalid order ID format");
    }

    console.log("Processing notification for order:", orderId);

    // Fetch order data securely from database
    const { data: orderData, error: fetchError } = await supabaseAdmin
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (fetchError || !orderData) {
      console.error("Failed to fetch order:", fetchError);
      throw new Error("Order not found");
    }

    // Security: Only allow notifications for recently created orders (within 1 hour)
    const orderCreatedAt = new Date(orderData.created_at);
    const now = new Date();
    const hoursDiff = (now.getTime() - orderCreatedAt.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 1) {
      console.error("Order too old for notification:", orderId, "created:", orderData.created_at);
      throw new Error("Order notification window expired");
    }

    // Security: Only allow notification for orders with payment proof (just uploaded)
    if (!orderData.payment_proof_url) {
      console.error("Order has no payment proof:", orderId);
      throw new Error("Payment proof required");
    }

    // Build message with masked sensitive data for logging but full data for admin Telegram
    const message = `
🔔 *BUKTI PEMBAYARAN BARU*

📦 *Detail Pesanan:*
━━━━━━━━━━━━━━━━
🔢 No. Pesanan: \`${orderData.order_number}\`
👤 Nama: ${orderData.customer_name}
📱 HP: ${orderData.customer_phone}
💎 Produk: ${orderData.product_name}
⚖️ Berat: ${orderData.product_weight}
📦 Qty: ${orderData.quantity}
💰 Total: ${formatCurrency(orderData.total_price)}

🔐 *KODE KONFIRMASI:* \`${orderData.confirmation_code || 'N/A'}\`

🖼️ *Bukti Pembayaran:*
${orderData.payment_proof_url || 'Tidak ada'}

🚚 *Pengiriman:* ${orderData.shipping_method}
📍 *Alamat:* ${orderData.customer_address}

⏰ Waktu: ${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })}
━━━━━━━━━━━━━━━━
📌 Berikan kode konfirmasi ke customer setelah verifikasi pembayaran!
    `.trim();

    // Log only masked data for security
    console.log("Sending notification for order:", orderData.order_number, "Customer:", maskName(orderData.customer_name));

    // Send text message
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    const response = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message,
        parse_mode: "Markdown",
      }),
    });

    const result = await response.json();
    
    if (!result.ok) {
      console.error("Telegram API error:", result.description);
      throw new Error(`Telegram API error: ${result.description}`);
    }

    console.log("Notification sent successfully for order:", orderData.order_number);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json", ...corsHeaders },
    });
  } catch (error: any) {
    console.error("Error sending Telegram notification:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
