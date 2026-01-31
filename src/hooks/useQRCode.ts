import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useQRCode = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchQRCode = async () => {
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

    fetchQRCode();
  }, []);

  return { qrCodeUrl, isLoading };
};
