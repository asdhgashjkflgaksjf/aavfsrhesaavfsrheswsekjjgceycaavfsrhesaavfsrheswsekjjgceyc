import { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { 
  CheckCircle, Clock, Package, Truck, MessageCircle, ArrowLeft, 
  Shield, Copy, Check, KeyRound, Loader2, Sparkles, PartyPopper,
  Timer, Gift, MapPin, Phone, Mail, User, Lock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

interface Order {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  shipping_method: string;
  product_name: string;
  product_weight: string;
  product_price: number;
  quantity: number;
  total_price: number;
  payment_proof_url: string | null;
  status: string;
  created_at: string;
  confirmation_code: string | null;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Mask sensitive data for display
const maskEmail = (email: string) => {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  return `${local.substring(0, 2)}${"*".repeat(Math.max(local.length - 2, 3))}@${domain}`;
};

const maskPhone = (phone: string) => {
  if (!phone || phone.length < 4) return phone;
  return `${"*".repeat(phone.length - 4)}${phone.slice(-4)}`;
};

const maskAddress = (address: string) => {
  if (!address) return "";
  // Only show city/area name at the end
  const parts = address.split(",");
  if (parts.length >= 2) {
    return `*****, ${parts[parts.length - 2].trim()}, ${parts[parts.length - 1].trim()}`;
  }
  return "*****";
};

const OrderStatus = () => {
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get("order");
  const confirmCodeFromUrl = searchParams.get("code");
  
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [confirmCode, setConfirmCode] = useState(confirmCodeFromUrl || "");
  const [isVerifying, setIsVerifying] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authCode, setAuthCode] = useState("");

  // Try to fetch order - requires confirmation code for non-admins
  const fetchOrder = async (code?: string) => {
    if (!orderNumber) {
      setLoading(false);
      return;
    }

    const codeToUse = code || confirmCodeFromUrl;
    
    // Call RPC with confirmation code (required for non-admins)
    const { data, error } = await supabase.rpc('get_order_by_order_number', {
      p_order_number: orderNumber,
      p_confirmation_code: codeToUse || null
    });

    if (error) {
      console.error("Error fetching order:", error);
      toast.error("Gagal memuat data pesanan");
      setLoading(false);
      return;
    }
    
    // RPC returns array, get first item
    const orderData = Array.isArray(data) && data.length > 0 ? data[0] : null;
    
    if (orderData) {
      setOrder(orderData);
      setIsAuthenticated(true);
    } else if (codeToUse) {
      // Code was provided but no match found
      toast.error("Kode konfirmasi tidak valid");
    }
    
    setLoading(false);
  };

  useEffect(() => {
    fetchOrder();
  }, [orderNumber, confirmCodeFromUrl]);

  const handleAuthSubmit = async () => {
    if (!authCode.trim()) {
      toast.error("Masukkan kode konfirmasi");
      return;
    }
    
    setIsVerifying(true);
    await fetchOrder(authCode.trim().toUpperCase());
    setIsVerifying(false);
  };

  const copyOrderNumber = () => {
    if (order?.order_number) {
      navigator.clipboard.writeText(order.order_number);
      setCopied(true);
      toast.success("Nomor pesanan disalin!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const openWhatsApp = () => {
    let messageContent = "";
    
    if (order?.status === "processing") {
      messageContent = 
        `Halo Admin, saya ingin menanyakan update pesanan saya:\n\n` +
        `📦 No. Pesanan: ${order?.order_number}\n` +
        `👤 Nama: ${order?.customer_name}\n` +
        `💎 Produk: ${order?.product_name} (${order?.product_weight})\n` +
        `📍 Pengiriman: ${order?.shipping_method}\n` +
        `💰 Total: ${formatCurrency(order?.total_price || 0)}\n\n` +
        `Mohon informasikan estimasi pengiriman pesanan saya. Terima kasih!`;
    } else if (order?.status === "shipped") {
      messageContent = 
        `Halo Admin, saya ingin tracking pesanan saya:\n\n` +
        `📦 No. Pesanan: ${order?.order_number}\n` +
        `👤 Nama: ${order?.customer_name}\n` +
        `💎 Produk: ${order?.product_name}\n\n` +
        `Mohon informasikan nomor resi pengiriman. Terima kasih!`;
    } else {
      messageContent = 
        `Halo Admin, saya ingin konfirmasi pesanan:\n\n` +
        `📦 No. Pesanan: ${order?.order_number}\n` +
        `👤 Nama: ${order?.customer_name}\n` +
        `💎 Produk: ${order?.product_name}\n` +
        `💰 Total: ${formatCurrency(order?.total_price || 0)}\n\n` +
        `Mohon berikan kode konfirmasi untuk memproses pesanan. Terima kasih!`;
    }
    
    const message = encodeURIComponent(messageContent);
    window.open(`https://wa.me/6281234567890?text=${message}`, "_blank");
  };

  const verifyConfirmationCode = async () => {
    if (!confirmCode.trim()) {
      toast.error("Masukkan kode konfirmasi");
      return;
    }

    if (!order) return;

    setIsVerifying(true);
    
    if (confirmCode.trim().toUpperCase() === order.confirmation_code?.toUpperCase()) {
      const { error } = await supabase
        .from("orders")
        .update({ status: "processing" })
        .eq("id", order.id);

      if (error) {
        console.error("Update error:", error);
        toast.error("Gagal memperbarui status pesanan");
      } else {
        setOrder({ ...order, status: "processing" });
        toast.success("Kode valid! Pesanan Anda sedang diproses 🎉");
        setConfirmCode("");
      }
    } else {
      toast.error("Kode konfirmasi tidak valid");
    }

    setIsVerifying(false);
  };

  const statusSteps = [
    { id: "pending_payment", label: "Menunggu Pembayaran", icon: Clock, description: "Silakan lakukan pembayaran" },
    { id: "payment_uploaded", label: "Bukti Dikirim", icon: CheckCircle, description: "Menunggu verifikasi admin" },
    { id: "processing", label: "Diproses", icon: Package, description: "Pesanan sedang dikemas" },
    { id: "shipped", label: "Dikirim", icon: Truck, description: "Dalam perjalanan ke alamat Anda" },
  ];

  const getCurrentStep = () => {
    const statusMap: Record<string, number> = {
      pending_payment: 0,
      payment_uploaded: 1,
      processing: 2,
      shipped: 3,
      completed: 4,
    };
    return statusMap[order?.status || "pending_payment"] || 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 border-4 border-gold/30 border-t-gold rounded-full animate-spin" />
          <p className="text-gold text-lg">Memuat pesanan...</p>
        </div>
      </div>
    );
  }

  // Show authentication form if order not found (requires confirmation code)
  if (!order && orderNumber) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5">
        <div className="container mx-auto px-4 py-8 max-w-md">
          <Link to="/" className="inline-flex items-center text-gold hover:text-gold-light transition-colors mb-8">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          
          <div className="bg-card border border-border/50 rounded-2xl p-8">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-16 h-16 rounded-full bg-gold/20 flex items-center justify-center mb-4">
                <Lock className="w-8 h-8 text-gold" />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-2">Verifikasi Pesanan</h1>
              <p className="text-muted-foreground text-sm">
                Untuk keamanan data Anda, masukkan kode konfirmasi yang dikirim via WhatsApp
              </p>
            </div>
            
            <div className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-2">No. Pesanan</p>
                <p className="font-mono font-bold text-gold text-lg">{orderNumber}</p>
              </div>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">Kode Konfirmasi</p>
                <Input
                  placeholder="Masukkan 6 digit kode"
                  value={authCode}
                  onChange={(e) => setAuthCode(e.target.value.toUpperCase())}
                  className="bg-background border-border/50 focus:border-gold uppercase font-mono tracking-widest text-center text-lg"
                  maxLength={6}
                  onKeyDown={(e) => e.key === "Enter" && handleAuthSubmit()}
                />
              </div>
              
              <Button 
                variant="gold" 
                className="w-full gap-2"
                onClick={handleAuthSubmit}
                disabled={isVerifying || authCode.length < 6}
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Memverifikasi...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Lihat Status Pesanan
                  </>
                )}
              </Button>
              
              <p className="text-xs text-center text-muted-foreground">
                Belum punya kode? <button onClick={openWhatsApp} className="text-gold hover:underline">Hubungi Admin</button>
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5 flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h1 className="text-2xl font-bold text-foreground">Pesanan Tidak Ditemukan</h1>
          <p className="text-muted-foreground">Nomor pesanan tidak valid atau sudah tidak tersedia.</p>
          <Link to="/">
            <Button variant="gold" className="mt-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Kembali ke Beranda
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const currentStep = getCurrentStep();
  const isProcessing = order.status === "processing";
  const isPaymentUploaded = order.status === "payment_uploaded";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-gold/5">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold/20 via-gold/10 to-gold/20 border-b border-gold/30">
        <div className="container mx-auto px-4 py-6">
          <Link to="/" className="inline-flex items-center text-gold hover:text-gold-light transition-colors mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Beranda
          </Link>
          <h1 className="text-3xl md:text-4xl font-serif font-bold text-foreground">
            Status <span className="text-gold">Pesanan</span>
          </h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Success Card - Dynamic based on status */}
        {isProcessing ? (
          <div className="relative overflow-hidden bg-gradient-to-br from-gold/20 via-gold/10 to-amber-500/10 border-2 border-gold/50 rounded-2xl p-6 mb-8">
            <div className="absolute top-2 right-10 text-gold animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="absolute bottom-4 right-4 text-gold/50 animate-bounce">
              <PartyPopper className="w-8 h-8" />
            </div>
            
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold to-amber-500 flex items-center justify-center shadow-lg animate-pulse">
                <Package className="w-10 h-10 text-black" />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-2xl font-bold text-gold">Pesanan Sedang Diproses!</h2>
                  <span className="text-2xl">🎉</span>
                </div>
                <p className="text-foreground/80">
                  Tim kami sedang menyiapkan pesanan emas Anda dengan hati-hati.
                </p>
                <div className="flex items-center gap-2 mt-3 text-sm text-muted-foreground">
                  <Timer className="w-4 h-4 text-gold" />
                  <span>Estimasi pengemasan: <strong className="text-foreground">1-2 jam kerja</strong></span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/5 border border-green-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground">Pesanan Anda Tercatat!</h2>
                <p className="text-muted-foreground">Terima kasih telah berbelanja di Butik Mas Antam</p>
              </div>
            </div>
          </div>
        )}

        {/* Order Number */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Nomor Pesanan</p>
              <p className="text-2xl font-mono font-bold text-gold">{order.order_number}</p>
            </div>
            <Button
              variant="goldOutline"
              size="sm"
              onClick={copyOrderNumber}
              className="gap-2"
            >
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Disalin!" : "Salin"}
            </Button>
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-6">Status Pesanan</h3>
          <div className="relative">
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
            <div 
              className="absolute left-6 top-0 w-0.5 bg-gold transition-all duration-500"
              style={{ height: `${(currentStep / (statusSteps.length - 1)) * 100}%` }}
            />

            <div className="space-y-6">
              {statusSteps.map((step, index) => {
                const Icon = step.icon;
                const isActive = index <= currentStep;
                const isCurrent = index === currentStep;

                return (
                  <div key={step.id} className="flex items-start gap-4 relative">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-300 flex-shrink-0 ${
                        isActive
                          ? "bg-gold text-black"
                          : "bg-muted text-muted-foreground"
                      } ${isCurrent ? "ring-4 ring-gold/30 animate-pulse" : ""}`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="pt-1">
                      <p className={`font-medium ${isActive ? "text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </p>
                      <p className={`text-sm ${isCurrent ? "text-gold" : "text-muted-foreground"}`}>
                        {isCurrent ? "Status saat ini" : step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Processing Info Card */}
        {isProcessing && (
          <div className="bg-gradient-to-br from-gold/10 via-transparent to-gold/5 border border-gold/30 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Gift className="w-6 h-6 text-gold" />
              <h3 className="text-lg font-bold text-foreground">Apa yang Terjadi Selanjutnya?</h3>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold font-bold text-sm">1</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Pengemasan Premium</p>
                  <p className="text-sm text-muted-foreground">Emas Anda dikemas dengan box premium dan sertifikat keaslian</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold font-bold text-sm">2</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Quality Check</p>
                  <p className="text-sm text-muted-foreground">Tim QC memastikan produk dalam kondisi sempurna</p>
                </div>
              </div>
              <div className="flex items-start gap-3 p-3 bg-background/50 rounded-xl">
                <div className="w-8 h-8 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-gold font-bold text-sm">3</span>
                </div>
                <div>
                  <p className="font-medium text-foreground">Pengiriman Aman</p>
                  <p className="text-sm text-muted-foreground">Dikirim dengan asuransi penuh & tracking realtime</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Order Details */}
        <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
          <h3 className="text-lg font-bold text-foreground mb-4">Detail Pesanan</h3>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Produk</span>
              <span className="font-medium text-foreground">{order.product_name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Berat</span>
              <span className="font-medium text-foreground">{order.product_weight}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Jumlah</span>
              <span className="font-medium text-foreground">{order.quantity} pcs</span>
            </div>
            <div className="flex justify-between py-2 border-b border-border/50">
              <span className="text-muted-foreground">Pengiriman</span>
              <span className="font-medium text-foreground">{order.shipping_method}</span>
            </div>
            <div className="flex justify-between py-3">
              <span className="text-lg font-bold text-foreground">Total</span>
              <span className="text-xl font-bold text-gold">{formatCurrency(order.total_price)}</span>
            </div>
          </div>
        </div>

        {/* Customer Info - Masked for privacy */}
        {isProcessing && (
          <div className="bg-card border border-border/50 rounded-2xl p-6 mb-8">
            <h3 className="text-lg font-bold text-foreground mb-4">Informasi Pengiriman</h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 py-2">
                <User className="w-5 h-5 text-gold" />
                <span className="text-foreground">{order.customer_name}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Phone className="w-5 h-5 text-gold" />
                <span className="text-foreground">{maskPhone(order.customer_phone)}</span>
              </div>
              <div className="flex items-center gap-3 py-2">
                <Mail className="w-5 h-5 text-gold" />
                <span className="text-foreground">{maskEmail(order.customer_email)}</span>
              </div>
              <div className="flex items-start gap-3 py-2">
                <MapPin className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
                <span className="text-foreground">{maskAddress(order.customer_address)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Code Input */}
        {isPaymentUploaded && (
          <div className="bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 rounded-2xl p-6 mb-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                <KeyRound className="w-6 h-6 text-amber-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-foreground mb-2">
                  Masukkan Kode Konfirmasi
                </h3>
                <p className="text-muted-foreground mb-4 text-sm">
                  Hubungi admin via WhatsApp untuk mendapatkan kode konfirmasi setelah pembayaran diverifikasi.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <Input
                    placeholder="Masukkan kode (6 karakter)"
                    value={confirmCode}
                    onChange={(e) => setConfirmCode(e.target.value.toUpperCase())}
                    className="flex-1 min-w-[180px] bg-background border-border/50 focus:border-amber-500 uppercase font-mono tracking-widest"
                    maxLength={6}
                  />
                  <Button 
                    variant="gold" 
                    onClick={verifyConfirmationCode}
                    disabled={isVerifying || confirmCode.length < 6}
                    className="gap-2"
                  >
                    {isVerifying ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Verifikasi...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verifikasi
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* WhatsApp CTA */}
        <div className="bg-gradient-to-br from-gold/10 to-gold/5 border border-gold/30 rounded-2xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-gold/20 flex items-center justify-center flex-shrink-0">
              <MessageCircle className="w-6 h-6 text-gold" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-bold text-foreground mb-2">
                {isProcessing ? "Ada Pertanyaan?" : "Percepat Proses Pengiriman!"}
              </h3>
              <p className="text-muted-foreground mb-4">
                {isProcessing 
                  ? "Jika ada pertanyaan tentang pesanan Anda, silakan hubungi admin kami. Tim kami siap membantu 24/7."
                  : "Untuk mempercepat proses pengiriman, silakan konfirmasi ke Admin WhatsApp kami. Tim kami siap membantu Anda 24/7."
                }
              </p>
              <Button variant="gold" onClick={openWhatsApp} className="gap-2">
                <MessageCircle className="w-5 h-5" />
                {isProcessing ? "Hubungi Admin" : "Konfirmasi via WhatsApp"}
              </Button>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4 flex items-center gap-3">
          <Shield className="w-6 h-6 text-green-500 flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-green-500">100% Aman</span> - 
            Data pesanan Anda dilindungi dengan enkripsi tingkat tinggi. Kami tidak akan pernah membagikan informasi Anda kepada pihak ketiga.
          </p>
        </div>
      </div>
    </div>
  );
};

export default OrderStatus;