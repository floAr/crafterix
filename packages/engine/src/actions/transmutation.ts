import type { Currency } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { selectWeighted } from "../weighted-random.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

/**
 * Orb of Transmutation: Upgrades Normal → Magic, adding 1 affix
 */
export class TransmutationOrb extends BaseCurrencyAction {
  constructor(currency: Currency, context: ActionContext) {
    super(currency, context);
  }

  canApply(state: CraftingState): boolean {
    return state.rarity === "normal" && !state.isCorrupted;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    return this.getGroupedOutcomes(state, (s, selection) => {
      const rolledMod = this.rollModWithMidValue(selection);
      const magicState = s.withRarity("magic");

      if (selection.modifier.type === "prefix") {
        return new CraftingState({
          ...magicState.item,
          prefixes: [rolledMod],
        });
      } else {
        return new CraftingState({
          ...magicState.item,
          suffixes: [rolledMod],
        });
      }
    });
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Transmutation: item is not Normal");
    }

    const prefixes = this.getAvailablePrefixes(state);
    const suffixes = this.getAvailableSuffixes(state);
    const allMods = [...prefixes, ...suffixes];

    const selected = selectWeighted(allMods, random);
    if (!selected) {
      throw new Error("No available mods for Transmutation");
    }

    const rolledMod = this.rollMod(selected);
    const magicState = state.withRarity("magic");

    if (selected.modifier.type === "prefix") {
      return new CraftingState({
        ...magicState.item,
        prefixes: [rolledMod],
      });
    } else {
      return new CraftingState({
        ...magicState.item,
        suffixes: [rolledMod],
      });
    }
  }
}
