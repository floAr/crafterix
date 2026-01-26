export type ModifierType = "prefix" | "suffix";

// Placeholder mod IDs for "any random mod" selections
export const ANY_PREFIX = "__any_prefix__";
export const ANY_SUFFIX = "__any_suffix__";

export function isPlaceholderMod(modifierId: string): boolean {
  return modifierId === ANY_PREFIX || modifierId === ANY_SUFFIX;
}

export type ModifierDomain =
  | "item"
  | "flask"
  | "jewel"
  | "map"
  | "crafted"
  | "desecrated";

export interface ModifierTier {
  tier: number;
  requiredLevel: number;
  weight: number;
  values: {
    min: number;
    max: number;
  }[];
}

export interface Modifier {
  id: string;
  name: string; // Internal name (e.g., "IncreasedLife")
  displayName: string; // Display text template (e.g., "+# to maximum Life")
  type: ModifierType;
  domain: ModifierDomain;
  group: string; // Mods in same group are mutually exclusive
  tags: string[]; // Tags for filtering (e.g., "life", "attack", "physical")
  tiers: ModifierTier[];
  applicableTo: string[]; // Item tags this mod can roll on
}

export interface RolledModifier {
  modifierId: string;
  tier: number;
  values: number[];
}

export interface CorruptedImplicit {
  id: string;
  displayName: string; // e.g., "+#% to Fire Resistance"
  applicableTo: string[]; // Item tags
  values: { min: number; max: number }[];
}

export interface RolledCorruptedImplicit {
  implicitId: string;
  values: number[];
}
