-- Create orders table to store order information
CREATE TABLE public.orders (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  order_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_address TEXT NOT NULL,
  shipping_method TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_weight TEXT NOT NULL,
  product_price NUMERIC NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  total_price NUMERIC NOT NULL,
  payment_proof_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending_payment',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on orders table
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

-- Create policy for inserting orders (anyone can create an order)
CREATE POLICY "Anyone can create orders" 
ON public.orders 
FOR INSERT 
WITH CHECK (true);

-- Create policy for viewing orders by order number
CREATE POLICY "Anyone can view their order by number" 
ON public.orders 
FOR SELECT 
USING (true);

-- Create policy for updating orders (for payment proof upload)
CREATE POLICY "Anyone can update orders" 
ON public.orders 
FOR UPDATE 
USING (true);

-- Create storage bucket for payment proofs
INSERT INTO storage.buckets (id, name, public)
VALUES ('payment-proofs', 'payment-proofs', true);

-- Create storage policy for uploading payment proofs
CREATE POLICY "Anyone can upload payment proofs"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

-- Create storage policy for viewing payment proofs
CREATE POLICY "Anyone can view payment proofs"
ON storage.objects
FOR SELECT
USING (bucket_id = 'payment-proofs');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_orders_updated_at
BEFORE UPDATE ON public.orders
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();