import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Shield,
  Lock,
  CheckCircle,
  Upload,
  QrCode,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Camera,
  Image as ImageIcon,
  AlertCircle,
  ShieldCheck,
  AlertTriangle,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useRateLimiter } from "@/hooks/useRateLimiter";
import { useQRCode } from "@/hooks/useQRCode";
import { useIndonesiaLocation } from "@/hooks/useIndonesiaLocation";
import { validateForm, validateField, type CustomerFormData } from "@/utils/validation";
import ShippingOption from "@/components/checkout/ShippingOption";
import InvoicePreview from "@/components/checkout/InvoicePreview";
import { courierLogos } from "@/components/checkout/CourierLogos";

interface Product {
  name: string;
  weight: string;
  price: number;
  image: string;
}

interface QRISPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: Product;
  quantity: number;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const generateOrderNumber = () => {
  // Use cryptographically secure random bytes to prevent enumeration attacks
  const randomBytes = crypto.getRandomValues(new Uint8Array(12));
  const randomString = Array.from(randomBytes)
    .map(b => b.toString(36).padStart(2, '0'))
    .join('')
    .toUpperCase()
    .substring(0, 16);
  return `BMA-${randomString}`;
};

const shippingOptions = [
  { name: "Ambil di Butik", cost: 0, estimate: "Langsung" },
  { name: "JNE REG", cost: 55000, estimate: "3-5 hari" },
  { name: "JNE YES", cost: 85000, estimate: "1-2 hari" },
  { name: "SiCepat REG", cost: 52000, estimate: "3-4 hari" },
  { name: "SiCepat BEST", cost: 75000, estimate: "1-2 hari" },
  { name: "J&T Express", cost: 58000, estimate: "2-4 hari" },
  { name: "AnterAja", cost: 50000, estimate: "3-5 hari" },
];

