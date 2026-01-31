import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SignedUrlCache {
  [key: string]: {
    url: string;
    expiresAt: number;
  };
}

const urlCache: SignedUrlCache = {};

export const useSignedPaymentUrl = () => {
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<Record<string, string>>({});

  const getSignedUrl = useCallback(async (paymentProofUrl: string | null): Promise<string | null> => {
    if (!paymentProofUrl) return null;

    // Extract filename from URL
    const urlParts = paymentProofUrl.split('/');
    const fileName = urlParts[urlParts.length - 1];
    
    if (!fileName) return null;

    // Check cache first (with 5 minute buffer before expiry)
    const cached = urlCache[fileName];
    if (cached && cached.expiresAt > Date.now() + 300000) {
      return cached.url;
    }

    setLoading(prev => ({ ...prev, [fileName]: true }));
    setError(prev => ({ ...prev, [fileName]: '' }));

    try {
      const { data, error: fnError } = await supabase.functions.invoke('get-signed-payment-url', {
        body: { fileName }
      });

      if (fnError) {
        console.error('Error getting signed URL:', fnError);
        setError(prev => ({ ...prev, [fileName]: 'Failed to load image' }));
        return null;
      }

      if (data?.signedUrl) {
        // Cache for 55 minutes (signed URL expires in 60 min)
        urlCache[fileName] = {
          url: data.signedUrl,
          expiresAt: Date.now() + 55 * 60 * 1000
        };
        return data.signedUrl;
      }

      return null;
    } catch (err) {
      console.error('Error getting signed URL:', err);
      setError(prev => ({ ...prev, [fileName]: 'Failed to load image' }));
      return null;
    } finally {
      setLoading(prev => ({ ...prev, [fileName]: false }));
    }
  }, []);

  return { getSignedUrl, loading, error };
};