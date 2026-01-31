-- Add confirmation code column to orders table
ALTER TABLE public.orders ADD COLUMN confirmation_code TEXT;

-- Create function to generate random 6-digit code
CREATE OR REPLACE FUNCTION public.generate_confirmation_code()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$;

-- Create trigger to auto-generate confirmation code on order creation
CREATE OR REPLACE FUNCTION public.set_confirmation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.confirmation_code := public.generate_confirmation_code();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_set_confirmation_code
BEFORE INSERT ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.set_confirmation_code();