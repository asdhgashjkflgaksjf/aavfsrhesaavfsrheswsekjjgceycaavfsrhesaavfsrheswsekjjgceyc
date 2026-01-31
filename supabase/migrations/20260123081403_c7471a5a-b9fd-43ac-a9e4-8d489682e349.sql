-- Create settings table for storing app configuration like QR code
CREATE TABLE public.settings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  key text NOT NULL UNIQUE,
  value text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Only admins can manage settings
CREATE POLICY "Admins can manage settings" 
ON public.settings 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Anyone can view settings (for QR code display)
CREATE POLICY "Anyone can view settings" 
ON public.settings 
FOR SELECT 
USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_settings_updated_at
BEFORE UPDATE ON public.settings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for QR code images
INSERT INTO storage.buckets (id, name, public) VALUES ('qr-codes', 'qr-codes', true);

-- Storage policies for QR codes
CREATE POLICY "QR codes are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'qr-codes');

CREATE POLICY "Admins can upload QR codes"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update QR codes"
ON storage.objects
FOR UPDATE
USING (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete QR codes"
ON storage.objects
FOR DELETE
USING (bucket_id = 'qr-codes' AND has_role(auth.uid(), 'admin'::app_role));