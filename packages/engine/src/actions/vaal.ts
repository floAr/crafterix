import type { CorruptedImplicit, Currency, RolledCorruptedImplicit } from "@crafterix/data";
import type { CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { selectWeighted, groupWeightedByModifierId } from "../weighted-random.js";
import { BaseCurrencyAction, type ActionContext } from "./base-action.js";

export interface VaalActionContext extends ActionContext {
  corruptedImplicits: CorruptedImplicit[];
}

/**
 * Vaal Orb corruption outcomes (PoE2):
 * - NO_CHANGE_PROB (50%): No effect / extra socket (combined, sockets not tracked)
 * - REROLL_PROB (25%): Chaos-like reroll of all affixes
 * - IMPLICIT_PROB (25%): Add corrupted implicit modifier
 */
const VAAL_PROBABILITIES = {
  NO_CHANGE: 0.5,
  REROLL: 0.25,
  IMPLICIT: 0.25,
} as const;

export class VaalOrb extends BaseCurrencyAction {
  private readonly corruptedImplicits: CorruptedImplicit[];

  constructor(currency: Currency, context: VaalActionContext) {
    super(currency, context);
    this.corruptedImplicits = context.corruptedImplicits;
  }

  canApply(state: CraftingState): boolean {
    // Can apply to any non-corrupted item
    return !state.isCorrupted;
  }

  getOutcomes(state: CraftingState): CraftingOutcome[] {
    if (!this.canApply(state)) return [];

    const outcomes: CraftingOutcome[] = [];

    // No change / extra socket outcome
    outcomes.push({
      state: state.withCorrupted(),
      probability: VAAL_PROBABILITIES.NO_CHANGE,
    });

    // Reroll affixes outcome
    if (state.rarity !== "normal" && state.prefixCount + state.suffixCount > 0) {
      const rerollOutcomes = this.getRerollOutcomes(state);
      for (const outcome of rerollOutcomes) {
        outcomes.push({
          state: outcome.state,
          probability: VAAL_PROBABILITIES.REROLL * outcome.probability,
        });
      }
    } else {
      // No affixes to reroll, same as no change
      outcomes.push({
        state: state.withCorrupted(),
        probability: VAAL_PROBABILITIES.REROLL,
      });
    }

    // Corrupted implicit outcome
    const applicableImplicits = this.getApplicableImplicits(state);
    if (applicableImplicits.length > 0) {
      const implicitProb = VAAL_PROBABILITIES.IMPLICIT / applicableImplicits.length;
      for (const implicit of applicableImplicits) {
        const rolledImplicit = this.rollCorruptedImplicit(implicit);
        outcomes.push({
          state: state.withCorruptedImplicit(rolledImplicit),
          probability: implicitProb,
        });
      }
    } else {
      // No applicable implicits, same as no change
      outcomes.push({
        state: state.withCorrupted(),
        probability: VAAL_PROBABILITIES.IMPLICIT,
      });
    }

    return outcomes;
  }

  apply(state: CraftingState, random: number): CraftingState {
    if (!this.canApply(state)) {
      throw new Error("Cannot apply Vaal: item is already corrupted");
    }

    // Determine outcome based on random value and probability thresholds
    const noChangeThreshold = VAAL_PROBABILITIES.NO_CHANGE;
    const rerollThreshold = noChangeThreshold + VAAL_PROBABILITIES.REROLL;

    if (random < noChangeThreshold) {
      return state.withCorrupted();
    } else if (random < rerollThreshold) {
      return this.applyReroll(state);
    } else {
      return this.applyCorruptedImplicit(state);
    }
  }

  private getApplicableImplicits(state: CraftingState): CorruptedImplicit[] {
    const itemTags = state.item.base.tags;
    return this.corruptedImplicits.filter((impl) =>
      impl.applicableTo.some((tag) => itemTags.includes(tag))
    );
  }

  private rollCorruptedImplicit(implicit: CorruptedImplicit): RolledCorruptedImplicit {
    const values = implicit.values.map((v) =>
      Math.floor(Math.random() * (v.max - v.min + 1)) + v.min
    );
    return {
      implicitId: implicit.id,
      values,
    };
  }

  private getRerollOutcomes(state: CraftingState): CraftingOutcome[] {
    // Clear affixes and add new ones based on rarity
    const cleared = state.clearAffixes();

    if (state.rarity === "magic") {
      // Magic: add 1-2 affixes
      return this.getMagicRerollOutcomes(cleared);
    } else if (state.rarity === "rare") {
      // Rare: add 3-6 affixes (simplified to 4 for graph clarity)
      return this.getRareRerollOutcomes(cleared);
    }

    return [{ state: cleared.withCorrupted(), probability: 1 }];
  }

  private getMagicRerollOutcomes(state: CraftingState): CraftingOutcome[] {
    // Simplified: show outcomes for getting one prefix or one suffix
    const outcomes: CraftingOutcome[] = [];

    const prefixes = this.getAvailablePrefixes(state);
    const suffixes = this.getAvailableSuffixes(state);
    const allMods = [...prefixes, ...suffixes];
    const totalWeight = allMods.reduce((s, p) => s + p.weight, 0);

    const grouped = groupWeightedByModifierId(allMods);

    for (const { selection, value: weight } of grouped.values()) {
      const rolled = this.rollModWithMidValue(selection);
      let newState: CraftingState;
      if (selection.modifier.type === "prefix") {
        newState = state.withPrefix(rolled);
      } else {
        newState = state.withSuffix(rolled);
      }
      outcomes.push({
        state: newState.withCorrupted(),
        probability: weight / totalWeight,
      });
    }

    return outcomes;
  }

  private getRareRerollOutcomes(state: CraftingState): CraftingOutcome[] {
    // Simplified: just show that it becomes a rerolled rare with random affixes
    // In practice this creates too many branches, so we collapse to a representative sample

    // For graph clarity, show a few representative outcomes
    const prefixes = this.getAvailablePrefixes(state);
    const suffixes = this.getAvailableSuffixes(state);

    if (prefixes.length === 0 && suffixes.length === 0) {
      return [{ state: state.withCorrupted(), probability: 1 }];
    }

    // Just pick the first available prefix and suffix as representative
    let newState = state;
    if (prefixes.length > 0) {
      const rolled = this.rollModWithMidValue(prefixes[0].item);
      newState = newState.withPrefix(rolled);
    }
    if (suffixes.length > 0) {
      const rolled = this.rollModWithMidValue(suffixes[0].item);
      newState = newState.withSuffix(rolled);
    }

    return [{ state: newState.withCorrupted(), probability: 1 }];
  }

  private applyReroll(state: CraftingState): CraftingState {
    if (state.rarity === "normal") {
      return state.withCorrupted();
    }

    const cleared = state.clearAffixes();
    // Magic: 1-2 affixes, Rare: 3-6 affixes (PoE2 reroll rules)
    const numAffixes = state.rarity === "magic" ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 4) + 3;

    let newState = cleared;
    for (let i = 0; i < numAffixes; i++) {
      const prefixes = newState.canAddPrefix
        ? this.modPool.getAvailableMods(newState, "prefix", this.currency.weightModifications)
        : [];
      const suffixes = newState.canAddSuffix
        ? this.modPool.getAvailableMods(newState, "suffix", this.currency.weightModifications)
        : [];
      const allMods = [...prefixes, ...suffixes];

      if (allMods.length === 0) break;

      const selected = selectWeighted(allMods, Math.random());
      if (!selected) break;

      const rolled = this.rollMod(selected);
      if (selected.modifier.type === "prefix") {
        newState = newState.withPrefix(rolled);
      } else {
        newState = newState.withSuffix(rolled);
      }
    }

    return newState.withCorrupted();
  }

  private applyCorruptedImplicit(state: CraftingState): CraftingState {
    const applicable = this.getApplicableImplicits(state);
    if (applicable.length === 0) {
      return state.withCorrupted();
    }

    const implicit = applicable[Math.floor(Math.random() * applicable.length)];
    return state.withCorruptedImplicit(this.rollCorruptedImplicit(implicit));
  }
}
