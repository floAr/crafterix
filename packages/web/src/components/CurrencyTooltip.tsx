import type { Currency } from "@crafterix/data";

interface CurrencyTooltipProps {
  currency: Currency;
  visible: boolean;
}

export function CurrencyTooltip({ currency, visible }: CurrencyTooltipProps) {
  if (!visible) return null;

  // Format applicable rarities
  const rarities = currency.applicableToRarity.map((r) =>
    r.charAt(0).toUpperCase() + r.slice(1)
  ).join(", ");

  return (
    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 pointer-events-none">
      <div className="bg-poe-bg border-2 border-poe-currency rounded-lg shadow-xl p-3 min-w-48 max-w-64">
        {/* Currency name */}
        <div className="text-sm font-bold text-poe-currency mb-1">
          {currency.name}
        </div>

        {/* Description */}
        <div className="text-xs text-poe-normal/80 mb-2">
          {currency.description}
        </div>

        {/* Applicable rarities */}
        <div className="text-xs text-poe-normal/50 border-t border-poe-border/30 pt-2">
          <span className="text-poe-normal/40">Applies to:</span>{" "}
          <span className="text-poe-magic">{rarities}</span>
        </div>

        {/* Guaranteed mod for essences */}
        {currency.guaranteedModId && (
          <div className="text-xs text-poe-unique mt-1">
            Guarantees specific modifier
          </div>
        )}
      </div>

      {/* Arrow pointing down */}
      <div className="absolute left-1/2 -translate-x-1/2 -bottom-1">
        <div className="w-2 h-2 bg-poe-bg border-r-2 border-b-2 border-poe-currency rotate-45" />
      </div>
    </div>
  );
}
