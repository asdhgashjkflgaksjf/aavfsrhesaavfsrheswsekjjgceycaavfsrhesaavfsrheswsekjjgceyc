-- Public order creation without requiring SELECT permissions on orders
-- This prevents 401/RLS issues caused by `.insert(...).select(...).single()`.
CREATE OR REPLACE FUNCTION public.create_order_with_payment_proof(
  p_order_number text,
  p_customer_name text,
  p_customer_email text,
  p_customer_phone text,
  p_customer_address text,
  p_shipping_method text,
  p_product_name text,
  p_product_weight text,
  p_product_price numeric,
  p_quantity integer,
  p_total_price numeric,
  p_payment_proof_url text
)
RETURNS TABLE(id uuid, confirmation_code text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_confirmation_code text;
  v_id uuid;
BEGIN
  -- Basic validation (avoid empty inserts)
  IF p_order_number IS NULL OR btrim(p_order_number) = '' THEN
    RAISE EXCEPTION 'order_number wajib diisi';
  END IF;
  IF p_customer_name IS NULL OR btrim(p_customer_name) = '' THEN
    RAISE EXCEPTION 'nama wajib diisi';
  END IF;
  IF p_customer_email IS NULL OR btrim(p_customer_email) = '' THEN
    RAISE EXCEPTION 'email wajib diisi';
  END IF;
  IF p_customer_phone IS NULL OR btrim(p_customer_phone) = '' THEN
    RAISE EXCEPTION 'phone wajib diisi';
  END IF;
  IF p_customer_address IS NULL OR btrim(p_customer_address) = '' THEN
    RAISE EXCEPTION 'alamat wajib diisi';
  END IF;
  IF p_product_name IS NULL OR btrim(p_product_name) = '' THEN
    RAISE EXCEPTION 'produk wajib diisi';
  END IF;
  IF p_payment_proof_url IS NULL OR btrim(p_payment_proof_url) = '' THEN
    RAISE EXCEPTION 'bukti pembayaran wajib diisi';
  END IF;

  v_confirmation_code := public.generate_confirmation_code();

  INSERT INTO public.orders(
    order_number,
    customer_name,
    customer_email,
    customer_phone,
    customer_address,
    shipping_method,
    product_name,
    product_weight,
    product_price,
    quantity,
    total_price,
    payment_proof_url,
    status,
    confirmation_code
  ) VALUES (
    p_order_number,
    p_customer_name,
    p_customer_email,
    p_customer_phone,
    p_customer_address,
    p_shipping_method,
    p_product_name,
    p_product_weight,
    p_product_price,
    COALESCE(p_quantity, 1),
    p_total_price,
    p_payment_proof_url,
    'payment_uploaded',
    v_confirmation_code
  )
  RETURNING orders.id INTO v_id;

  RETURN QUERY SELECT v_id, v_confirmation_code;
END;
$$;

-- Allow public callers to invoke it
GRANT EXECUTE ON FUNCTION public.create_order_with_payment_proof(
  text, text, text, text, text, text, text, text, numeric, integer, numeric, text
) TO anon, authenticated;