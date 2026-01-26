export { BaseCurrencyAction, type ActionContext } from "./base-action.js";
export { TransmutationOrb } from "./transmutation.js";
export { AugmentationOrb } from "./augmentation.js";
export { RegalOrb } from "./regal.js";
export { ExaltedOrb } from "./exalted.js";
export { AnnulmentOrb } from "./annulment.js";
export { ChaosOrb } from "./chaos.js";
export { DivineOrb } from "./divine.js";
export { VaalOrb, type VaalActionContext } from "./vaal.js";
export { PerfectEssence, UpgradingEssence } from "./essence.js";

import type { CorruptedImplicit, Currency, Modifier, Omen } from "@crafterix/data";
import type { CraftingAction } from "../crafting-action.js";
import { TransmutationOrb } from "./transmutation.js";
import { AugmentationOrb } from "./augmentation.js";
import { RegalOrb } from "./regal.js";
import { ExaltedOrb } from "./exalted.js";
import { AnnulmentOrb } from "./annulment.js";
import { ChaosOrb } from "./chaos.js";
import { DivineOrb } from "./divine.js";
import { VaalOrb } from "./vaal.js";
import { PerfectEssence, UpgradingEssence } from "./essence.js";
import type { ActionContext } from "./base-action.js";

const ACTION_CONSTRUCTORS: Record<
  string,
  new (currency: Currency, context: ActionContext) => CraftingAction
> = {
  orb_of_transmutation: TransmutationOrb,
  orb_of_augmentation: AugmentationOrb,
  regal_orb: RegalOrb,
  exalted_orb: ExaltedOrb,
  orb_of_annulment: AnnulmentOrb,
  chaos_orb: ChaosOrb,
  divine_orb: DivineOrb,
};

export interface CreateActionOptions {
  modifiers: Modifier[];
  corruptedImplicits?: CorruptedImplicit[];
  omens?: Omen[];
}

export function createAction(currency: Currency, options: CreateActionOptions): CraftingAction | null {
  const context: ActionContext = { modifiers: options.modifiers, omens: options.omens };

  // Special case for Vaal Orb which needs corrupted implicits
  if (currency.id === "vaal_orb") {
    return new VaalOrb(currency, {
      ...context,
      corruptedImplicits: options.corruptedImplicits ?? [],
    });
  }

  // Route essences by effect type
  if (currency.effect === "guaranteed_mod") {
    return new PerfectEssence(currency, context);
  }
  if (currency.effect === "upgrade_magic_to_rare_guaranteed") {
    return new UpgradingEssence(currency, context);
  }

  // Standard currencies by ID
  const Constructor = ACTION_CONSTRUCTORS[currency.id];
  if (!Constructor) return null;
  return new Constructor(currency, context);
}

export function createAllActions(
  currencies: Currency[],
  options: CreateActionOptions
): Map<string, CraftingAction> {
  const actions = new Map<string, CraftingAction>();
  for (const currency of currencies) {
    const action = createAction(currency, options);
    if (action) {
      actions.set(currency.id, action);
    }
  }
  return actions;
}
