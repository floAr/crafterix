import type { CraftedItem, Currency, Modifier, Omen } from "@crafterix/data";
import type { CraftingAction } from "@crafterix/engine";
import { CraftingState } from "@crafterix/engine";

/**
 * Check if a currency can be applied to an item
 */
export function canApplyCurrency(
  item: CraftedItem,
  currencyId: string,
  actions: Map<string, CraftingAction>
): boolean {
  const action = actions.get(currencyId);
  if (!action) return false;

  const craftingState = new CraftingState(item);
  return action.canApply(craftingState);
}

/**
 * Get a human-readable reason why a currency cannot be applied
 */
export function getDisabledReason(
  item: CraftedItem | null,
  currencyId: string,
  currencies: Currency[]
): string | null {
  if (!item) return "No item selected";

  const currency = currencies.find((c) => c.id === currencyId);
  if (!currency) return "Unknown currency";

  if (!currency.applicableToRarity.includes(item.rarity)) {
    const expected = currency.applicableToRarity.join(" or ");
    return `Requires ${expected} item (current: ${item.rarity})`;
  }

  if (item.corrupted) return "Item is corrupted";

  if (currency.effect === "add_affix") {
    const prefixFull = item.prefixes.length >= item.base.affixSlots.maxPrefixes;
    const suffixFull = item.suffixes.length >= item.base.affixSlots.maxSuffixes;
    if (prefixFull && suffixFull) return "Item has max affixes";
  }

  if (currency.effect === "remove_affix") {
    if (item.prefixes.length === 0 && item.suffixes.length === 0) {
      return "Item has no affixes to remove";
    }
  }

  return null;
}

/**
 * Get display name for a modifier ID
 */
export function getModDisplayName(modId: string, modifiers: Modifier[]): string {
  const mod = modifiers.find((m) => m.id === modId);
  return mod?.displayName ?? modId;
}

/**
 * Get display name for a currency ID
 */
export function getCurrencyName(currencyId: string, currencies: Currency[]): string {
  const currency = currencies.find((c) => c.id === currencyId);
  return currency?.name ?? currencyId;
}

/**
 * Get omens that can be applied with a given currency
 */
export function getApplicableOmens(currencyId: string, omens: Omen[]): Omen[] {
  return omens.filter((o) => o.appliesTo.includes(currencyId));
}
