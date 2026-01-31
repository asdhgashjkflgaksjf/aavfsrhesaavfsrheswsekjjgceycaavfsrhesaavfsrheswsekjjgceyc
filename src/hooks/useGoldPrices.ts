import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface GoldPrice {
  id: string;
  weight: string;
  price: number;
  previous_price: number | null;
  price_date: string;
}

// Weight multipliers based on 1 gram price
const WEIGHT_MULTIPLIERS: Record<string, number> = {
  "0.5 Gram": 0.5,
  "1 Gram": 1,
  "2 Gram": 2,
  "3 Gram": 3,
  "5 Gram": 5,
  "10 Gram": 10,
  "25 Gram": 25,
  "50 Gram": 50,
  "100 Gram": 100,
};

export const useGoldPrices = () => {
  return useQuery({
    queryKey: ["gold-prices"],
    queryFn: async () => {
      // Only fetch 1 Gram price from database
      const { data, error } = await supabase
        .from("gold_prices")
        .select("*")
        .eq("weight", "1 Gram")
        .maybeSingle();

      if (error) throw error;
      
      // Return empty array if no data
      if (!data) {
        return [];
      }
      
      const basePrice = data as GoldPrice;
      
      // Calculate all prices based on 1 gram
      const allPrices: GoldPrice[] = Object.entries(WEIGHT_MULTIPLIERS).map(([weight, multiplier]) => ({
        id: weight === "1 Gram" ? basePrice.id : `calculated-${weight}`,
        weight,
        price: Math.round(basePrice.price * multiplier),
        previous_price: basePrice.previous_price ? Math.round(basePrice.previous_price * multiplier) : null,
        price_date: basePrice.price_date,
      }));

      // Sort by price ascending
      return allPrices.sort((a, b) => a.price - b.price);
    },
    refetchInterval: 60000, // Refetch every minute
  });
};

// Hook to get only 1 gram price for admin
export const useBaseGoldPrice = () => {
  return useQuery({
    queryKey: ["base-gold-price"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gold_prices")
        .select("*")
        .eq("weight", "1 Gram")
        .maybeSingle();

      if (error) throw error;
      return data as GoldPrice | null;
    },
  });
};

export const calculatePriceChange = (current: number, previous: number | null) => {
  if (!previous || previous === 0) return { change: 0, percentage: 0 };
  const change = current - previous;
  const percentage = ((change / previous) * 100);
  return { change, percentage };
};
