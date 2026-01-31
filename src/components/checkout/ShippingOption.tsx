import { cn } from "@/lib/utils";

interface ShippingOptionProps {
  name: string;
  cost: number;
  selected: boolean;
  onSelect: () => void;
  logo: React.ReactNode;
  compact?: boolean;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

const ShippingOption = ({ name, cost, selected, onSelect, logo, compact = false }: ShippingOptionProps) => {
  if (compact) {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "flex flex-col items-center gap-2 p-3 rounded-xl border-2 cursor-pointer transition-all min-h-[90px]",
          selected
            ? "border-gold bg-gold/10 shadow-md"
            : "border-border/50 hover:border-gold/50 hover:bg-muted/50"
        )}
      >
        <div className="w-14 h-8 flex items-center justify-center bg-white rounded overflow-hidden">
          {logo}
        </div>
        <div className="text-center flex-1">
          <p className="font-medium text-foreground text-xs leading-tight">{name}</p>
          <p className="text-xs text-gold font-semibold mt-0.5">
            {cost === 0 ? "Gratis" : formatCurrency(cost)}
          </p>
        </div>
        <div
          className={cn(
            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
            selected ? "border-gold" : "border-muted-foreground/30"
          )}
        >
          {selected && <div className="w-2 h-2 rounded-full bg-gold" />}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all",
        selected
          ? "border-gold bg-gold/10"
          : "border-border/50 hover:border-gold/50 hover:bg-muted/50"
      )}
    >
      <div className="w-12 h-8 flex items-center justify-center bg-white rounded overflow-hidden">
        {logo}
      </div>
      <div className="flex-1">
        <p className="font-medium text-foreground text-sm">{name}</p>
        <p className="text-xs text-gold">{formatCurrency(cost)}</p>
      </div>
      <div
        className={cn(
          "w-5 h-5 rounded-full border-2 flex items-center justify-center",
          selected ? "border-gold" : "border-muted-foreground/30"
        )}
      >
        {selected && <div className="w-2.5 h-2.5 rounded-full bg-gold" />}
      </div>
    </div>
  );
};

export default ShippingOption;