const QRISPaymentModal = ({ isOpen, onClose, product, quantity }: QRISPaymentModalProps) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [shakeFields, setShakeFields] = useState<Record<string, boolean>>({});
  const [orderNumber] = useState(generateOrderNumber());
  const [dataConfirmed, setDataConfirmed] = useState(false);
  
  const { checkRateLimit, recordOrder } = useRateLimiter();
  const { qrCodeUrl, isLoading: qrLoading } = useQRCode();
  const {
    provinces,
    regencies,
    districts,
    villages,
    selectedProvince,
    selectedRegency,
    selectedDistrict,
    selectedVillage,
    setSelectedProvince,
    setSelectedRegency,
    setSelectedDistrict,
    setSelectedVillage,
    isLoadingProvinces,
    isLoadingRegencies,
    isLoadingDistricts,
    isLoadingVillages,
    getLocationNames,
  } = useIndonesiaLocation();
  
  const [formData, setFormData] = useState<CustomerFormData>({
    name: "",
    email: "",
    phone: "",
    address: "",
    shippingMethod: "Ambil di Butik",
  });

  const shippingCost = shippingOptions.find(o => o.name === formData.shippingMethod)?.cost || 0;
  const totalPrice = (product.price * quantity) + shippingCost;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    const validation = validateField(name as keyof CustomerFormData, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validation.error || "",
    }));
  };

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const validation = validateField(name as keyof CustomerFormData, value);
    setFieldErrors((prev) => ({
      ...prev,
      [name]: validation.error || "",
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Ukuran file maksimal 5MB");
        return;
      }
      if (!file.type.startsWith("image/")) {
        toast.error("File harus berupa gambar");
        return;
      }
      setPaymentProof(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmitOrder = async () => {
    if (!paymentProof) {
      toast.error("Silakan upload bukti pembayaran");
      return;
    }

    const rateLimitResult = checkRateLimit(formData.phone, formData.email);
    if (!rateLimitResult.allowed) {
      toast.error(rateLimitResult.message, {
        duration: 5000,
        icon: <AlertTriangle className="w-5 h-5 text-red-500" />
      });
      return;
    }

    if (rateLimitResult.message && rateLimitResult.remaining <= 2) {
      toast.warning(rateLimitResult.message, { duration: 4000 });
    }

    setIsSubmitting(true);

    try {
      const fileExt = paymentProof.name.split(".").pop();
      // Use cryptographically secure random filename to prevent URL enumeration
      const randomId = Array.from(crypto.getRandomValues(new Uint8Array(16)))
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
      const fileName = `${randomId}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("payment-proofs")
        .upload(fileName, paymentProof);

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Gagal mengupload bukti pembayaran");
      }

      const { data: urlData } = supabase.storage
        .from("payment-proofs")
        .getPublicUrl(fileName);

      const paymentProofUrl = urlData.publicUrl;

      // Use RPC function to create order (bypasses RLS SELECT restriction)
      const { data: orderData, error: orderError } = await supabase.rpc('create_order_with_payment_proof', {
        p_order_number: orderNumber,
        p_customer_name: formData.name,
        p_customer_email: formData.email,
        p_customer_phone: formData.phone,
        p_customer_address: formData.address,
        p_shipping_method: formData.shippingMethod,
        p_product_name: product.name,
        p_product_weight: product.weight,
        p_product_price: product.price,
        p_quantity: quantity,
        p_total_price: totalPrice,
        p_payment_proof_url: paymentProofUrl,
      });

      if (orderError) {
        console.error("Order error:", orderError);
        throw new Error("Gagal membuat pesanan: " + orderError.message);
      }

      const createdOrder = Array.isArray(orderData) ? orderData[0] : orderData;

      try {
        await supabase.functions.invoke("send-telegram-notification", {
          body: { orderId: createdOrder?.id },
        });
      } catch (telegramError) {
        console.error("Telegram notification error:", telegramError);
      }

      recordOrder(formData.phone, formData.email);

      toast.success("Pesanan berhasil dibuat!");
      onClose();
      navigate(`/order-status?order=${orderNumber}`);
    } catch (error: any) {
      console.error("Order submission error:", error);
      toast.error(error.message || "Terjadi kesalahan, silakan coba lagi");
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateStep1AndProceed = () => {
    const step1Errors: Record<string, string> = {};
    
    if (!formData.name || formData.name.length < 6) {
      step1Errors.name = "Nama lengkap minimal 6 karakter";
    }
    if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      step1Errors.email = "Format email tidak valid";
    }
    if (!formData.phone || !/^(08|\+62|62)[0-9]{8,12}$/.test(formData.phone.replace(/\s/g, ''))) {
      step1Errors.phone = "Format nomor WhatsApp tidak valid";
    }
    if (!selectedProvince) {
      step1Errors.provinsi = "Pilih provinsi";
    }
    if (!selectedRegency) {
      step1Errors.kabupaten = "Pilih kabupaten/kota";
    }
    if (!selectedDistrict) {
      step1Errors.kecamatan = "Pilih kecamatan";
    }
    if (!selectedVillage) {
      step1Errors.kelurahan = "Pilih desa/kelurahan";
    }
    if (!dataConfirmed) {
      step1Errors.dataConfirmed = "Anda harus mengkonfirmasi kebenaran data";
    }

    if (Object.keys(step1Errors).length > 0) {
      setFieldErrors(step1Errors);
      const newShakeFields: Record<string, boolean> = {};
      Object.keys(step1Errors).forEach(field => {
        newShakeFields[field] = true;
      });
      setShakeFields(newShakeFields);
      setTimeout(() => setShakeFields({}), 500);
      toast.error("Mohon lengkapi semua data dengan benar");
      return;
    }
    setFieldErrors({});
    setStep(2);
  };

  const validateStep2AndProceed = () => {
    if (!formData.address || formData.address.length < 10) {
      setFieldErrors({ address: "Alamat lengkap minimal 10 karakter" });
      setShakeFields({ address: true });
      setTimeout(() => setShakeFields({}), 500);
      toast.error("Mohon isi alamat lengkap dengan detail");
      return;
    }
    setFieldErrors({});
    setStep(3);
  };

  // Step 1: Personal Info + Location
  const renderStep1 = () => (
    <div className="space-y-4">
      <div className="space-y-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-gold text-sm">
            Nama Lengkap
          </Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="Masukkan nama lengkap Anda"
            className={`bg-background border-border/50 focus:border-gold text-sm ${
              fieldErrors.name ? "border-destructive" : ""
            } ${shakeFields.name ? "animate-shake" : ""}`}
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="email" className="text-foreground text-sm">
            Email
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            placeholder="nama@email.com"
            className={`bg-background border-border/50 focus:border-gold text-sm ${
              fieldErrors.email ? "border-destructive" : ""
            } ${shakeFields.email ? "animate-shake" : ""}`}
          />
          {fieldErrors.email && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.email}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="phone" className="text-foreground text-sm">
            No WhatsApp
          </Label>
          <div className="flex">
            <span className="inline-flex items-center px-3 bg-muted border border-r-0 border-border/50 rounded-l-md text-sm text-muted-foreground">
              +62
            </span>
            <Input
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              placeholder="8123456789"
              className={`rounded-l-none bg-background border-border/50 focus:border-gold text-sm ${
                fieldErrors.phone ? "border-destructive" : ""
              } ${shakeFields.phone ? "animate-shake" : ""}`}
            />
          </div>
          {fieldErrors.phone && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.phone}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="provinsi" className="text-foreground text-sm">
            Provinsi
          </Label>
          <Select
            value={selectedProvince}
            onValueChange={setSelectedProvince}
          >
            <SelectTrigger 
              className={`w-full bg-background border-border/50 focus:border-gold text-sm ${
                fieldErrors.provinsi ? "border-destructive" : ""
              } ${shakeFields.provinsi ? "animate-shake" : ""}`}
            >
              <SelectValue placeholder={isLoadingProvinces ? "Memuat..." : "Pilih Provinsi"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[200px]">
              {provinces.map((prov) => (
                <SelectItem key={prov.id} value={prov.id}>{prov.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.provinsi && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.provinsi}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kabupaten" className="text-foreground text-sm">
            Kabupaten / Kota
          </Label>
          <Select
            value={selectedRegency}
            onValueChange={setSelectedRegency}
            disabled={!selectedProvince || isLoadingRegencies}
          >
            <SelectTrigger 
              className={`w-full bg-background border-border/50 focus:border-gold text-sm ${
                fieldErrors.kabupaten ? "border-destructive" : ""
              } ${shakeFields.kabupaten ? "animate-shake" : ""}`}
            >
              <SelectValue placeholder={isLoadingRegencies ? "Memuat..." : "Pilih Kabupaten/Kota"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[200px]">
              {regencies.map((reg) => (
                <SelectItem key={reg.id} value={reg.id}>{reg.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.kabupaten && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.kabupaten}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kecamatan" className="text-foreground text-sm">
            Kecamatan
          </Label>
          <Select
            value={selectedDistrict}
            onValueChange={setSelectedDistrict}
            disabled={!selectedRegency || isLoadingDistricts}
          >
            <SelectTrigger 
              className={`w-full bg-background border-border/50 focus:border-gold text-sm ${
                fieldErrors.kecamatan ? "border-destructive" : ""
              } ${shakeFields.kecamatan ? "animate-shake" : ""}`}
            >
              <SelectValue placeholder={isLoadingDistricts ? "Memuat..." : "Pilih Kecamatan"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[200px]">
              {districts.map((dist) => (
                <SelectItem key={dist.id} value={dist.id}>{dist.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.kecamatan && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.kecamatan}
            </p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="kelurahan" className="text-foreground text-sm">
            Desa / Kelurahan
          </Label>
          <Select
            value={selectedVillage}
            onValueChange={setSelectedVillage}
            disabled={!selectedDistrict || isLoadingVillages}
          >
            <SelectTrigger 
              className={`w-full bg-background border-border/50 focus:border-gold text-sm ${
                fieldErrors.kelurahan ? "border-destructive" : ""
              } ${shakeFields.kelurahan ? "animate-shake" : ""}`}
            >
              <SelectValue placeholder={isLoadingVillages ? "Memuat..." : "Pilih Desa/Kelurahan"} />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border max-h-[200px]">
              {villages.map((vil) => (
                <SelectItem key={vil.id} value={vil.id}>{vil.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {fieldErrors.kelurahan && (
            <p className="text-xs text-red-500 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              {fieldErrors.kelurahan}
            </p>
          )}
        </div>

        {/* Confirmation Checkbox */}
        <div className="flex items-start gap-2 pt-2">
          <input
            type="checkbox"
            id="dataConfirmed"
            checked={dataConfirmed}
            onChange={(e) => setDataConfirmed(e.target.checked)}
            className={`mt-0.5 h-4 w-4 rounded border-border/50 accent-gold ${
              fieldErrors.dataConfirmed ? "border-destructive" : ""
            }`}
          />
          <Label htmlFor="dataConfirmed" className="text-sm text-muted-foreground cursor-pointer">
            Saya memastikan data dan dokumen yang saya isi adalah benar
          </Label>
        </div>
        {fieldErrors.dataConfirmed && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.dataConfirmed}
          </p>
        )}
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={validateStep1AndProceed}
      >
        Lanjutkan
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>
    </div>
  );

  // Step 2: Shipping Selection + Detailed Address
  const renderStep2 = () => (
    <div className="space-y-4">
      {/* Shipping Selection with Logos - Grid Layout */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm font-semibold">
          Pilih Pengiriman
        </Label>
        <div className="grid grid-cols-2 gap-2">
          {shippingOptions.map((option) => (
            <ShippingOption
              key={option.name}
              name={option.name}
              cost={option.cost}
              selected={formData.shippingMethod === option.name}
              onSelect={() => setFormData(prev => ({ ...prev, shippingMethod: option.name }))}
              logo={courierLogos[option.name] || <div className="w-full h-full bg-gray-200 rounded" />}
              compact
            />
          ))}
        </div>
      </div>

      {/* Detailed Address */}
      <div className="space-y-1.5">
        <Label htmlFor="address" className="text-foreground text-sm font-semibold">
          Alamat Lengkap (Detail)
        </Label>
        <Textarea
          id="address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          placeholder="Contoh: Jl. Mawar No 12, dekat Ruko A, B, C"
          className={`bg-background border-border/50 focus:border-gold min-h-[80px] text-sm ${
            fieldErrors.address ? "border-destructive" : ""
          } ${shakeFields.address ? "animate-shake" : ""}`}
        />
        {fieldErrors.address && (
          <p className="text-xs text-red-500 flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            {fieldErrors.address}
          </p>
        )}
      </div>

      {/* Order Summary */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-2">
        <div className="text-xs sm:text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{formatCurrency(product.price * quantity)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pajak (0,25%)</span>
            <span className="text-foreground">{formatCurrency(Math.round(product.price * quantity * 0.0025))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir</span>
            <span className="text-foreground">{shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
          </div>
          <div className="border-t border-border/50 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span className="text-gold">Total Bayar</span>
              <span className="text-gold">{formatCurrency(totalPrice + Math.round(product.price * quantity * 0.0025))}</span>
            </div>
          </div>
        </div>
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={validateStep2AndProceed}
      >
        Lanjut ke Invoice
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => setStep(1)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>
    </div>
  );

  // Step 3: Invoice Preview
  const renderStep3 = () => (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
        <FileText className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-500 text-xs sm:text-sm">Preview Invoice Pesanan</p>
          <p className="text-xs text-muted-foreground">
            Periksa data pesanan Anda sebelum pembayaran
          </p>
        </div>
      </div>

      <div className="max-h-[400px] overflow-y-auto">
        <InvoicePreview
          orderNumber={orderNumber}
          customerName={formData.name}
          customerEmail={formData.email}
          customerPhone={formData.phone}
          customerAddress={`${formData.address}, ${getLocationNames().villageName}, ${getLocationNames().districtName}, ${getLocationNames().regencyName}, ${getLocationNames().provinceName}`}
          productName={product.name}
          productWeight={product.weight}
          productPrice={product.price}
          quantity={quantity}
          shippingMethod={formData.shippingMethod}
          shippingCost={shippingCost}
          totalPrice={totalPrice}
        />
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={() => setStep(4)}
      >
        Lanjut ke Pembayaran
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => setStep(2)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Ubah Data
      </Button>
    </div>
  );

  // Step 4: QRIS Payment
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
        <ShieldCheck className="w-6 h-6 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-500 text-xs sm:text-sm">Pembayaran 100% Aman</p>
          <p className="text-xs text-muted-foreground">
            Transaksi dilindungi enkripsi SSL
          </p>
        </div>
      </div>

      {/* Order Summary Compact */}
      <div className="bg-muted/50 rounded-xl p-3 space-y-2">
        <h4 className="font-semibold text-foreground text-sm">Ringkasan Pesanan</h4>
        <div className="text-xs sm:text-sm space-y-1">
          <div className="flex justify-between">
            <span className="text-muted-foreground truncate mr-2">{product.name}</span>
            <span className="text-foreground flex-shrink-0">{formatCurrency(product.price)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Jumlah</span>
            <span className="text-foreground">{quantity} pcs</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Ongkir ({formData.shippingMethod})</span>
            <span className="text-foreground">{shippingCost === 0 ? "Gratis" : formatCurrency(shippingCost)}</span>
          </div>
          <div className="border-t border-border/50 pt-2 mt-2">
            <div className="flex justify-between font-bold">
              <span className="text-foreground">Total</span>
              <span className="text-gold">{formatCurrency(totalPrice)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* QRIS Code */}
      <div className="bg-white rounded-xl p-3 sm:p-4 text-center">
        <div className="inline-flex items-center gap-2 mb-2">
          <QrCode className="w-4 h-4 sm:w-5 sm:h-5 text-gray-700" />
          <span className="font-semibold text-gray-700 text-sm">Scan QRIS</span>
        </div>
        <div className="bg-gray-100 rounded-lg p-3 sm:p-4 inline-block">
          {qrLoading ? (
            <div className="w-36 h-36 sm:w-48 sm:h-48 flex items-center justify-center">
              <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
            </div>
          ) : qrCodeUrl ? (
            <img
              src={qrCodeUrl}
              alt="QRIS Code"
              className="w-36 h-36 sm:w-48 sm:h-48 object-contain"
            />
          ) : (
            <div className="w-36 h-36 sm:w-48 sm:h-48 bg-gradient-to-br from-gray-200 to-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <QrCode className="w-12 h-12 sm:w-16 sm:h-16 text-gray-500 mx-auto mb-2" />
                <p className="text-xs text-gray-500">QRIS Code</p>
                <p className="text-xs text-gray-400">Belum diatur</p>
              </div>
            </div>
          )}
        </div>
        <p className="text-xs sm:text-sm text-gray-600 mt-2">
          Scan dengan e-wallet atau mobile banking
        </p>
      </div>

      {/* Payment Instructions */}
      <div className="bg-gold/10 border border-gold/30 rounded-xl p-3">
        <h4 className="font-semibold text-foreground mb-2 flex items-center gap-2 text-sm">
          <AlertCircle className="w-4 h-4 text-gold" />
          Instruksi Pembayaran
        </h4>
        <ol className="text-xs text-muted-foreground space-y-0.5 list-decimal list-inside">
          <li>Buka aplikasi e-wallet/mobile banking</li>
          <li>Pilih menu "Scan QR" atau "QRIS"</li>
          <li>Masukkan nominal: <span className="font-bold text-gold">{formatCurrency(totalPrice)}</span></li>
          <li>Konfirmasi dan screenshot bukti</li>
        </ol>
      </div>

      <Button
        variant="gold"
        className="w-full"
        onClick={() => setStep(5)}
      >
        Sudah Bayar? Upload Bukti
        <ArrowRight className="w-4 h-4 ml-2" />
      </Button>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => setStep(3)}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali ke Invoice
      </Button>
    </div>
  );

  // Step 5: Upload Payment Proof
  const renderStep5 = () => (
    <div className="space-y-4">
      <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-3 flex items-center gap-3">
        <Lock className="w-5 h-5 text-green-500 flex-shrink-0" />
        <div>
          <p className="font-semibold text-green-500 text-xs sm:text-sm">Upload Aman & Terenkripsi</p>
          <p className="text-xs text-muted-foreground">
            Bukti pembayaran hanya dapat dilihat oleh tim kami
          </p>
        </div>
      </div>

      {/* Upload Area */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-xl p-4 sm:p-6 text-center cursor-pointer transition-all ${
          previewUrl
            ? "border-gold bg-gold/5"
            : "border-border/50 hover:border-gold/50 hover:bg-muted/50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/heic,image/heif"
          onChange={handleFileChange}
          className="hidden"
        />

        {previewUrl ? (
          <div className="space-y-2">
            <img
              src={previewUrl}
              alt="Bukti pembayaran"
              className="max-h-36 sm:max-h-48 mx-auto rounded-lg object-contain"
            />
            <p className="text-sm text-gold font-medium flex items-center justify-center gap-2">
              <CheckCircle className="w-4 h-4" />
              Bukti pembayaran terpilih
            </p>
            <p className="text-xs text-muted-foreground">Klik untuk mengganti</p>
          </div>
        ) : (
          <div className="space-y-2">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto rounded-full bg-muted flex items-center justify-center">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium text-foreground text-sm">Upload Bukti Pembayaran</p>
              <p className="text-xs text-muted-foreground">
                Klik atau tap untuk memilih gambar
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                Format: JPG, PNG, WEBP (Maks. 5MB)
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                Kamera
              </Button>
              <Button variant="outline" size="sm" className="gap-2 text-xs">
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                Galeri
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <Button
        variant="gold"
        className="w-full"
        onClick={handleSubmitOrder}
        disabled={!paymentProof || isSubmitting}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Memproses Pesanan...
          </>
        ) : (
          <>
            <CheckCircle className="w-4 h-4 mr-2" />
            Kirim Bukti & Selesaikan
          </>
        )}
      </Button>

      <Button
        variant="ghost"
        className="w-full text-muted-foreground"
        onClick={() => setStep(4)}
        disabled={isSubmitting}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Kembali
      </Button>

      {/* Final Security Notice */}
      <div className="text-center text-xs text-muted-foreground flex items-center justify-center gap-2">
        <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
        Dilindungi dengan enkripsi tingkat bank
      </div>
    </div>
  );

  const stepTitles = {
    1: "📋 Data Pembeli",
    2: "🚚 Pengiriman",
    3: "🧾 Invoice Pesanan",
    4: "💳 Pembayaran QRIS",
    5: "📤 Upload Bukti",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[95vw] sm:max-w-md max-h-[90vh] overflow-y-auto bg-card border-border/50 p-4 sm:p-6">
        <DialogHeader className="pb-2">
          <DialogTitle className="text-lg sm:text-xl font-serif text-foreground flex items-center gap-2 sm:gap-3">
            {stepTitles[step as keyof typeof stepTitles]}
          </DialogTitle>
          
          {/* Step Indicator */}
          <div className="flex items-center gap-2 pt-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <div
                key={s}
                className={`flex-1 h-1.5 rounded-full transition-colors ${
                  s <= step ? "bg-gold" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </DialogHeader>

        <div className="mt-2">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default QRISPaymentModal;
