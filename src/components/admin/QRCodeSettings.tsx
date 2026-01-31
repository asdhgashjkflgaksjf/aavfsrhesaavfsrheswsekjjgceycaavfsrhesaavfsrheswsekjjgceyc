import { useState, useRef, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Upload, QrCode, Loader2, Trash2, Image as ImageIcon } from "lucide-react";

const QRCodeSettings = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Fetch current QR code URL from settings
  const fetchQRCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("settings")
        .select("value")
        .eq("key", "qris_code_url")
        .maybeSingle();

      if (error) throw error;
      
      if (data?.value) {
        setQrCodeUrl(data.value);
      }
    } catch (err) {
      console.error("Error fetching QR code:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQRCode();
  }, []);

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
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleUpload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      toast.error("Pilih file terlebih dahulu");
      return;
    }

    setIsUploading(true);
    try {
      // Delete old QR code if exists
      if (qrCodeUrl) {
        const oldFileName = qrCodeUrl.split("/").pop();
        if (oldFileName) {
          await supabase.storage.from("qr-codes").remove([oldFileName]);
        }
      }

      // Upload new QR code
      const fileExt = file.name.split(".").pop();
      const fileName = `qris-${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("qr-codes")
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: urlData } = supabase.storage
        .from("qr-codes")
        .getPublicUrl(fileName);

      const newUrl = urlData.publicUrl;

      // Upsert settings
      const { error: settingsError } = await supabase
        .from("settings")
        .upsert(
          { key: "qris_code_url", value: newUrl },
          { onConflict: "key" }
        );

      if (settingsError) throw settingsError;

      setQrCodeUrl(newUrl);
      setPreviewUrl(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      toast.success("QR Code berhasil diupload!");
    } catch (err) {
      console.error("Error uploading QR code:", err);
      toast.error("Gagal mengupload QR Code");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!qrCodeUrl) return;

    setIsUploading(true);
    try {
      const fileName = qrCodeUrl.split("/").pop();
      if (fileName) {
        await supabase.storage.from("qr-codes").remove([fileName]);
      }

      await supabase.from("settings").delete().eq("key", "qris_code_url");

      setQrCodeUrl(null);
      toast.success("QR Code berhasil dihapus");
    } catch (err) {
      console.error("Error deleting QR code:", err);
      toast.error("Gagal menghapus QR Code");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="bg-zinc-800/50 border-zinc-700/50">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <QrCode className="w-5 h-5 text-amber-400" />
          Pengaturan QRIS
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Upload atau ganti gambar QRIS untuk pembayaran
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-amber-500" />
          </div>
        ) : (
          <>
            {/* Current QR Code Display */}
            {qrCodeUrl && (
              <div className="space-y-3">
                <p className="text-sm text-zinc-400">QR Code Saat Ini:</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <img
                    src={qrCodeUrl}
                    alt="QRIS Code"
                    className="w-48 h-48 object-contain"
                  />
                </div>
                <div>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={handleDelete}
                    disabled={isUploading}
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Hapus QR Code
                  </Button>
                </div>
              </div>
            )}

            {/* Preview New Upload */}
            {previewUrl && (
              <div className="space-y-2">
                <p className="text-sm text-zinc-400">Preview Upload Baru:</p>
                <div className="bg-white rounded-lg p-4 inline-block">
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-48 h-48 object-contain"
                  />
                </div>
              </div>
            )}

            {/* Upload Area */}
            <div className="space-y-3">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
              
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                  disabled={isUploading}
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Pilih Gambar
                </Button>

                {previewUrl && (
                  <Button
                    variant="gold"
                    onClick={handleUpload}
                    disabled={isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Mengupload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        Upload QR Code
                      </>
                    )}
                  </Button>
                )}
              </div>

              <p className="text-xs text-zinc-500">
                Format: JPG, PNG, WEBP. Maksimal 5MB. Ukuran disarankan: 500x500px
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default QRCodeSettings;
