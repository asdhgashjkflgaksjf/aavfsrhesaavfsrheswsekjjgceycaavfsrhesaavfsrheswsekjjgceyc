import { useState, useEffect } from "react";
import { Gem } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import ProductCard from "./ProductCard";
import ProductSkeleton from "./ProductSkeleton";

interface Product {
  id: string;
  name: string;
  weight: string;
  description: string | null;
  original_price: number;
  discounted_price: number;
  discount: number;
  sold: number;
  is_best_seller: boolean;
  is_active: boolean;
  image_url: string | null;
  sort_order: number;
}

interface ProductGridProps {
  onBuy: (product: { name: string; weight: string; price: number; image: string }) => void;
}

const ProductGrid = ({ onBuy }: ProductGridProps) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (error) {
          console.error('Error fetching products:', error);
          return;
        }

        setProducts(data as Product[]);
      } catch (err) {
        console.error('Error:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleBuy = (weight: string, price: number) => {
    const product = products.find((p) => p.weight === weight);
    if (product) {
      onBuy({
        name: product.name,
        weight: product.weight,
        price: price,
        image: product.image_url || '/placeholder.svg',
      });
    }
  };

  return (
    <section id="produk" className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <Gem className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Koleksi Emas Antam</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gold-gradient">Produk</span> Kami
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pilih emas batangan Antam sesuai kebutuhan investasi Anda. 
            Semua produk dilengkapi sertifikat asli dan garansi buyback.
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoading
            ? Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductSkeleton />
                </div>
              ))
            : products.map((product, index) => (
                <div
                  key={product.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ProductCard
                    weight={product.weight}
                    description={product.description || ''}
                    originalPrice={product.original_price}
                    discountedPrice={product.discounted_price}
                    discount={product.discount}
                    sold={product.sold}
                    isBestSeller={product.is_best_seller}
                    image={product.image_url || '/placeholder.svg'}
                    onBuy={handleBuy}
                  />
                </div>
              ))}
        </div>
      </div>
    </section>
  );
};

export default ProductGrid;