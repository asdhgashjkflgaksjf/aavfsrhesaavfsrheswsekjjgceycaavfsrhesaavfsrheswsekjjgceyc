import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, ImageOff, Image } from 'lucide-react';

interface PaymentProofImageProps {
  paymentProofUrl: string | null;
  className?: string;
}

const PaymentProofImage = ({ paymentProofUrl, className = '' }: PaymentProofImageProps) => {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignedUrl = async () => {
      if (!paymentProofUrl) {
        setSignedUrl(null);
        return;
      }

      // Extract filename from URL
      const urlParts = paymentProofUrl.split('/');
      const fileName = urlParts[urlParts.length - 1];
      
      if (!fileName) {
        setError('Invalid image URL');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: fnError } = await supabase.functions.invoke('get-signed-payment-url', {
          body: { fileName }
        });

        if (fnError) {
          console.error('Error getting signed URL:', fnError);
          setError('Gagal memuat gambar');
          return;
        }

        if (data?.signedUrl) {
          setSignedUrl(data.signedUrl);
        } else {
          setError('URL tidak ditemukan');
        }
      } catch (err) {
        console.error('Error getting signed URL:', err);
        setError('Gagal memuat gambar');
      } finally {
        setLoading(false);
      }
    };

    fetchSignedUrl();
  }, [paymentProofUrl]);

  if (!paymentProofUrl) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 text-zinc-500 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <Image className="w-8 h-8" />
          <span className="text-sm">Tidak ada bukti pembayaran</span>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 ${className}`}>
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-zinc-900 text-red-400 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <ImageOff className="w-8 h-8" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (!signedUrl) {
    return null;
  }

  return (
    <img
      src={signedUrl}
      alt="Bukti Pembayaran"
      className={`object-contain bg-zinc-900 ${className}`}
    />
  );
};

export default PaymentProofImage;