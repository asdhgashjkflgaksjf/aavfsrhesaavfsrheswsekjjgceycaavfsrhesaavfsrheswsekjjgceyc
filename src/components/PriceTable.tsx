import { TrendingUp, TrendingDown, RefreshCw, Minus } from "lucide-react";
import { useGoldPrices, calculatePriceChange } from "@/hooks/useGoldPrices";
import { Skeleton } from "@/components/ui/skeleton";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

const formatPercentage = (percentage: number) => {
  const sign = percentage > 0 ? "+" : "";
  return `${sign}${percentage.toFixed(2)}%`;
};

const PriceTable = () => {
  const { data: prices, isLoading, error } = useGoldPrices();

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  if (isLoading) {
    return (
      <section id="harga" className="py-20 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center mb-12">
            <Skeleton className="h-8 w-48 mx-auto mb-4" />
            <Skeleton className="h-12 w-80 mx-auto mb-4" />
            <Skeleton className="h-4 w-64 mx-auto" />
          </div>
          <div className="max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="harga" className="py-20 relative">
        <div className="container mx-auto px-4 text-center">
          <p className="text-destructive">Gagal memuat harga emas</p>
        </div>
      </section>
    );
  }

  return (
    <section id="harga" className="py-20 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-secondary/30 to-background" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-4">
            <TrendingUp className="w-4 h-4 text-primary" />
            <span className="text-sm text-primary font-medium">Update Harian</span>
          </div>
          <h2 className="font-serif text-4xl md:text-5xl font-bold mb-4">
            <span className="text-gold-gradient">Harga Emas</span> Hari Ini
          </h2>
          <p className="text-muted-foreground flex items-center justify-center gap-2">
            <RefreshCw className="w-4 h-4" />
            {today}
          </p>
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {prices?.map((item, index) => {
              const { change, percentage } = calculatePriceChange(item.price, item.previous_price);
              const isUp = change > 0;
              const isDown = change < 0;
              const isUnchanged = change === 0;

              return (
                <div 
                  key={item.id}
                  className="card-luxury rounded-xl p-6 text-center hover-lift animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <div className="text-sm text-muted-foreground mb-2">Emas Antam</div>
                  <div className="font-serif text-2xl font-bold text-gold-gradient mb-3">
                    {item.weight}
                  </div>
                  <div className="text-lg font-semibold text-foreground mb-2">
                    {formatPrice(item.price)}
                  </div>
                  
                  {/* Price Change Indicator */}
                  <div className={`flex items-center justify-center gap-1 text-xs font-medium ${
                    isUp ? "text-green-500" : isDown ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {isUp && <TrendingUp className="w-3 h-3" />}
                    {isDown && <TrendingDown className="w-3 h-3" />}
                    {isUnchanged && <Minus className="w-3 h-3" />}
                    <span>
                      {isUnchanged ? "Tidak berubah" : formatPercentage(percentage)}
                    </span>
                  </div>
                  {!isUnchanged && (
                    <div className={`text-xs mt-1 ${
                      isUp ? "text-green-500/70" : "text-red-500/70"
                    }`}>
                      {isUp ? "+" : ""}{formatPrice(change)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          <p className="text-center text-sm text-muted-foreground mt-8">
            * Harga dapat berubah sewaktu-waktu mengikuti harga pasar emas dunia
          </p>
        </div>
      </div>
    </section>
  );
};

export default PriceTable;
