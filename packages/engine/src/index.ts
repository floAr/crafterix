export { CraftingState } from "./crafting-state.js";
export { ModPool, type ModTierSelection } from "./mod-pool.js";
export {
  calculateProbabilities,
  selectWeighted,
  groupProbabilities,
  type WeightedItem,
} from "./weighted-random.js";
export type { CraftingAction, CraftingOutcome, ActionRegistry } from "./crafting-action.js";
export { buildOutcomeOptions, type OutcomeOption } from "./outcome-builder.js";

// Actions
export {
  BaseCurrencyAction,
  TransmutationOrb,
  AugmentationOrb,
  RegalOrb,
  ExaltedOrb,
  AnnulmentOrb,
  ChaosOrb,
  DivineOrb,
  VaalOrb,
  PerfectEssence,
  createAction,
  createAllActions,
  type ActionContext,
  type CreateActionOptions,
  type VaalActionContext,
} from "./actions/index.js";

// Sample data
export {
  SAMPLE_ITEMS,
  SAMPLE_MODIFIERS,
  SAMPLE_CURRENCY,
  SAMPLE_OMENS,
  SAMPLE_CORRUPTED_IMPLICITS,
  getItemById,
  getModifierById,
  getModifiersByType,
  getCurrencyById,
  getOmenById,
  getCorruptedImplicitsForItem,
} from "./data/index.js";
