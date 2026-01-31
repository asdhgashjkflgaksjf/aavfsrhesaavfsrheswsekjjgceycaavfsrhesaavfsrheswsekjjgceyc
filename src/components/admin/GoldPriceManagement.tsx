import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Save, RefreshCw, TrendingUp, TrendingDown, Info } from "lucide-react";
import { useBaseGoldPrice, calculatePriceChange } from "@/hooks/useGoldPrices";

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
};

// Weight multipliers for preview
const WEIGHT_PREVIEWS = [
  { weight: "0.5 Gram", multiplier: 0.5 },
  { weight: "1 Gram", multiplier: 1 },
  { weight: "2 Gram", multiplier: 2 },
  { weight: "5 Gram", multiplier: 5 },
  { weight: "10 Gram", multiplier: 10 },
  { weight: "25 Gram", multiplier: 25 },
];

const GoldPriceManagement = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newPrice, setNewPrice] = useState<string>("");

  const { data: basePrice, isLoading } = useBaseGoldPrice();

  const updatePriceMutation = useMutation({
    mutationFn: async ({ newPrice, currentPrice }: { newPrice: number; currentPrice: number }) => {
      const { error } = await supabase
        .from("gold_prices")
        .update({ 
          price: newPrice, 
          previous_price: currentPrice,
          price_date: new Date().toISOString().split('T')[0]
        })
        .eq("weight", "1 Gram");

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["base-gold-price"] });
      queryClient.invalidateQueries({ queryKey: ["gold-prices"] });
      toast({
        title: "Berhasil!",
        description: "Harga emas 1 gram diperbarui. Semua berat lain otomatis menyesuaikan.",
      });
      setNewPrice("");
    },
    onError: () => {
      toast({
        title: "Gagal!",
        description: "Terjadi kesalahan saat memperbarui harga",
        variant: "destructive",
      });
    },
  });

  const handleSavePrice = () => {
    if (!basePrice) return;
    
    const priceValue = parseFloat(newPrice);
    if (isNaN(priceValue) || priceValue <= 0) {
      toast({
        title: "Error",
        description: "Masukkan harga yang valid",
        variant: "destructive",
      });
      return;
    }
    updatePriceMutation.mutate({ newPrice: priceValue, currentPrice: basePrice.price });
  };

  const refreshPrices = () => {
    queryClient.invalidateQueries({ queryKey: ["base-gold-price"] });
    queryClient.invalidateQueries({ queryKey: ["gold-prices"] });
    toast({
      title: "Harga Diperbarui",
      description: "Data harga emas telah disegarkan",
    });
  };

  if (isLoading || !basePrice) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Manajemen Harga Emas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        </CardContent>
      </Card>
    );
  }

  const { change, percentage } = calculatePriceChange(basePrice.price, basePrice.previous_price);
  const isUp = change > 0;
  const isDown = change < 0;
  const previewPrice = newPrice ? parseFloat(newPrice) : basePrice.price;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Manajemen Harga Emas
          </CardTitle>
          <CardDescription>
            Cukup update harga 1 gram, berat lainnya otomatis menyesuaikan.
          </CardDescription>
        </div>
        <Button variant="outline" size="sm" onClick={refreshPrices}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Current 1 Gram Price Display */}
        <div className="bg-muted/50 rounded-xl p-6 border border-border/50">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Harga Saat Ini (1 Gram)</p>
              <p className="text-3xl font-bold text-gold-gradient">{formatPrice(basePrice.price)}</p>
              {basePrice.previous_price && (
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm text-muted-foreground">Sebelumnya:</span>
                  <span className="text-sm">{formatPrice(basePrice.previous_price)}</span>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    isUp ? "text-green-500" : isDown ? "text-red-500" : "text-muted-foreground"
                  }`}>
                    {isUp && <TrendingUp className="h-3 w-3" />}
                    {isDown && <TrendingDown className="h-3 w-3" />}
                    ({isUp ? "+" : ""}{percentage.toFixed(2)}%)
                  </span>
                </div>
              )}
            </div>
            <div className="text-right text-sm text-muted-foreground">
              <p>Terakhir diperbarui:</p>
              <p className="font-medium text-foreground">
                {new Date(basePrice.price_date).toLocaleDateString('id-ID', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </div>
        </div>

        {/* Update Price Form */}
        <div className="space-y-3">
          <Label htmlFor="newPrice" className="text-sm font-semibold">
            Update Harga 1 Gram
          </Label>
          <div className="flex gap-3">
            <Input
              id="newPrice"
              type="number"
              placeholder="Masukkan harga baru..."
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              className="flex-1"
            />
            <Button
              onClick={handleSavePrice}
              disabled={updatePriceMutation.isPending || !newPrice}
            >
              {updatePriceMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Simpan
            </Button>
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-primary/10 rounded-lg p-4 flex items-start gap-3 border border-primary/20">
          <Info className="h-5 w-5 text-primary shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-primary mb-1">Perhitungan Otomatis</p>
            <p className="text-muted-foreground">
              Semua berat emas (0.5g, 2g, 5g, 10g, 25g, 50g, 100g) akan dihitung otomatis berdasarkan harga 1 gram yang Anda input.
            </p>
          </div>
        </div>

        {/* Preview of All Weights */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">Preview Harga Semua Berat</Label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {WEIGHT_PREVIEWS.map((item) => (
              <div 
                key={item.weight} 
                className={`rounded-lg p-3 border text-center ${
                  item.weight === "1 Gram" 
                    ? "bg-primary/10 border-primary/30" 
                    : "bg-muted/50 border-border/50"
                }`}
              >
                <p className="text-xs text-muted-foreground">{item.weight}</p>
                <p className={`font-semibold ${item.weight === "1 Gram" ? "text-primary" : ""}`}>
                  {formatPrice(Math.round(previewPrice * item.multiplier))}
                </p>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default GoldPriceManagement;
