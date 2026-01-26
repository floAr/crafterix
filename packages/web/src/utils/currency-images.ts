/**
 * Get the image path for a currency item
 */
export function getCurrencyImagePath(currencyId: string): string {
  // Convert ID to filename format (lowercase, underscores)
  const filename = currencyId.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
  return `/currency/${filename}.webp`;
}

/**
 * Currency categories for sidebar tabs
 */
export const CURRENCY_CATEGORIES = {
  simple: [
    "orb_of_transmutation",
    "orb_of_augmentation",
    "regal_orb",
    "orb_of_alchemy",
    "exalted_orb",
    "orb_of_annulment",
    "chaos_orb",
    "divine_orb",
    "vaal_orb",
  ],
  advanced: [
    // Transmutation variants
    "orb_of_transmutation",
    "greater_orb_of_transmutation",
    "perfect_orb_of_transmutation",
    // Augmentation variants
    "orb_of_augmentation",
    "greater_orb_of_augmentation",
    "perfect_orb_of_augmentation",
    // Regal variants
    "regal_orb",
    "greater_regal_orb",
    "perfect_regal_orb",
    // Exalted variants
    "exalted_orb",
    "greater_exalted_orb",
    "perfect_exalted_orb",
    // Chaos variants
    "chaos_orb",
    "greater_chaos_orb",
    "perfect_chaos_orb",
    // Other
    "orb_of_alchemy",
    "orb_of_annulment",
    "divine_orb",
    "vaal_orb",
  ],
} as const;

/**
 * Essence types (the base name without tier prefix)
 */
export const ESSENCE_TYPES = [
  "body", "mind", "enhancement", "abrasion",
  "flames", "ice", "electricity", "ruin",
  "battle", "sorcery", "haste", "infinite",
  "seeking", "insulation", "thawing", "grounding",
  "alacrity", "opulence", "command",
] as const;

export type EssenceType = typeof ESSENCE_TYPES[number];

/**
 * Display labels for essence types (theme/stat they grant)
 */
export const ESSENCE_TYPE_LABELS: Record<EssenceType, string> = {
  body: "Life",
  mind: "Mana",
  enhancement: "All Attributes",
  abrasion: "Phys Damage",
  flames: "Fire Damage",
  ice: "Cold Damage",
  electricity: "Lightning Damage",
  ruin: "Chaos Damage",
  battle: "Attack Speed",
  sorcery: "Cast Speed",
  haste: "Movement Speed",
  infinite: "Spell Damage",
  seeking: "Accuracy",
  insulation: "Fire Resist",
  thawing: "Cold Resist",
  grounding: "Lightning Resist",
  alacrity: "Dexterity",
  opulence: "Rarity",
  command: "Minion Damage",
};

/**
 * Get essence ID for a given type and tier
 */
export function getEssenceId(type: EssenceType, tier: "lesser" | "normal" | "greater" | "perfect"): string {
  const suffix = type === "body" ? "the_body" : type === "mind" ? "the_mind" : type === "infinite" ? "the_infinite" : type;
  switch (tier) {
    case "lesser": return `lesser_essence_of_${suffix}`;
    case "normal": return `essence_of_${suffix}`;
    case "greater": return `greater_essence_of_${suffix}`;
    case "perfect": return `perfect_essence_of_${suffix}`;
  }
}

/**
 * Essence categories by tier
 */
export const ESSENCE_CATEGORIES = {
  lesser: ESSENCE_TYPES.map(t => `lesser_essence_of_${t === "body" ? "the_body" : t === "mind" ? "the_mind" : t === "infinite" ? "the_infinite" : t}`),
  normal: ESSENCE_TYPES.map(t => `essence_of_${t === "body" ? "the_body" : t === "mind" ? "the_mind" : t === "infinite" ? "the_infinite" : t}`),
  greater: ESSENCE_TYPES.map(t => `greater_essence_of_${t === "body" ? "the_body" : t === "mind" ? "the_mind" : t === "infinite" ? "the_infinite" : t}`),
  perfect: ESSENCE_TYPES.map(t => `perfect_essence_of_${t === "body" ? "the_body" : t === "mind" ? "the_mind" : t === "infinite" ? "the_infinite" : t}`),
  corrupted: [
    "essence_of_hysteria",
    "essence_of_delirium",
    "essence_of_horror",
    "essence_of_insanity",
    "essence_of_the_abyss",
  ],
} as const;

export type EssenceTier = keyof typeof ESSENCE_CATEGORIES;

/**
 * Omen IDs for the omens tab (displayed separately from currency)
 */
export const OMEN_IDS = [
  "omen_of_amelioration",
  "omen_of_sinistral_alchemy",
  "omen_of_dextral_alchemy",
  "omen_of_sinistral_exaltation",
  "omen_of_dextral_exaltation",
  "omen_of_greater_exaltation",
  "omen_of_sinistral_crystallisation",
  "omen_of_dextral_crystallisation",
  "omen_of_whittling",
  "omen_of_corruption",
] as const;

export type CurrencyCategory = keyof typeof CURRENCY_CATEGORIES;
