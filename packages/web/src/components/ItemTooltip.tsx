import type { CraftedItem, Rarity } from "@crafterix/data";
import { formatModText } from "../utils/mod-display";

interface ItemTooltipProps {
  item: CraftedItem;
}

const rarityColors: Record<Rarity, { border: string; header: string; text: string }> = {
  normal: {
    border: "border-poe-normal/50",
    header: "bg-poe-normal/20",
    text: "text-poe-normal",
  },
  magic: {
    border: "border-poe-magic/50",
    header: "bg-poe-magic/20",
    text: "text-poe-magic",
  },
  rare: {
    border: "border-poe-rare/50",
    header: "bg-poe-rare/20",
    text: "text-poe-rare",
  },
};

export function ItemTooltip({ item }: ItemTooltipProps) {
  const colors = rarityColors[item.rarity];

  return (
    <div
      className={`
        min-w-64 max-w-80
        border-2 ${colors.border}
        bg-poe-bg/95
        rounded
        shadow-lg
      `}
    >
      {/* Header */}
      <div className={`${colors.header} px-4 py-2 text-center border-b ${colors.border}`}>
        <div className={`font-bold ${colors.text}`}>
          {item.rarity === "rare" ? "Crafted Item" : item.base.name}
        </div>
        {item.rarity === "rare" && (
          <div className={`text-sm ${colors.text}/80`}>{item.base.name}</div>
        )}
      </div>

      {/* Separator line */}
      <div className="h-px bg-gradient-to-r from-transparent via-poe-border to-transparent" />

      {/* Stats section */}
      <div className="px-4 py-3 space-y-1">
        {/* Item Level */}
        <div className="text-poe-normal/60 text-sm">Item Level: {item.base.itemLevel}</div>

        {/* Separator */}
        <div className="h-px bg-poe-border/50 my-2" />

        {/* Implicit mods */}
        {item.base.implicitMods.length > 0 && (
          <>
            {item.base.implicitMods.map((mod, i) => (
              <div key={i} className="text-poe-magic">
                {mod.text}
              </div>
            ))}
            <div className="h-px bg-poe-border/50 my-2" />
          </>
        )}

        {/* Prefixes */}
        {item.prefixes.map((mod, i) => (
          <div key={`p-${i}`} className="text-poe-magic">
            {formatModText(mod.modifierId, mod.values)}
            <span className="text-poe-normal/40 text-xs ml-1">(T{mod.tier})</span>
          </div>
        ))}

        {/* Suffixes */}
        {item.suffixes.map((mod, i) => (
          <div key={`s-${i}`} className="text-poe-magic">
            {formatModText(mod.modifierId, mod.values)}
            <span className="text-poe-normal/40 text-xs ml-1">(T{mod.tier})</span>
          </div>
        ))}

        {/* Empty slots indicator */}
        {item.rarity !== "normal" && (
          <div className="text-poe-normal/30 text-xs mt-2">
            {item.prefixes.length}/{item.base.affixSlots.maxPrefixes} Prefixes |{" "}
            {item.suffixes.length}/{item.base.affixSlots.maxSuffixes} Suffixes
          </div>
        )}

        {/* Corrupted indicator */}
        {item.corrupted && (
          <>
            <div className="h-px bg-poe-border/50 my-2" />
            <div className="text-red-500 font-bold text-center">Corrupted</div>
          </>
        )}
      </div>
    </div>
  );
}
