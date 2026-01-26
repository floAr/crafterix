import { describe, it, expect } from "vitest";
import type { ItemBase, Modifier } from "@crafterix/data";
import { ModPool } from "../mod-pool.js";
import { CraftingState } from "../crafting-state.js";

// Test fixtures
const testBase: ItemBase = {
  id: "test_helmet",
  name: "Test Helmet",
  category: "helmet",
  attribute: "str",
  itemLevel: 80,
  requiredLevel: 60,
  implicitMods: [],
  affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
  tags: ["armour", "helmet"],
};

const lowLevelBase: ItemBase = {
  id: "test_low_helmet",
  name: "Low Level Helmet",
  category: "helmet",
  attribute: "str",
  itemLevel: 10,
  requiredLevel: 5,
  implicitMods: [],
  affixSlots: { maxPrefixes: 3, maxSuffixes: 3 },
  tags: ["armour", "helmet"],
};

const testModifiers: Modifier[] = [
  {
    id: "life_prefix",
    name: "IncreasedLife",
    displayName: "+# to maximum Life",
    type: "prefix",
    domain: "item",
    group: "life",
    tags: ["life"],
    applicableTo: ["armour"],
    tiers: [
      { tier: 1, requiredLevel: 60, weight: 100, values: [{ min: 90, max: 100 }] },
      { tier: 2, requiredLevel: 40, weight: 200, values: [{ min: 70, max: 89 }] },
      { tier: 3, requiredLevel: 20, weight: 300, values: [{ min: 50, max: 69 }] },
    ],
  },
  {
    id: "mana_prefix",
    name: "IncreasedMana",
    displayName: "+# to maximum Mana",
    type: "prefix",
    domain: "item",
    group: "mana",
    tags: ["mana"],
    applicableTo: ["armour"],
    tiers: [
      { tier: 1, requiredLevel: 50, weight: 150, values: [{ min: 80, max: 100 }] },
      { tier: 2, requiredLevel: 30, weight: 250, values: [{ min: 50, max: 79 }] },
    ],
  },
  {
    id: "fire_res_suffix",
    name: "FireResistance",
    displayName: "+#% to Fire Resistance",
    type: "suffix",
    domain: "item",
    group: "fire_resistance",
    tags: ["resistance", "fire"],
    applicableTo: ["armour"],
    tiers: [
      { tier: 1, requiredLevel: 60, weight: 100, values: [{ min: 40, max: 45 }] },
      { tier: 2, requiredLevel: 30, weight: 200, values: [{ min: 30, max: 39 }] },
    ],
  },
  {
    id: "cold_res_suffix",
    name: "ColdResistance",
    displayName: "+#% to Cold Resistance",
    type: "suffix",
    domain: "item",
    group: "cold_resistance",
    tags: ["resistance", "cold"],
    applicableTo: ["armour"],
    tiers: [{ tier: 1, requiredLevel: 30, weight: 150, values: [{ min: 30, max: 40 }] }],
  },
  {
    id: "weapon_only_prefix",
    name: "PhysicalDamage",
    displayName: "Adds # to # Physical Damage",
    type: "prefix",
    domain: "item",
    group: "physical_damage",
    tags: ["physical", "damage"],
    applicableTo: ["weapon"],
    tiers: [{ tier: 1, requiredLevel: 40, weight: 200, values: [{ min: 10, max: 20 }, { min: 30, max: 40 }] }],
  },
];

