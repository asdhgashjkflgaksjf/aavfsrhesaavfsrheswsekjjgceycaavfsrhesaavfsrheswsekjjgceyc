-- Fix function search path for security
CREATE OR REPLACE FUNCTION public.generate_confirmation_code()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  RETURN UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 6));
END;
$$;

CREATE OR REPLACE FUNCTION public.set_confirmation_code()
RETURNS TRIGGER
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.confirmation_code := public.generate_confirmation_code();
  RETURN NEW;
END;
$$;