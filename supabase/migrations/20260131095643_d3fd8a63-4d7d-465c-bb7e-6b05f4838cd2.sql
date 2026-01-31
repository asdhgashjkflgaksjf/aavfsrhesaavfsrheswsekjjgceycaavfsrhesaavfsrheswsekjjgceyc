-- Create gold_prices table to store daily gold prices
CREATE TABLE public.gold_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  weight TEXT NOT NULL,
  price NUMERIC NOT NULL,
  previous_price NUMERIC,
  price_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(weight, price_date)
);

-- Enable RLS
ALTER TABLE public.gold_prices ENABLE ROW LEVEL SECURITY;

-- Anyone can view gold prices
CREATE POLICY "Anyone can view gold prices"
ON public.gold_prices
FOR SELECT
USING (true);

-- Admins can manage gold prices
CREATE POLICY "Admins can manage gold prices"
ON public.gold_prices
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_gold_prices_updated_at
BEFORE UPDATE ON public.gold_prices
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert initial prices
INSERT INTO public.gold_prices (weight, price, previous_price) VALUES
('0.5 Gram', 1385956, 1383500),
('1 Gram', 2671663, 2667000),
('3 Gram', 7899700, 7886000),
('5 Gram', 13132750, 13110000),
('10 Gram', 26210363, 26165000),
('25 Gram', 65400093, 65287000),
('50 Gram', 130720988, 130494000),
('100 Gram', 261363780, 260910000);