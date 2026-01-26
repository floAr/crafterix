import type { Currency, Omen } from "@crafterix/data";
import type { CraftingState } from "./crafting-state.js";

export interface CraftingOutcome {
  state: CraftingState;
  probability: number;
}

export interface CraftingAction {
  readonly id: string;
  readonly name: string;
  readonly currency: Currency;
  readonly omen?: Omen;

  /**
   * Check if this action can be applied to the given state.
   */
  canApply(state: CraftingState): boolean;

  /**
   * Get all possible outcomes with their probabilities.
   * For deterministic actions, returns single outcome with probability 1.
   */
  getOutcomes(state: CraftingState): CraftingOutcome[];

  /**
   * Apply the action with a random seed to get a single outcome.
   * Used for simulation/testing.
   */
  apply(state: CraftingState, random: number): CraftingState;
}

export type ActionRegistry = Map<string, CraftingAction>;
