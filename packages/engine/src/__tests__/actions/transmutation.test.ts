import { describe, it, expect } from "vitest";
import type { Currency, ItemBase, Modifier } from "@crafterix/data";
import { TransmutationOrb } from "../../actions/transmutation.js";
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
    tiers: [
      { tier: 1, requiredLevel: 30, weight: 100, values: [{ min: 30, max: 40 }] },
    ],
  },
];

const testCurrency: Currency = {
  id: "orb_of_transmutation",
  name: "Orb of Transmutation",
  tier: "normal",
  effect: "upgrade_rarity",
  description: "Upgrades a normal item to magic",
  applicableToRarity: ["normal"],
  weightModifications: [],
};

describe("TransmutationOrb", () => {
  describe("canApply", () => {
    it("returns true for normal items", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      expect(action.canApply(state)).toBe(true);
    });

    it("returns false for magic items", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withRarity("magic");

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for rare items", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withRarity("rare");

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for corrupted items", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withCorrupted();

      expect(action.canApply(state)).toBe(false);
    });
  });

  describe("getOutcomes", () => {
    it("returns empty array when canApply is false", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withRarity("magic");

      const outcomes = action.getOutcomes(state);

      expect(outcomes).toHaveLength(0);
    });

    it("returns one outcome per unique modifier", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const outcomes = action.getOutcomes(state);

      // Should have 3 outcomes: life_prefix, fire_res_suffix, cold_res_suffix
      // (tiers are collapsed by modifier ID)
      expect(outcomes).toHaveLength(3);
    });

    it("all outcomes result in magic items", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const outcomes = action.getOutcomes(state);

      for (const outcome of outcomes) {
        expect(outcome.state.rarity).toBe("magic");
      }
    });

    it("all outcomes have exactly 1 affix", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const outcomes = action.getOutcomes(state);

      for (const outcome of outcomes) {
        const totalAffixes = outcome.state.prefixCount + outcome.state.suffixCount;
        expect(totalAffixes).toBe(1);
      }
    });

    it("probabilities sum to 1.0", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const outcomes = action.getOutcomes(state);
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);

      expect(totalProb).toBeCloseTo(1.0, 5);
    });

    it("prefix outcomes have prefix, suffix outcomes have suffix", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const outcomes = action.getOutcomes(state);

      for (const outcome of outcomes) {
        // Should have exactly one prefix OR one suffix, not both
        expect(
          (outcome.state.prefixCount === 1 && outcome.state.suffixCount === 0) ||
          (outcome.state.prefixCount === 0 && outcome.state.suffixCount === 1)
        ).toBe(true);
      }
    });
  });

  describe("apply", () => {
    it("throws when item is not normal", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase).withRarity("magic");

      expect(() => action.apply(state, 0.5)).toThrow("Cannot apply Transmutation");
    });

    it("returns a magic item with 1 affix", () => {
      const action = new TransmutationOrb(testCurrency, { modifiers: testModifiers });
      const state = CraftingState.fromBase(testBase);

      const result = action.apply(state, 0.5);

      expect(result.rarity).toBe("magic");
      expect(result.prefixCount + result.suffixCount).toBe(1);
    });
  });
});
