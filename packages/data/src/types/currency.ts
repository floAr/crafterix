import type { Rarity } from "./item.js";

export type CurrencyTier = "lesser" | "normal" | "greater" | "perfect" | "corrupted";

export type CurrencyEffect =
  | "upgrade_rarity" // Transmute, Alch
  | "add_affix" // Augment, Exalt
  | "remove_affix" // Annul
  | "reforge" // Chaos
  | "upgrade_magic_to_rare" // Regal
  | "upgrade_magic_to_rare_guaranteed" // Lesser/Normal/Greater Essence (magic→rare + guaranteed mod)
  | "randomize_values" // Divine
  | "corrupt" // Vaal
  | "guaranteed_mod"; // Perfect Essence (removes mod + adds guaranteed)

export interface WeightModification {
  tag: string;
  multiplier: number; // 0 = blocked, >1 = more likely
}

export interface Currency {
  id: string;
  name: string;
  tier: CurrencyTier;
  effect: CurrencyEffect;
  description: string;
  applicableToRarity: Rarity[];
  applicableToCategories?: string[]; // If undefined, applies to all
  minItemLevel?: number; // For Greater/Perfect variants
  weightModifications?: WeightModification[];
  guaranteedModId?: string; // For essences
  modPoolFilter?: string[]; // Tags to filter available mod pool
}

export interface Omen {
  id: string;
  name: string;
  description: string;
  appliesTo: string[]; // Currency IDs this omen can modify
  effect: OmenEffect;
  exclusiveGroup?: string; // Omens in same group can't be used together
}

export type OmenEffect =
  | { type: "guarantee_tier"; minTier: number }
  | { type: "add_mod"; modId: string }
  | { type: "protect_mod"; modType: "prefix" | "suffix" }
  | { type: "force_mod_type"; modType: "prefix" | "suffix" }
  | { type: "maximize_prefixes" }
  | { type: "maximize_suffixes" }
  | { type: "double_mod" }
  | { type: "remove_lowest_tier" }
  | { type: "controlled_corruption" }
  | { type: "custom"; handler: string };
