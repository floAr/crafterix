import type { Currency, Modifier, RolledModifier } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Helper to add a guaranteed mod at the best tier for item level
 */
function addGuaranteedMod(
  state: CraftingState,
  mod: Modifier
): CraftingState {
  const itemLevel = state.item.base.itemLevel;
  const applicableTiers = mod.tiers.filter(t => t.requiredLevel <= itemLevel);
  if (applicableTiers.length === 0) return state;

  // Get highest tier (lowest tier number)
  const bestTier = applicableTiers.reduce((best, t) =>
    t.tier < best.tier ? t : best
  );

  const rolledMod: RolledModifier = {
    modifierId: mod.id,
    tier: bestTier.tier,
    values: bestTier.values.map(v => Math.floor((v.min + v.max) / 2)),
  };

  if (mod.type === "prefix") {
    return state.withPrefix(rolledMod);
  } else {
    return state.withSuffix(rolledMod);
  }
}

/**
 * Upgrading Essence (Lesser/Normal/Greater): Upgrades Magic → Rare, adding only the guaranteed mod.
 * Deterministic outcome - always results in rare item with original mods + guaranteed mod.
 */
export class UpgradingEssence extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.rarity !== "magic" || state.isCorrupted) return false;
    if (!this.currency.guaranteedModId) return false;

    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId);
    if (!guaranteedMod) return false;

    // Check if item already has this mod group
    if (state.hasModifierGroup(guaranteedMod.group, new Map(
      this.modPool["modifiers"].map(m => [m.id, { group: m.group }])
    ))) {
      return false;
    }

    // Check if there's room for the mod type (rare allows 3P/3S)
    if (guaranteedMod.type === "prefix" && state.prefixCount >= 3) return false;
    if (guaranteedMod.type === "suffix" && state.suffixCount >= 3) return false;

    return true;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId!);
    if (!guaranteedMod) return [];

    // Upgrade to rare, then add guaranteed mod - deterministic single outcome
    const rareState = state.withRarity("rare");
    const finalState = addGuaranteedMod(rareState, guaranteedMod);

    return [{
      state: finalState,
      probability: 1,
    }];
  }

  apply(state: CraftingState, _random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Essence: item is not Magic or already has this mod group");
    }

    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId!);
    if (!guaranteedMod) {
      throw new Error("Guaranteed mod not found");
    }

    const rareState = state.withRarity("rare");
    return addGuaranteedMod(rareState, guaranteedMod);
  }
}

/**
 * Perfect Essence: Removes a random modifier and adds a guaranteed modifier to a Rare item.
 * Creates branching outcomes for each possible mod removal.
 */
export class PerfectEssence extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.rarity !== "rare" || state.isCorrupted) return false;
    // Need at least one affix to remove
    if (state.prefixCount + state.suffixCount === 0) return false;
    // Need a guaranteed mod configured
    if (!this.currency.guaranteedModId) return false;

    // Check if the guaranteed mod can be added (not already on item, has room)
    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId);
    if (!guaranteedMod) return false;

    // Already has this mod group
    if (state.hasModifierGroup(guaranteedMod.group, new Map(
      this.modPool["modifiers"].map(m => [m.id, { group: m.group }])
    ))) {
      return false;
    }

    // Check if there's room for the mod type
    if (guaranteedMod.type === "prefix" && !state.canAddPrefix) {
      // Could still work if we remove a prefix
      return state.prefixCount > 0;
    }
    if (guaranteedMod.type === "suffix" && !state.canAddSuffix) {
      // Could still work if we remove a suffix
      return state.suffixCount > 0;
    }

    return true;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId!);
    if (!guaranteedMod) return [];

    const outcomes: CraftingOutcome[] = [];
    const totalAffixes = state.prefixCount + state.suffixCount;

    // For each possible removal, show the outcome
    for (let i = 0; i < state.prefixCount; i++) {
      const afterRemoval = state.withoutPrefix(i);
      const canAdd = guaranteedMod.type === "prefix"
        ? afterRemoval.canAddPrefix
        : afterRemoval.canAddSuffix;

      if (canAdd) {
        outcomes.push({
          state: addGuaranteedMod(afterRemoval, guaranteedMod),
          probability: 1 / totalAffixes,
        });
      }
    }

    for (let i = 0; i < state.suffixCount; i++) {
      const afterRemoval = state.withoutSuffix(i);
      const canAdd = guaranteedMod.type === "prefix"
        ? afterRemoval.canAddPrefix
        : afterRemoval.canAddSuffix;

      if (canAdd) {
        outcomes.push({
          state: addGuaranteedMod(afterRemoval, guaranteedMod),
          probability: 1 / totalAffixes,
        });
      }
    }

    return outcomes;
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Essence: item is not Rare or has no affixes");
    }

    const guaranteedMod = this.modPool.getModifierById(this.currency.guaranteedModId!);
    if (!guaranteedMod) {
      throw new Error("Guaranteed mod not found");
    }

    // Remove a random affix
    const totalAffixes = state.prefixCount + state.suffixCount;
    const removeIndex = Math.floor(random * totalAffixes);

    let afterRemoval: CraftingState;
    if (removeIndex < state.prefixCount) {
      afterRemoval = state.withoutPrefix(removeIndex);
    } else {
      afterRemoval = state.withoutSuffix(removeIndex - state.prefixCount);
    }

    // Add the guaranteed mod
    return addGuaranteedMod(afterRemoval, guaranteedMod);
  }
}
