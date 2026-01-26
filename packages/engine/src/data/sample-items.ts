import type { ItemBase } from "@crafterix/data";

/**
 * Sample items for testing.
 * Tags must match the granular item tags from poe2db scraping:
 * - body_armour_str, body_armour_dex, body_armour_int, etc.
 * - helmet_str, helmet_dex, helmet_int, etc.
 * - one_hand_weapon, two_hand_weapon
 * - amulet, ring, belt
 */
export const SAMPLE_ITEMS: ItemBase[] = [
  // STR Body Armours
  {
    id: "plate_vest",
    name: "Plate Vest",
    category: "body_armour",
    attribute: "str",
    itemLevel: 20,
    requiredLevel: 1,
    implicitMods: [],
    affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
    tags: ["body_armour_str"],
  },
  {
    id: "chestplate",
    name: "Chestplate",
    category: "body_armour",
    attribute: "str",
    itemLevel: 40,
    requiredLevel: 25,
    implicitMods: [],
    affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
    tags: ["body_armour_str"],
  },
  {
    id: "full_plate",
    name: "Full Plate",
    category: "body_armour",
    attribute: "str",
    itemLevel: 60,
    requiredLevel: 45,
    implicitMods: [],
    affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
    tags: ["body_armour_str"],
  },
  {
    id: "glorious_plate",
    name: "Glorious Plate",
    category: "body_armour",
    attribute: "str",
    itemLevel: 75,
    requiredLevel: 60,
    implicitMods: [],
    affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
    tags: ["body_armour_str"],
  },
];

export function getItemById(id: string): ItemBase | undefined {
  return SAMPLE_ITEMS.find((item) => item.id === id);
}
