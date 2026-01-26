import { useState } from "react";
import type { Currency } from "@crafterix/data";
import { CurrencyTooltip } from "./CurrencyTooltip";
import { getCurrencyImagePath } from "../utils/currency-images";

export interface CurrencyButtonProps {
  currency: Currency;
  isSelected: boolean;
  canApply: boolean;
  disabledReason: string | null;
  isHovered: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
  compact?: boolean;
}

export function CurrencyButton({
  currency,
  isSelected,
  canApply,
  disabledReason,
  isHovered,
  onHover,
  onSelect,
  compact = false,
}: CurrencyButtonProps) {
  const imagePath = getCurrencyImagePath(currency.id);
  const [imageError, setImageError] = useState(false);

  // Fallback to text abbreviation if image fails
  const fallbackText = currency.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2);

  return (
    <div className={compact ? "w-8 h-8" : "relative"}>
      <button
        className={`
          ${compact ? "w-8 h-8" : "aspect-square w-full"} rounded border transition-all flex items-center justify-center ${compact ? "p-0.5" : "p-1"}
          ${
            isSelected
              ? "bg-poe-currency/30 border-poe-currency ring-1 ring-poe-currency/50"
              : canApply
              ? "bg-poe-panel border-poe-border hover:border-poe-currency/50 hover:bg-poe-currency/10"
              : "bg-poe-panel/30 border-poe-border/30 opacity-40 cursor-not-allowed"
          }
        `}
        onClick={onSelect}
        disabled={!canApply}
        onMouseEnter={() => onHover(currency.id)}
        onMouseLeave={() => onHover(null)}
        title={disabledReason ?? undefined}
      >
        {!imageError ? (
          <img
            src={imagePath}
            alt={currency.name}
            className="w-full h-full object-contain"
            onError={() => setImageError(true)}
          />
        ) : (
          <span className={`${compact ? "text-[8px]" : "text-xs"} font-bold text-poe-normal/60`}>{fallbackText}</span>
        )}
      </button>

      {/* Tooltip */}
      <CurrencyTooltip currency={currency} visible={isHovered && canApply} />
    </div>
  );
}
