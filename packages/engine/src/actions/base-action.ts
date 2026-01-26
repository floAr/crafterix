import type { Currency, Modifier, ModifierType, Omen, OmenEffect, RolledModifier } from "@crafterix/data";
import type { CraftingAction, CraftingOutcome } from "../crafting-action.js";
import { CraftingState } from "../crafting-state.js";
import { ModPool, type ModTierSelection } from "../mod-pool.js";
import { calculateProbabilities, groupByModifierId, type WeightedItem } from "../weighted-random.js";

export type { ModTierSelection };

export interface ActionContext {
  modifiers: Modifier[];
  omens?: Omen[];
}

export abstract class BaseCurrencyAction implements CraftingAction {
  readonly id: string;
  readonly name: string;
  readonly currency: Currency;
  readonly omens: Omen[];
  protected readonly modPool: ModPool;

  constructor(currency: Currency, context: ActionContext) {
    this.id = currency.id;
    this.name = currency.name;
    this.currency = currency;
    this.omens = context.omens ?? [];
    this.modPool = new ModPool(context.modifiers);
  }

  /**
   * Check if any active omen has a specific effect type.
   */
  protected hasOmenEffect(type: OmenEffect["type"]): boolean {
    return this.omens.some((o) => o.effect.type === type);
  }

  /**
   * Get the forced mod type from omens (if any).
   */
  protected getForcedModType(): ModifierType | null {
    for (const omen of this.omens) {
      if (omen.effect.type === "force_mod_type") {
        return omen.effect.modType;
      }
    }
    return null;
  }

  /**
   * Check if omens guarantee highest tier.
   */
  protected guaranteesHighestTier(): boolean {
    return this.omens.some(
      (o) => o.effect.type === "guarantee_tier" && o.effect.minTier === 1
    );
  }

  abstract canApply(state: CraftingState): boolean;
  abstract getOutcomes(state: CraftingState): CraftingOutcome[];
  abstract apply(state: CraftingState, random: number): CraftingState;

  protected getAvailablePrefixes(state: CraftingState): WeightedItem<ModTierSelection>[] {
    return this.modPool.getAvailableMods(state, "prefix", this.currency.weightModifications);
  }

  protected getAvailableSuffixes(state: CraftingState): WeightedItem<ModTierSelection>[] {
    return this.modPool.getAvailableMods(state, "suffix", this.currency.weightModifications);
  }

  protected rollMod(selection: ModTierSelection): RolledModifier {
    const values = selection.tier.values.map((v) =>
      Math.floor(Math.random() * (v.max - v.min + 1)) + v.min
    );
    return {
      modifierId: selection.modifier.id,
      tier: selection.tier.tier,
      values,
    };
  }

  protected rollModWithMidValue(selection: ModTierSelection): RolledModifier {
    const values = selection.tier.values.map((v) => Math.floor((v.min + v.max) / 2));
    return {
      modifierId: selection.modifier.id,
      tier: selection.tier.tier,
      values,
    };
  }

  /**
   * Get outcomes grouped by modifier (collapsing tiers).
   * Returns one outcome per unique mod, with probability summed across tiers.
   */
  protected getGroupedOutcomes(
    state: CraftingState,
    applyMod: (state: CraftingState, selection: ModTierSelection) => CraftingState
  ): CraftingOutcome[] {
    const prefixes = this.getAvailablePrefixes(state);
    const suffixes = this.getAvailableSuffixes(state);
    const allMods = [...prefixes, ...suffixes];

    if (allMods.length === 0) return [];

    const probabilities = calculateProbabilities(allMods);
    const grouped = groupByModifierId(probabilities);

    return Array.from(grouped.values()).map(({ selection, value: probability }) => ({
      state: applyMod(state, selection),
      probability,
    }));
  }
}
