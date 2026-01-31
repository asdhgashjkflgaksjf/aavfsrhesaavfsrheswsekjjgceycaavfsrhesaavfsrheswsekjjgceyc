import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Phone, MessageCircle, Mail, Save, RefreshCw } from "lucide-react";
import { useContactSettings, useUpdateContactSettings } from "@/hooks/useContactSettings";

const ContactSettings = () => {
  const { toast } = useToast();
  const { data: settings, isLoading } = useContactSettings();
  const updateMutation = useUpdateContactSettings();

  const [whatsapp, setWhatsapp] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (settings) {
      setWhatsapp(settings.whatsapp_number);
      setPhone(settings.phone_number);
      setEmail(settings.email);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateMutation.mutateAsync({
        whatsapp_number: whatsapp,
        phone_number: phone,
        email: email,
      });
      toast({
        title: "Berhasil!",
        description: "Pengaturan kontak berhasil diperbarui",
      });
    } catch {
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat menyimpan",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pengaturan Kontak</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5 text-primary" />
          Pengaturan Kontak
        </CardTitle>
        <CardDescription>
          Kelola nomor WhatsApp, telepon, dan email yang ditampilkan di website
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="whatsapp" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4 text-green-500" />
            Nomor WhatsApp
          </Label>
          <Input
            id="whatsapp"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value)}
            placeholder="6281234567890 (tanpa + atau spasi)"
          />
          <p className="text-xs text-muted-foreground">
            Format: kode negara + nomor (contoh: 6281234567890)
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-primary" />
            Nomor Telepon (Display)
          </Label>
          <Input
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+62 812-3456-7890"
          />
          <p className="text-xs text-muted-foreground">
            Format yang ditampilkan di website
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4 text-primary" />
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="info@logammulia.com"
          />
        </div>

        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          className="w-full"
        >
          {updateMutation.isPending ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Simpan Pengaturan
        </Button>
      </CardContent>
    </Card>
  );
};

export default ContactSettings;