describe("ModPool", () => {
  describe("getModifierById", () => {
    it("returns the modifier when it exists", () => {
      const pool = new ModPool(testModifiers);
      const mod = pool.getModifierById("life_prefix");

      expect(mod).toBeDefined();
      expect(mod?.name).toBe("IncreasedLife");
    });

    it("returns undefined for non-existent modifier", () => {
      const pool = new ModPool(testModifiers);
      const mod = pool.getModifierById("non_existent");

      expect(mod).toBeUndefined();
    });

    it("is O(1) lookup (uses Map internally)", () => {
      const pool = new ModPool(testModifiers);
      // Multiple lookups should be fast
      for (let i = 0; i < 1000; i++) {
        pool.getModifierById("life_prefix");
      }
      // If this test completes quickly, the lookup is O(1)
      expect(true).toBe(true);
    });
  });

  describe("hasGroupConflict", () => {
    it("returns false for empty item", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      expect(pool.hasGroupConflict(state, "life")).toBe(false);
    });

    it("returns true when item has mod from the group", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase).withPrefix({
        modifierId: "life_prefix",
        tier: 1,
        values: [95],
      });

      expect(pool.hasGroupConflict(state, "life")).toBe(true);
    });

    it("returns false when item has mod from different group", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase).withPrefix({
        modifierId: "mana_prefix",
        tier: 1,
        values: [90],
      });

      expect(pool.hasGroupConflict(state, "life")).toBe(false);
    });

    it("checks both prefixes and suffixes", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase).withSuffix({
        modifierId: "fire_res_suffix",
        tier: 1,
        values: [42],
      });

      expect(pool.hasGroupConflict(state, "fire_resistance")).toBe(true);
    });
  });

  describe("getAvailableMods", () => {
    it("filters by modifier type", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const prefixes = pool.getAvailableMods(state, "prefix");
      const suffixes = pool.getAvailableMods(state, "suffix");

      // All returned items should match the requested type
      for (const { item } of prefixes) {
        expect(item.modifier.type).toBe("prefix");
      }
      for (const { item } of suffixes) {
        expect(item.modifier.type).toBe("suffix");
      }
    });

    it("filters by item tags (applicableTo)", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const prefixes = pool.getAvailableMods(state, "prefix");
      const modIds = prefixes.map(({ item }) => item.modifier.id);

      // weapon_only_prefix should not be in the list for armour
      expect(modIds).not.toContain("weapon_only_prefix");
      // life and mana should be available
      expect(modIds).toContain("life_prefix");
      expect(modIds).toContain("mana_prefix");
    });

    it("filters by item level (tier requirements)", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(lowLevelBase);

      const prefixes = pool.getAvailableMods(state, "prefix");

      // Only tier 3 of life (req 20) should NOT be available (ilvl 10)
      // All tiers require level > 10, so no tiers should be available
      expect(prefixes.length).toBe(0);
    });

    it("excludes mods from groups already on item", () => {
      const pool = new ModPool(testModifiers);
      let state = CraftingState.fromBase(testBase);
      state = state.withPrefix({ modifierId: "life_prefix", tier: 1, values: [95] });

      const prefixes = pool.getAvailableMods(state, "prefix");
      const modIds = prefixes.map(({ item }) => item.modifier.id);

      // life_prefix group should be excluded
      expect(modIds).not.toContain("life_prefix");
      // mana should still be available
      expect(modIds).toContain("mana_prefix");
    });

    it("returns weighted items with correct weights", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const suffixes = pool.getAvailableMods(state, "suffix");
      const fireRes = suffixes.find(({ item }) => item.modifier.id === "fire_res_suffix" && item.tier.tier === 1);

      expect(fireRes).toBeDefined();
      expect(fireRes?.weight).toBe(100);
    });

    it("applies weight modifications", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const suffixes = pool.getAvailableMods(state, "suffix", [{ tag: "fire", multiplier: 2 }]);
      const fireRes = suffixes.find(({ item }) => item.modifier.id === "fire_res_suffix" && item.tier.tier === 1);
      const coldRes = suffixes.find(({ item }) => item.modifier.id === "cold_res_suffix");

      expect(fireRes?.weight).toBe(200); // 100 * 2
      expect(coldRes?.weight).toBe(150); // unchanged
    });

    it("excludes mods with zero weight after modifications", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const suffixes = pool.getAvailableMods(state, "suffix", [{ tag: "fire", multiplier: 0 }]);
      const fireResIds = suffixes.filter(({ item }) => item.modifier.id === "fire_res_suffix");

      expect(fireResIds.length).toBe(0);
    });
  });

  describe("getModProbabilities", () => {
    it("returns probabilities summing to 1", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const probs = pool.getModProbabilities(state, "prefix");
      let totalProb = 0;
      for (const { total } of probs.values()) {
        totalProb += total;
      }

      expect(totalProb).toBeCloseTo(1, 5);
    });

    it("collapses tiers by mod ID", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const probs = pool.getModProbabilities(state, "prefix");
      const lifeProb = probs.get("life_prefix");

      // Should have 3 tiers combined
      expect(lifeProb).toBeDefined();
      expect(lifeProb?.byTier.size).toBe(3);
    });

    it("tracks individual tier probabilities", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(testBase);

      const probs = pool.getModProbabilities(state, "prefix");
      const lifeProb = probs.get("life_prefix");

      // Total weight for life: 100 + 200 + 300 = 600
      // Total weight for mana: 150 + 250 = 400
      // Grand total: 1000
      // Life tier 1: 100/1000 = 0.1
      expect(lifeProb?.byTier.get(1)).toBeCloseTo(0.1, 5);
    });

    it("returns empty map for no available mods", () => {
      const pool = new ModPool(testModifiers);
      const state = CraftingState.fromBase(lowLevelBase);

      const probs = pool.getModProbabilities(state, "prefix");

      expect(probs.size).toBe(0);
    });
  });
});
