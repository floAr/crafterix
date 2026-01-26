import type { ItemBase, Rarity } from "./item.js";
import type { RolledCorruptedImplicit, RolledModifier } from "./modifier.js";

export interface CraftedItem {
  base: ItemBase;
  rarity: Rarity;
  prefixes: RolledModifier[];
  suffixes: RolledModifier[];
  corrupted: boolean;
  corruptedImplicit?: RolledCorruptedImplicit;
}

export function canAddPrefix(item: CraftedItem): boolean {
  return item.prefixes.length < item.base.affixSlots.maxPrefixes && !item.corrupted;
}

export function canAddSuffix(item: CraftedItem): boolean {
  return item.suffixes.length < item.base.affixSlots.maxSuffixes && !item.corrupted;
}

export function canAddAffix(item: CraftedItem): boolean {
  return canAddPrefix(item) || canAddSuffix(item);
}

export function getTotalAffixCount(item: CraftedItem): number {
  return item.prefixes.length + item.suffixes.length;
}

export function createNormalItem(base: ItemBase): CraftedItem {
  return {
    base,
    rarity: "normal",
    prefixes: [],
    suffixes: [],
    corrupted: false,
  };
}
