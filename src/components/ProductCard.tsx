import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye, Star, TrendingUp } from "lucide-react";
import { useState } from "react";

interface ProductCardProps {
  weight: string;
  description: string;
  originalPrice: number;
  discountedPrice: number;
  discount: number;
  sold: number;
  isBestSeller?: boolean;
  image: string;
  onBuy: (weight: string, price: number) => void;
}

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const ProductCard = ({
  weight,
  description,
  originalPrice,
  discountedPrice,
  discount,
  sold,
  isBestSeller = false,
  image,
  onBuy,
}: ProductCardProps) => {
  const [quantity, setQuantity] = useState(1);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className="card-luxury rounded-2xl overflow-hidden hover-lift group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image container */}
      <div className="relative aspect-square overflow-hidden bg-secondary/50">
        <img 
          src={image} 
          alt={`Emas Antam ${weight}`}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        
        {/* Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {isBestSeller && (
            <Badge className="bg-gradient-gold text-primary-foreground font-semibold flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              TERLARIS
            </Badge>
          )}
          <Badge variant="destructive" className="font-semibold">
            DISKON {discount}%
          </Badge>
        </div>
        
        {/* Quick view overlay */}
        <div className={`absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <Button variant="goldOutline" size="sm" className="gap-2">
            <Eye className="w-4 h-4" />
            Lihat Detail
          </Button>
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        <h3 className="font-serif text-xl font-bold text-foreground mb-2">
          Emas Antam {weight}
        </h3>
        <p className="text-sm text-muted-foreground mb-4">{description}</p>
        
        {/* Price */}
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm text-muted-foreground line-through">
              {formatPrice(originalPrice)}
            </span>
            <Badge variant="outline" className="text-xs border-primary/50 text-primary">
              -{discount}%
            </Badge>
          </div>
          <div className="text-2xl font-bold text-gold-gradient">
            {formatPrice(discountedPrice)}
          </div>
        </div>
        
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
          <div className="flex items-center gap-1">
            <Star className="w-4 h-4 text-primary fill-primary" />
            <span>4.9</span>
          </div>
          <span>Terjual: {sold.toLocaleString()}</span>
        </div>
        
        {/* Quantity */}
        <div className="flex items-center gap-3 mb-4">
          <span className="text-sm text-muted-foreground">Jumlah:</span>
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button 
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3 py-1 hover:bg-secondary transition-colors"
            >
              -
            </button>
            <span className="px-4 py-1 bg-secondary/50">{quantity}</span>
            <button 
              onClick={() => setQuantity(quantity + 1)}
              className="px-3 py-1 hover:bg-secondary transition-colors"
            >
              +
            </button>
          </div>
        </div>
        
        {/* Action buttons */}
        <div className="flex gap-2">
          <Button 
            variant="gold" 
            className="flex-1 gap-2"
            onClick={() => onBuy(weight, discountedPrice * quantity)}
          >
            <ShoppingCart className="w-4 h-4" />
            BELI
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
