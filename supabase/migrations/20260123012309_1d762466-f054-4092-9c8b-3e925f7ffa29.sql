-- Create products table
CREATE TABLE public.products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  weight TEXT NOT NULL,
  description TEXT,
  original_price NUMERIC NOT NULL,
  discounted_price NUMERIC NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  sold INTEGER NOT NULL DEFAULT 0,
  is_best_seller BOOLEAN NOT NULL DEFAULT false,
  is_active BOOLEAN NOT NULL DEFAULT true,
  image_url TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Everyone can view active products (for storefront)
CREATE POLICY "Anyone can view active products"
ON public.products
FOR SELECT
USING (is_active = true);

-- Admins can view all products including inactive
CREATE POLICY "Admins can view all products"
ON public.products
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can insert products
CREATE POLICY "Admins can create products"
ON public.products
FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- Admins can update products
CREATE POLICY "Admins can update products"
ON public.products
FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Admins can delete products
CREATE POLICY "Admins can delete products"
ON public.products
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_products_updated_at
BEFORE UPDATE ON public.products
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default products from current hardcoded data
INSERT INTO public.products (name, weight, description, original_price, discounted_price, discount, sold, is_best_seller, image_url, sort_order) VALUES
('Emas Antam 0.5 Gram', '0.5 Gram', 'Emas batangan Antam dengan berat 0.5 gram. Cocok untuk mulai investasi.', 1574950, 1385956, 12, 1250, true, 'https://officialbutikmasantam.com/0,5gram.jpg', 1),
('Emas Antam 1 Gram', '1 Gram', 'Emas batangan Antam dengan berat 1 gram. Pilihan favorit investor pemula.', 2968514, 2671663, 10, 980, true, 'https://officialbutikmasantam.com/1gram.jpg', 2),
('Emas Antam 3 Gram', '3 Gram', 'Emas batangan Antam dengan berat 3 gram. Nilai investasi lebih optimal.', 8976932, 7899700, 12, 650, false, 'https://officialbutikmasantam.com/3gram.jpg', 3),
('Emas Antam 5 Gram', '5 Gram', 'Emas batangan Antam dengan berat 5 gram. Pilihan tepat untuk tabungan.', 14591944, 13132750, 10, 420, false, 'https://officialbutikmasantam.com/5gram.jpg', 4),
('Emas Antam 10 Gram', '10 Gram', 'Emas batangan Antam dengan berat 10 gram. Investasi jangka panjang.', 31963857, 26210363, 18, 280, false, 'https://officialbutikmasantam.com/10gram.jpg', 5),
('Emas Antam 25 Gram', '25 Gram', 'Emas batangan Antam dengan berat 25 gram. Untuk investor serius.', 73483251, 65400093, 11, 150, false, 'https://officialbutikmasantam.com/25gram.jpg', 6),
('Emas Antam 50 Gram', '50 Gram', 'Emas batangan Antam dengan berat 50 gram. Investasi premium.', 145245542, 130720988, 10, 85, false, 'https://officialbutikmasantam.com/50gram.jpg', 7),
('Emas Antam 100 Gram', '100 Gram', 'Emas batangan Antam dengan berat 100 gram. Aset investasi maksimal.', 318736317, 261363780, 18, 45, false, 'https://officialbutikmasantam.com/100gram.jpg', 8);