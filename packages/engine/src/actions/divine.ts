import type { Currency, RolledModifier } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Divine Orb: Rerolls the numeric values of all affixes within their tier ranges.
 * Does not change which mods are on the item, only their rolled values.
 */
export class DivineOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.isCorrupted) return false;
    // Need at least one affix to divine
    return state.prefixCount + state.suffixCount > 0;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    // Divine doesn't change mod composition, just values
    // Show as single outcome - values will vary but mod structure is same
    const rerolledPrefixes = state.item.prefixes.map((mod) => this.rerollModMidValue(mod));
    const rerolledSuffixes = state.item.suffixes.map((mod) => this.rerollModMidValue(mod));

    const newState = new CraftingState({
      ...state.item,
      prefixes: rerolledPrefixes,
      suffixes: rerolledSuffixes,
    });

    return [
      {
        state: newState,
        probability: 1,
      },
    ];
  }

  apply(state: CraftingState, _random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Divine: item has no affixes or is corrupted");
    }

    const rerolledPrefixes = state.item.prefixes.map((mod) => this.rerollMod(mod));
    const rerolledSuffixes = state.item.suffixes.map((mod) => this.rerollMod(mod));

    return new CraftingState({
      ...state.item,
      prefixes: rerolledPrefixes,
      suffixes: rerolledSuffixes,
    });
  }

  private rerollMod(mod: RolledModifier): RolledModifier {
    const modifier = this.modPool.getModifierById(mod.modifierId);
    if (!modifier) return mod;

    const tier = modifier.tiers.find((t) => t.tier === mod.tier);
    if (!tier) return mod;

    const newValues = tier.values.map(
      (v) => Math.floor(Math.random() * (v.max - v.min + 1)) + v.min
    );

    return {
      ...mod,
      values: newValues,
    };
  }

  private rerollModMidValue(mod: RolledModifier): RolledModifier {
    const modifier = this.modPool.getModifierById(mod.modifierId);
    if (!modifier) return mod;

    const tier = modifier.tiers.find((t) => t.tier === mod.tier);
    if (!tier) return mod;

    const newValues = tier.values.map((v) => Math.floor((v.min + v.max) / 2));

    return {
      ...mod,
      values: newValues,
    };
  }
}
