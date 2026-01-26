import type { CorruptedImplicit } from "@crafterix/data";

export const SAMPLE_CORRUPTED_IMPLICITS: CorruptedImplicit[] = [
  // Body Armour corrupted implicits
  {
    id: "corrupted_max_life",
    displayName: "+# to maximum Life",
    applicableTo: ["body_armour", "armour"],
    values: [{ min: 30, max: 50 }],
  },
  {
    id: "corrupted_all_res",
    displayName: "+#% to all Elemental Resistances",
    applicableTo: ["body_armour", "armour"],
    values: [{ min: 8, max: 12 }],
  },
  {
    id: "corrupted_armour_percent",
    displayName: "#% increased Armour",
    applicableTo: ["body_armour", "armour", "str_armour"],
    values: [{ min: 20, max: 40 }],
  },
  {
    id: "corrupted_evasion_percent",
    displayName: "#% increased Evasion Rating",
    applicableTo: ["body_armour", "armour", "dex_armour"],
    values: [{ min: 20, max: 40 }],
  },
  {
    id: "corrupted_es_percent",
    displayName: "#% increased Energy Shield",
    applicableTo: ["body_armour", "armour", "int_armour"],
    values: [{ min: 20, max: 40 }],
  },
  {
    id: "corrupted_gem_level",
    displayName: "+# to Level of Socketed Gems",
    applicableTo: ["body_armour", "armour"],
    values: [{ min: 1, max: 2 }],
  },
  {
    id: "corrupted_aoe_gem_level",
    displayName: "+# to Level of Socketed AoE Gems",
    applicableTo: ["body_armour", "armour"],
    values: [{ min: 2, max: 4 }],
  },
  {
    id: "corrupted_attack_crit",
    displayName: "+#% to Critical Hit Chance",
    applicableTo: ["body_armour", "armour"],
    values: [{ min: 0.5, max: 1.5 }],
  },
];

export function getCorruptedImplicitsForItem(itemTags: string[]): CorruptedImplicit[] {
  return SAMPLE_CORRUPTED_IMPLICITS.filter((impl) =>
    impl.applicableTo.some((tag) => itemTags.includes(tag))
  );
}
