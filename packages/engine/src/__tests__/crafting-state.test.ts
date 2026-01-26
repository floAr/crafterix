import { describe, it, expect } from "vitest";
import type { ItemBase, RolledModifier } from "@crafterix/data";
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

const testMagicBase: ItemBase = {
  id: "test_ring",
  name: "Test Ring",
  category: "ring",
  attribute: "none",
  itemLevel: 50,
  requiredLevel: 40,
  implicitMods: [],
  affixSlots: { maxPrefixes: 1, maxSuffixes: 1 },
  tags: ["ring", "jewellery"],
};

const testPrefix: RolledModifier = {
  modifierId: "life_1",
  tier: 1,
  values: [100],
};

const testSuffix: RolledModifier = {
  modifierId: "fire_res_1",
  tier: 1,
  values: [45],
};

describe("CraftingState", () => {
  describe("fromBase", () => {
    it("creates a normal item with no affixes", () => {
      const state = CraftingState.fromBase(testBase);

      expect(state.rarity).toBe("normal");
      expect(state.prefixCount).toBe(0);
      expect(state.suffixCount).toBe(0);
      expect(state.isCorrupted).toBe(false);
    });

    it("uses the correct affix limits from base", () => {
      const state = CraftingState.fromBase(testBase);

      expect(state.maxPrefixes).toBe(3);
      expect(state.maxSuffixes).toBe(3);
    });
  });

  describe("immutability", () => {
    it("withPrefix returns a new instance", () => {
      const state = CraftingState.fromBase(testBase);
      const newState = state.withPrefix(testPrefix);

      expect(newState).not.toBe(state);
      expect(state.prefixCount).toBe(0);
      expect(newState.prefixCount).toBe(1);
    });

    it("withSuffix returns a new instance", () => {
      const state = CraftingState.fromBase(testBase);
      const newState = state.withSuffix(testSuffix);

      expect(newState).not.toBe(state);
      expect(state.suffixCount).toBe(0);
      expect(newState.suffixCount).toBe(1);
    });

    it("withRarity returns a new instance", () => {
      const state = CraftingState.fromBase(testBase);
      const newState = state.withRarity("magic");

      expect(newState).not.toBe(state);
      expect(state.rarity).toBe("normal");
      expect(newState.rarity).toBe("magic");
    });

    it("withCorrupted returns a new instance", () => {
      const state = CraftingState.fromBase(testBase);
      const newState = state.withCorrupted();

      expect(newState).not.toBe(state);
      expect(state.isCorrupted).toBe(false);
      expect(newState.isCorrupted).toBe(true);
    });

    it("original item array is not modified", () => {
      const state = CraftingState.fromBase(testBase);
      const originalPrefixes = state.item.prefixes;
      state.withPrefix(testPrefix);

      expect(originalPrefixes).toHaveLength(0);
    });
  });

  describe("prefix/suffix limits", () => {
    it("canAddPrefix is true when under limit", () => {
      const state = CraftingState.fromBase(testBase);
      expect(state.canAddPrefix).toBe(true);
    });

    it("canAddPrefix is false when at limit", () => {
      let state = CraftingState.fromBase(testMagicBase);
      state = state.withPrefix({ modifierId: "mod1", tier: 1, values: [1] });

      expect(state.canAddPrefix).toBe(false);
    });

    it("canAddSuffix is true when under limit", () => {
      const state = CraftingState.fromBase(testBase);
      expect(state.canAddSuffix).toBe(true);
    });

    it("canAddSuffix is false when at limit", () => {
      let state = CraftingState.fromBase(testMagicBase);
      state = state.withSuffix({ modifierId: "mod1", tier: 1, values: [1] });

      expect(state.canAddSuffix).toBe(false);
    });

    it("withPrefix throws when at max", () => {
      let state = CraftingState.fromBase(testMagicBase);
      state = state.withPrefix(testPrefix);

      expect(() => state.withPrefix(testPrefix)).toThrow("Cannot add prefix");
    });

    it("withSuffix throws when at max", () => {
      let state = CraftingState.fromBase(testMagicBase);
      state = state.withSuffix(testSuffix);

      expect(() => state.withSuffix(testSuffix)).toThrow("Cannot add suffix");
    });
  });

  describe("corruption", () => {
    it("canAddPrefix is false when corrupted", () => {
      const state = CraftingState.fromBase(testBase).withCorrupted();
      expect(state.canAddPrefix).toBe(false);
    });

    it("canAddSuffix is false when corrupted", () => {
      const state = CraftingState.fromBase(testBase).withCorrupted();
      expect(state.canAddSuffix).toBe(false);
    });

    it("withPrefix throws when corrupted", () => {
      const state = CraftingState.fromBase(testBase).withCorrupted();
      expect(() => state.withPrefix(testPrefix)).toThrow("corrupted");
    });

    it("withSuffix throws when corrupted", () => {
      const state = CraftingState.fromBase(testBase).withCorrupted();
      expect(() => state.withSuffix(testSuffix)).toThrow("corrupted");
    });

    it("withCorruptedImplicit sets both corrupted and implicit", () => {
      const state = CraftingState.fromBase(testBase);
      const newState = state.withCorruptedImplicit({
        implicitId: "corrupted_fire_res",
        values: [30],
      });

      expect(newState.isCorrupted).toBe(true);
      expect(newState.corruptedImplicit).toEqual({
        implicitId: "corrupted_fire_res",
        values: [30],
      });
    });
  });

  describe("removing affixes", () => {
    it("withoutPrefix removes the correct prefix", () => {
      const prefix1: RolledModifier = { modifierId: "mod1", tier: 1, values: [1] };
      const prefix2: RolledModifier = { modifierId: "mod2", tier: 1, values: [2] };

      let state = CraftingState.fromBase(testBase);
      state = state.withPrefix(prefix1);
      state = state.withPrefix(prefix2);

      const newState = state.withoutPrefix(0);

      expect(newState.prefixCount).toBe(1);
      expect(newState.item.prefixes[0].modifierId).toBe("mod2");
    });

    it("withoutSuffix removes the correct suffix", () => {
      const suffix1: RolledModifier = { modifierId: "mod1", tier: 1, values: [1] };
      const suffix2: RolledModifier = { modifierId: "mod2", tier: 1, values: [2] };

      let state = CraftingState.fromBase(testBase);
      state = state.withSuffix(suffix1);
      state = state.withSuffix(suffix2);

      const newState = state.withoutSuffix(1);

      expect(newState.suffixCount).toBe(1);
      expect(newState.item.suffixes[0].modifierId).toBe("mod1");
    });
  });

  describe("clearAffixes", () => {
    it("removes all prefixes and suffixes", () => {
      let state = CraftingState.fromBase(testBase);
      state = state.withPrefix(testPrefix);
      state = state.withSuffix(testSuffix);

      const cleared = state.clearAffixes();

      expect(cleared.prefixCount).toBe(0);
      expect(cleared.suffixCount).toBe(0);
    });

    it("preserves other item properties", () => {
      const state = CraftingState.fromBase(testBase).withRarity("rare");
      const cleared = state.clearAffixes();

      expect(cleared.rarity).toBe("rare");
      expect(cleared.item.base).toBe(testBase);
    });
  });

  describe("hasModifier", () => {
    it("returns true for existing prefix", () => {
      const state = CraftingState.fromBase(testBase).withPrefix(testPrefix);
      expect(state.hasModifier("life_1")).toBe(true);
    });

    it("returns true for existing suffix", () => {
      const state = CraftingState.fromBase(testBase).withSuffix(testSuffix);
      expect(state.hasModifier("fire_res_1")).toBe(true);
    });

    it("returns false for non-existing modifier", () => {
      const state = CraftingState.fromBase(testBase);
      expect(state.hasModifier("life_1")).toBe(false);
    });
  });

  describe("toHash", () => {
    it("generates consistent hashes for same state", () => {
      const state1 = CraftingState.fromBase(testBase).withPrefix(testPrefix);
      const state2 = CraftingState.fromBase(testBase).withPrefix(testPrefix);

      expect(state1.toHash()).toBe(state2.toHash());
    });

    it("generates different hashes for different states", () => {
      const state1 = CraftingState.fromBase(testBase).withPrefix(testPrefix);
      const state2 = CraftingState.fromBase(testBase).withSuffix(testSuffix);

      expect(state1.toHash()).not.toBe(state2.toHash());
    });

    it("includes rarity in hash", () => {
      const state1 = CraftingState.fromBase(testBase).withRarity("magic");
      const state2 = CraftingState.fromBase(testBase).withRarity("rare");

      expect(state1.toHash()).not.toBe(state2.toHash());
    });

    it("includes corruption in hash", () => {
      const state1 = CraftingState.fromBase(testBase);
      const state2 = CraftingState.fromBase(testBase).withCorrupted();

      expect(state1.toHash()).not.toBe(state2.toHash());
    });

    it("includes corrupted implicit in hash", () => {
      const state1 = CraftingState.fromBase(testBase).withCorrupted();
      const state2 = CraftingState.fromBase(testBase).withCorruptedImplicit({
        implicitId: "test_implicit",
        values: [10],
      });

      expect(state1.toHash()).not.toBe(state2.toHash());
    });
  });
});
