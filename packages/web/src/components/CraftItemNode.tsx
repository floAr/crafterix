import { Handle, Position } from "@xyflow/react";
import type { Rarity, RolledModifier } from "@crafterix/data";
import { isPlaceholderMod } from "@crafterix/data";
import { useCrafting, type ItemNode } from "../state/crafting-context";
import { formatModShort } from "../utils/mod-display";

interface CraftItemNodeProps {
  data: {
    node: ItemNode;
  };
}

const rarityColors: Record<Rarity, string> = {
  normal: "border-poe-normal/50 bg-poe-normal/5",
  magic: "border-poe-magic/50 bg-poe-magic/5",
  rare: "border-poe-rare/50 bg-poe-rare/5",
};

const rarityTextColors: Record<Rarity, string> = {
  normal: "text-poe-normal",
  magic: "text-poe-magic",
  rare: "text-poe-rare",
};

interface AffixDisplayProps {
  mod: RolledModifier;
  type: "prefix" | "suffix";
}

function AffixDisplay({ mod, type }: AffixDisplayProps) {
  const isPlaceholder = isPlaceholderMod(mod.modifierId);
  const typeColor = type === "prefix" ? "text-blue-300" : "text-amber-300";
  const placeholderStyle = isPlaceholder ? "italic opacity-60" : "";
  return (
    <div className={`text-xs ${typeColor} ${placeholderStyle} truncate`}>
      {formatModShort(mod.modifierId, mod.values)}
    </div>
  );
}

export function CraftItemNode({ data }: CraftItemNodeProps) {
  const { state, selectItem, openOutcomeModal, canApplyCurrency } = useCrafting();
  const { node } = data;
  const { item } = node;

  const isSelected = state.selectedItemId === node.id;
  const hasCurrencySelected = state.selectedCurrencyId !== null;
  const canApply = hasCurrencySelected && canApplyCurrency(state.selectedCurrencyId!);

  const handleClick = () => {
    if (hasCurrencySelected && canApply) {
      openOutcomeModal(node.id);
    } else {
      selectItem(node.id);
    }
  };

  const hasAffixes = item.prefixes.length > 0 || item.suffixes.length > 0;

  return (
    <>
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-poe-border !w-2 !h-2"
      />

      <div
        className={`
          w-44 text-left px-3 py-2 rounded border-2 transition-all cursor-pointer
          ${rarityColors[item.rarity]}
          ${isSelected ? "ring-2 ring-poe-currency ring-offset-2 ring-offset-poe-bg" : ""}
          ${hasCurrencySelected && canApply ? "hover:border-poe-currency" : ""}
        `}
        onClick={handleClick}
      >
        {/* Header */}
        <div className={`font-semibold text-sm ${rarityTextColors[item.rarity]}`}>
          {item.base.name}
        </div>
        <div className="text-xs text-poe-normal/50 capitalize">
          {item.rarity}
        </div>

        {/* Affixes */}
        {hasAffixes && (
          <div className="mt-2 pt-2 border-t border-poe-border/30 space-y-0.5">
            {item.prefixes.map((mod: RolledModifier, i: number) => (
              <AffixDisplay key={`p-${i}`} mod={mod} type="prefix" />
            ))}
            {item.suffixes.map((mod: RolledModifier, i: number) => (
              <AffixDisplay key={`s-${i}`} mod={mod} type="suffix" />
            ))}
          </div>
        )}

        {/* Affix count */}
        <div className="mt-1 text-xs text-poe-normal/30">
          {item.prefixes.length}P / {item.suffixes.length}S
        </div>

        {/* Apply currency hint */}
        {hasCurrencySelected && canApply && isSelected && (
          <div className="mt-2 text-xs text-poe-currency">
            Click to see outcomes
          </div>
        )}
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-poe-border !w-2 !h-2"
      />
    </>
  );
}
