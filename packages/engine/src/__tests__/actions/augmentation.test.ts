import { describe, it, expect } from "vitest";
import type { Currency, ItemBase, Modifier, RolledModifier } from "@crafterix/data";
import { AugmentationOrb } from "../../actions/augmentation.js";
import { CraftingState } from "../../crafting-state.js";

// Minimal test fixtures
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

const magicBase: ItemBase = {
  id: "test_ring",
  name: "Test Ring",
  category: "ring",
  attribute: "none",
  itemLevel: 80,
  requiredLevel: 60,
  implicitMods: [],
  affixSlots: { maxPrefixes: 1, maxSuffixes: 1 },
  tags: ["ring", "jewellery"],
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
    applicableTo: ["armour", "jewellery"],
    tiers: [
      { tier: 1, requiredLevel: 60, weight: 100, values: [{ min: 90, max: 100 }] },
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
    applicableTo: ["armour", "jewellery"],
    tiers: [
      { tier: 1, requiredLevel: 40, weight: 100, values: [{ min: 80, max: 100 }] },
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
    applicableTo: ["armour", "jewellery"],
    tiers: [
      { tier: 1, requiredLevel: 60, weight: 100, values: [{ min: 40, max: 45 }] },
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
    applicableTo: ["armour", "jewellery"],
    tiers: [
      { tier: 1, requiredLevel: 30, weight: 100, values: [{ min: 30, max: 40 }] },
    ],
  },
];

const testCurrency: Currency = {
  id: "orb_of_augmentation",
  name: "Orb of Augmentation",
  tier: "normal",
  effect: "add_affix",
  description: "Adds a random affix to a magic item",
  applicableToRarity: ["magic"],
  weightModifications: [],
};

const existingPrefix: RolledModifier = {
  modifierId: "life_prefix",
  tier: 1,
  values: [95],
};

const existingSuffix: RolledModifier = {
  modifierId: "fire_res_suffix",
  tier: 1,
  values: [42],
};

describe("AugmentationOrb", () => {
  describe("canApply", () => {
    it("returns true for magic item missing prefix", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withSuffix(existingSuffix);

      expect(action.canApply(state)).toBe(true);
    });

    it("returns true for magic item missing suffix", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withPrefix(existingPrefix);

      expect(action.canApply(state)).toBe(true);
    });

    it("returns true for magic item with no affixes", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase).withRarity("magic");

      expect(action.canApply(state)).toBe(true);
    });

    it("returns false for magic item that is full", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      let state = CraftingState.fromBase(magicBase).withRarity("magic");
      state = state.withPrefix(existingPrefix);
      state = state.withSuffix(existingSuffix);

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for normal items", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for rare items", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withRarity("rare");

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for corrupted items", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withCorrupted();

      expect(action.canApply(state)).toBe(false);
    });
  });

  describe("getOutcomes", () => {
    it("returns empty array when canApply is false", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      expect(action.getOutcomes(state)).toHaveLength(0);
    });

    it("only returns prefix outcomes when suffix exists", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withSuffix(existingSuffix);

      const outcomes = action.getOutcomes(state);

      // Should only add prefixes (life_prefix and mana_prefix)
      expect(outcomes.length).toBe(2);
      for (const outcome of outcomes) {
        expect(outcome.state.prefixCount).toBe(1);
        expect(outcome.state.suffixCount).toBe(1); // still has original suffix
      }
    });

    it("only returns suffix outcomes when prefix exists", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withPrefix(existingPrefix);

      const outcomes = action.getOutcomes(state);

      // Should only add suffixes (fire_res_suffix and cold_res_suffix)
      expect(outcomes.length).toBe(2);
      for (const outcome of outcomes) {
        expect(outcome.state.prefixCount).toBe(1); // still has original prefix
        expect(outcome.state.suffixCount).toBe(1);
      }
    });

    it("returns both prefix and suffix outcomes when item is empty", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase).withRarity("magic");

      const outcomes = action.getOutcomes(state);

      // Should have all 4 mods as options
      expect(outcomes.length).toBe(4);
    });

    it("all outcomes add exactly 1 affix", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withPrefix(existingPrefix);

      const outcomes = action.getOutcomes(state);

      for (const outcome of outcomes) {
        expect(outcome.state.prefixCount + outcome.state.suffixCount).toBe(2);
      }
    });

    it("probabilities sum to 1.0", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase).withRarity("magic");

      const outcomes = action.getOutcomes(state);
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);

      expect(totalProb).toBeCloseTo(1.0, 5);
    });

    it("probabilities sum to 1.0 when only suffixes available", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase)
        .withRarity("magic")
        .withPrefix(existingPrefix);

      const outcomes = action.getOutcomes(state);
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);

      expect(totalProb).toBeCloseTo(1.0, 5);
    });
  });

  describe("apply", () => {
    it("throws when item cannot be augmented", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      expect(() => action.apply(state, 0.5)).toThrow("Cannot apply Augmentation");
    });

    it("adds exactly one affix", () => {
      const action = new AugmentationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(magicBase).withRarity("magic");
      const initialAffixes = state.prefixCount + state.suffixCount;

      const result = action.apply(state, 0.5);

      expect(result.prefixCount + result.suffixCount).toBe(initialAffixes + 1);
    });
  });
});
