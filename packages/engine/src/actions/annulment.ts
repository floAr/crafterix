import type { Currency } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Orb of Annulment: Removes 1 random affix from a Magic or Rare item
 */
export class AnnulmentOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.isCorrupted) return false;
    if (state.rarity !== "magic" && state.rarity !== "rare") return false;
    // Must have at least one affix to remove
    return state.prefixCount > 0 || state.suffixCount > 0;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    const outcomes: CraftingOutcome[] = [];
    const totalAffixes = state.prefixCount + state.suffixCount;

    // Each prefix removal is equally likely
    for (let i = 0; i < state.prefixCount; i++) {
      outcomes.push({
        state: state.withoutPrefix(i),
        probability: 1 / totalAffixes,
      });
    }

    // Each suffix removal is equally likely
    for (let i = 0; i < state.suffixCount; i++) {
      outcomes.push({
        state: state.withoutSuffix(i),
        probability: 1 / totalAffixes,
      });
    }

    return outcomes;
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Annulment: item has no affixes or is corrupted");
    }

    const totalAffixes = state.prefixCount + state.suffixCount;
    const index = Math.floor(random * totalAffixes);

    if (index < state.prefixCount) {
      return state.withoutPrefix(index);
    } else {
      return state.withoutSuffix(index - state.prefixCount);
    }
  }
}
