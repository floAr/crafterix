import type { Currency } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { selectWeighted, calculateProbabilities } from "../weighted-random.js";
import { BaseCurrencyAction, type ActionContext, type ModTierSelection } from "./base-action.js";

/**
 * Orb of Augmentation: Adds 1 affix to a Magic item (if it has room)
 */
export class AugmentationOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.rarity !== "magic" || state.isCorrupted) return false;
    // Magic can have max 1 prefix + 1 suffix
    // Can apply if item doesn't have both yet
    return state.prefixCount === 0 || state.suffixCount === 0;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    // Magic items: only add the type that's missing
    const canAddPrefix = state.prefixCount === 0;
    const canAddSuffix = state.suffixCount === 0;

    const prefixes = canAddPrefix ? this.getAvailablePrefixes(state) : [];
    const suffixes = canAddSuffix ? this.getAvailableSuffixes(state) : [];
    const allMods = [...prefixes, ...suffixes];

    if (allMods.length === 0) return [];

    const probabilities = calculateProbabilities(allMods);

    // Group by modifier ID
    const grouped = new Map<string, { selection: ModTierSelection; probability: number }>();

    for (const [selection, prob] of probabilities) {
      const modId = selection.modifier.id;
      const existing = grouped.get(modId);
      if (existing) {
        existing.probability += prob;
        // Keep highest tier for display
        if (selection.tier.tier < existing.selection.tier.tier) {
          existing.selection = selection;
        }
      } else {
        grouped.set(modId, { selection, probability: prob });
      }
    }

    return Array.from(grouped.values()).map(({ selection, probability }) => {
      const rolledMod = this.rollModWithMidValue(selection);
      const newState = selection.modifier.type === "prefix"
        ? state.withPrefix(rolledMod)
        : state.withSuffix(rolledMod);
      return { state: newState, probability };
    });
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Augmentation: item is not Magic or is full");
    }

    const canAddPrefix = state.prefixCount === 0;
    const canAddSuffix = state.suffixCount === 0;

    const prefixes = canAddPrefix ? this.getAvailablePrefixes(state) : [];
    const suffixes = canAddSuffix ? this.getAvailableSuffixes(state) : [];
    const allMods = [...prefixes, ...suffixes];

    const selected = selectWeighted(allMods, random);
    if (!selected) {
      throw new Error("No available mods for Augmentation");
    }

    const rolledMod = this.rollMod(selected);
    if (selected.modifier.type === "prefix") {
      return state.withPrefix(rolledMod);
    } else {
      return state.withSuffix(rolledMod);
    }
  }
}
