import { describe, it, expect } from "vitest";
import type { Currency, ItemBase, RolledModifier } from "@crafterix/data";
import { AnnulmentOrb } from "../../actions/annulment.js";
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

// Annulment doesn't need modifiers since it only removes, not adds
const testCurrency: Currency = {
  id: "orb_of_annulment",
  name: "Orb of Annulment",
  tier: "normal",
  effect: "remove_affix",
  description: "Removes a random affix from an item",
  applicableToRarity: ["magic", "rare"],
  weightModifications: [],
};

const prefix1: RolledModifier = { modifierId: "life_prefix", tier: 1, values: [95] };
const prefix2: RolledModifier = { modifierId: "mana_prefix", tier: 1, values: [85] };
const suffix1: RolledModifier = { modifierId: "fire_res_suffix", tier: 1, values: [42] };
const suffix2: RolledModifier = { modifierId: "cold_res_suffix", tier: 1, values: [35] };

describe("AnnulmentOrb", () => {
  describe("canApply", () => {
    it("returns true for magic item with affixes", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase)
        .withRarity("magic")
        .withPrefix(prefix1);

      expect(action.canApply(state)).toBe(true);
    });

    it("returns true for rare item with affixes", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase)
        .withRarity("rare")
        .withPrefix(prefix1);

      expect(action.canApply(state)).toBe(true);
    });

    it("returns false for normal items", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase);

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for corrupted items", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase)
        .withRarity("magic")
        .withPrefix(prefix1)
        .withCorrupted();

      expect(action.canApply(state)).toBe(false);
    });

    it("returns false for items with no affixes", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase).withRarity("magic");

      expect(action.canApply(state)).toBe(false);
    });
  });

  describe("getOutcomes", () => {
    it("returns empty array when canApply is false", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase);

      expect(action.getOutcomes(state)).toHaveLength(0);
    });

    it("returns one outcome per affix", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("rare");
      state = state.withPrefix(prefix1);
      state = state.withPrefix(prefix2);
      state = state.withSuffix(suffix1);

      const outcomes = action.getOutcomes(state);

      // Should have 3 outcomes (2 prefixes + 1 suffix)
      expect(outcomes).toHaveLength(3);
    });

    it("each outcome removes exactly one affix", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("rare");
      state = state.withPrefix(prefix1);
      state = state.withSuffix(suffix1);
      const initialAffixes = state.prefixCount + state.suffixCount;

      const outcomes = action.getOutcomes(state);

      for (const outcome of outcomes) {
        expect(outcome.state.prefixCount + outcome.state.suffixCount).toBe(initialAffixes - 1);
      }
    });

    it("probabilities sum to 1.0", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("rare");
      state = state.withPrefix(prefix1);
      state = state.withPrefix(prefix2);
      state = state.withSuffix(suffix1);

      const outcomes = action.getOutcomes(state);
      const totalProb = outcomes.reduce((sum, o) => sum + o.probability, 0);

      expect(totalProb).toBeCloseTo(1.0, 5);
    });

    it("equal probability for each affix", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("rare");
      state = state.withPrefix(prefix1);
      state = state.withPrefix(prefix2);
      state = state.withSuffix(suffix1);
      state = state.withSuffix(suffix2);

      const outcomes = action.getOutcomes(state);

      // 4 affixes, each with 25% chance
      for (const outcome of outcomes) {
        expect(outcome.probability).toBeCloseTo(0.25, 5);
      }
    });

    it("outcomes correctly identify which affix was removed", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("magic");
      state = state.withPrefix(prefix1);
      state = state.withSuffix(suffix1);

      const outcomes = action.getOutcomes(state);

      // One should have removed the prefix, one should have removed the suffix
      const hasRemovedPrefix = outcomes.some(
        (o) => o.state.prefixCount === 0 && o.state.suffixCount === 1
      );
      const hasRemovedSuffix = outcomes.some(
        (o) => o.state.prefixCount === 1 && o.state.suffixCount === 0
      );

      expect(hasRemovedPrefix).toBe(true);
      expect(hasRemovedSuffix).toBe(true);
    });
  });

  describe("apply", () => {
    it("throws when item has no affixes", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      const state = CraftingState.fromBase(testBase).withRarity("magic");

      expect(() => action.apply(state, 0.5)).toThrow("Cannot apply Annulment");
    });

    it("removes exactly one affix", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("rare");
      state = state.withPrefix(prefix1);
      state = state.withSuffix(suffix1);
      const initialAffixes = state.prefixCount + state.suffixCount;

      const result = action.apply(state, 0.5);

      expect(result.prefixCount + result.suffixCount).toBe(initialAffixes - 1);
    });

    it("removes prefix when random < prefix ratio", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("magic");
      state = state.withPrefix(prefix1);
      state = state.withSuffix(suffix1);

      // random = 0 should pick the first affix (prefix)
      const result = action.apply(state, 0);

      expect(result.prefixCount).toBe(0);
      expect(result.suffixCount).toBe(1);
    });

    it("removes suffix when random >= prefix ratio", () => {
      const action = new AnnulmentOrb(testCurrency, { modifiers: [] });
      let state = CraftingState.fromBase(testBase).withRarity("magic");
      state = state.withPrefix(prefix1);
      state = state.withSuffix(suffix1);

      // random = 0.5 should pick the second affix (suffix)
      const result = action.apply(state, 0.5);

      expect(result.prefixCount).toBe(1);
      expect(result.suffixCount).toBe(0);
    });
  });
});
