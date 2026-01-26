export type ItemCategory =
  | "one_hand_weapon"
  | "two_hand_weapon"
  | "body_armour"
  | "helmet"
  | "gloves"
  | "boots"
  | "shield"
  | "quiver"
  | "focus"
  | "amulet"
  | "ring"
  | "belt"
  | "jewel"
  | "flask"
  | "relic"
  | "tablet"
  | "waystone";

export type ItemAttribute = "str" | "dex" | "int" | "str_dex" | "str_int" | "dex_int" | "none";

export type Rarity = "normal" | "magic" | "rare";

export interface AffixSlots {
  maxPrefixes: number;
  maxSuffixes: number;
}

export interface ImplicitMod {
  id: string;
  text: string;
  values?: number[];
}

export interface ItemBase {
  id: string;
  name: string;
  category: ItemCategory;
  subCategory?: string; // e.g., "claws", "daggers" for weapons
  attribute: ItemAttribute;
  itemLevel: number;
  requiredLevel: number;
  implicitMods: ImplicitMod[];
  affixSlots: AffixSlots;
  tags: string[]; // Used for mod filtering (e.g., "weapon", "attack", "caster")
}
