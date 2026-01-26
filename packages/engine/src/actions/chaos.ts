import type { Currency } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { selectWeighted, groupWeightedByModifierId } from "../weighted-random.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Chaos Orb (PoE2): Removes 1 random affix and adds 1 new affix to a Rare item
 */
export class ChaosOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.rarity !== "rare" || state.isCorrupted) return false;
    // Need at least one affix to remove
    return state.prefixCount + state.suffixCount > 0;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    const outcomes: CraftingOutcome[] = [];
    const totalAffixes = state.prefixCount + state.suffixCount;

    // For each possible removal, show what mods could be added
    // Group by: removed mod -> added mod type
    for (let i = 0; i < state.prefixCount; i++) {
      const afterRemoval = state.withoutPrefix(i);
      const removalProb = 1 / totalAffixes;

      // Get outcomes for adding a new mod after this removal
      const addOutcomes = this.getAddOutcomesAfterRemoval(afterRemoval, removalProb);
      outcomes.push(...addOutcomes);
    }

    for (let i = 0; i < state.suffixCount; i++) {
      const afterRemoval = state.withoutSuffix(i);
      const removalProb = 1 / totalAffixes;

      const addOutcomes = this.getAddOutcomesAfterRemoval(afterRemoval, removalProb);
      outcomes.push(...addOutcomes);
    }

    return outcomes;
  }

  private getAddOutcomesAfterRemoval(
    stateAfterRemoval: CraftingState,
    removalProb: number
  ): CraftingOutcome[] {
    // Get available mods for the state after removal
    const prefixes = stateAfterRemoval.canAddPrefix
      ? this.modPool.getAvailableMods(stateAfterRemoval, "prefix", this.currency.weightModifications)
      : [];
    const suffixes = stateAfterRemoval.canAddSuffix
      ? this.modPool.getAvailableMods(stateAfterRemoval, "suffix", this.currency.weightModifications)
      : [];
    const allMods = [...prefixes, ...suffixes];

    if (allMods.length === 0) return [];

    const totalWeight = allMods.reduce((sum, m) => sum + m.weight, 0);
    const grouped = groupWeightedByModifierId(allMods);

    return Array.from(grouped.values()).map(({ selection, value: weight }) => {
      const rolledMod = this.rollModWithMidValue(selection);
      let newState: CraftingState;

      if (selection.modifier.type === "prefix") {
        newState = stateAfterRemoval.withPrefix(rolledMod);
      } else {
        newState = stateAfterRemoval.withSuffix(rolledMod);
      }

      return {
        state: newState,
        probability: removalProb * (weight / totalWeight),
      };
    });
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Chaos: item is not Rare or has no affixes");
    }

    // First, remove a random affix
    const totalAffixes = state.prefixCount + state.suffixCount;
    const removeIndex = Math.floor(random * totalAffixes);

    let afterRemoval: CraftingState;
    if (removeIndex < state.prefixCount) {
      afterRemoval = state.withoutPrefix(removeIndex);
    } else {
      afterRemoval = state.withoutSuffix(removeIndex - state.prefixCount);
    }

    // Then add a new affix
    const prefixes = afterRemoval.canAddPrefix
      ? this.modPool.getAvailableMods(afterRemoval, "prefix", this.currency.weightModifications)
      : [];
    const suffixes = afterRemoval.canAddSuffix
      ? this.modPool.getAvailableMods(afterRemoval, "suffix", this.currency.weightModifications)
      : [];
    const allMods = [...prefixes, ...suffixes];

    const selected = selectWeighted(allMods, Math.random());
    if (!selected) {
      // Edge case: no mods available, just return with removed affix
      return afterRemoval;
    }

    const rolledMod = this.rollMod(selected);
    if (selected.modifier.type === "prefix") {
      return afterRemoval.withPrefix(rolledMod);
    } else {
      return afterRemoval.withSuffix(rolledMod);
    }
  }
}
