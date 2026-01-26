import type { ItemBase } from "@crafterix/data";

export const SAMPLE_ITEMS: ItemBase[] = [
  {
    id: "plate_vest",
    name: "Plate Vest",
    category: "body_armour",
    attribute: "str",
    itemLevel: 20,
    requiredLevel: 1,
    implicitMods: [],
    affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
    tags: ["body_armour", "armour", "str_armour"],
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
    tags: ["body_armour", "armour", "str_armour"],
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
    tags: ["body_armour", "armour", "str_armour"],
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
    tags: ["body_armour", "armour", "str_armour"],
  },
];

export function getItemById(id: string): ItemBase | undefined {
  return SAMPLE_ITEMS.find((item) => item.id === id);
}
