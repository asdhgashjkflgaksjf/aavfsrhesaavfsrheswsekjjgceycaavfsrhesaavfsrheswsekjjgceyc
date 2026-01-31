-- Function to get order by order_number for public viewing (no auth required)
CREATE OR REPLACE FUNCTION public.get_order_by_order_number(p_order_number text)
RETURNS TABLE(
  id uuid,
  order_number text,
  customer_name text,
  customer_email text,
  customer_phone text,
  customer_address text,
  shipping_method text,
  product_name text,
  product_weight text,
  product_price numeric,
  quantity integer,
  total_price numeric,
  payment_proof_url text,
  status text,
  confirmation_code text,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF p_order_number IS NULL OR btrim(p_order_number) = '' THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    o.id,
    o.order_number,
    o.customer_name,
    o.customer_email,
    o.customer_phone,
    o.customer_address,
    o.shipping_method,
    o.product_name,
    o.product_weight,
    o.product_price,
    o.quantity,
    o.total_price,
    o.payment_proof_url,
    o.status,
    o.confirmation_code,
    o.created_at,
    o.updated_at
  FROM public.orders o
  WHERE o.order_number = p_order_number;
END;
$$;

-- Allow public callers
GRANT EXECUTE ON FUNCTION public.get_order_by_order_number(text) TO anon, authenticated;