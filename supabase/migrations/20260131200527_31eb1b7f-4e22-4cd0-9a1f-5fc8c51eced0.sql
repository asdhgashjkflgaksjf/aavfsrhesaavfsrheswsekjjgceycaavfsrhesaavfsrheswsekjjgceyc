-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Anyone can create orders with valid data" ON public.orders;

-- Create a PERMISSIVE INSERT policy for public order creation
CREATE POLICY "Anyone can create orders with valid data"
ON public.orders
FOR INSERT
TO anon, authenticated
WITH CHECK (
  customer_name IS NOT NULL AND customer_name <> '' AND
  customer_email IS NOT NULL AND customer_email <> '' AND
  customer_phone IS NOT NULL AND customer_phone <> '' AND
  customer_address IS NOT NULL AND customer_address <> '' AND
  product_name IS NOT NULL AND product_name <> '' AND
  order_number IS NOT NULL AND order_number <> ''
);