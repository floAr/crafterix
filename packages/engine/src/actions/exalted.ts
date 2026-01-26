import type { Currency } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { selectWeighted } from "../weighted-random.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Exalted Orb: Adds 1 affix to a Rare item (if it has room)
 * Respects omens that force prefix or suffix.
 */
export class ExaltedOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    if (state.rarity !== "rare" || state.isCorrupted) return false;

    const forcedType = this.getForcedModType();
    if (forcedType === "prefix") return state.canAddPrefix;
    if (forcedType === "suffix") return state.canAddSuffix;

    return state.canAddPrefix || state.canAddSuffix;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    return this.getGroupedOutcomesFiltered(state, (s, selection) => {
      const rolledMod = this.rollModWithMidValue(selection);
      if (selection.modifier.type === "prefix") {
        return s.withPrefix(rolledMod);
      } else {
        return s.withSuffix(rolledMod);
      }
    });
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Exalted: item is not Rare or is full");
    }

    const allMods = this.getFilteredMods(state);

    const selected = selectWeighted(allMods, random);
    if (!selected) {
      throw new Error("No available mods for Exalted");
    }

    const rolledMod = this.rollMod(selected);
    if (selected.modifier.type === "prefix") {
      return state.withPrefix(rolledMod);
    } else {
      return state.withSuffix(rolledMod);
    }
  }

  private getFilteredMods(state: CraftingState) {
    const forcedType = this.getForcedModType();

    if (forcedType === "prefix") {
      return state.canAddPrefix ? this.getAvailablePrefixes(state) : [];
    }
    if (forcedType === "suffix") {
      return state.canAddSuffix ? this.getAvailableSuffixes(state) : [];
    }

    const prefixes = state.canAddPrefix ? this.getAvailablePrefixes(state) : [];
    const suffixes = state.canAddSuffix ? this.getAvailableSuffixes(state) : [];
    return [...prefixes, ...suffixes];
  }

  private getGroupedOutcomesFiltered(
    state: CraftingState,
    applyMod: (state: CraftingState, selection: ReturnType<typeof this.getAvailablePrefixes>[0]["item"]) => CraftingState
  ): CraftingOutcome[] {
    const allMods = this.getFilteredMods(state);

    if (allMods.length === 0) return [];

    const totalWeight = allMods.reduce((sum, m) => sum + m.weight, 0);

    // Group by modifier ID
    const grouped = new Map<string, { selection: typeof allMods[0]["item"]; weight: number }>();

    for (const { item: selection, weight } of allMods) {
      const modId = selection.modifier.id;
      const existing = grouped.get(modId);
      if (existing) {
        existing.weight += weight;
        if (selection.tier.tier < existing.selection.tier.tier) {
          existing.selection = selection;
        }
      } else {
        grouped.set(modId, { selection, weight });
      }
    }

    return Array.from(grouped.values()).map(({ selection, weight }) => ({
      state: applyMod(state, selection),
      probability: weight / totalWeight,
    }));
  }
}
