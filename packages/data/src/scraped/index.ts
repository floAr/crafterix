/**
 * Exports for scraped data from poe2db
 *
 * Note: These are the real game data scraped from poe2db.tw
 * They replace the placeholder SAMPLE_* data for production use.
 */

// Import JSON data
import allModifiersJson from "../../data/modifiers/all-modifiers.json" with { type: "json" };
import essenceModifiersJson from "../../data/modifiers/essence-modifiers.json" with { type: "json" };
import allCurrencyJson from "../../data/currency/all-currency.json" with { type: "json" };
import allEssencesJson from "../../data/currency/all-essences.json" with { type: "json" };
import allOmensJson from "../../data/currency/all-omens.json" with { type: "json" };
import type { Modifier } from "../types/modifier.js";
import type { Currency, Omen } from "../types/currency.js";

/**
 * All modifiers scraped from poe2db + essence modifiers
 */
export const SCRAPED_MODIFIERS: Modifier[] = [
  ...(allModifiersJson as Modifier[]),
  ...(essenceModifiersJson as Modifier[]),
];

/**
 * All currency items
 */
export const SCRAPED_CURRENCY: Currency[] = allCurrencyJson as Currency[];

/**
 * All essences (a type of currency with guaranteed mods)
 */
export const SCRAPED_ESSENCES: Currency[] = allEssencesJson as Currency[];

/**
 * All crafting-related omens
 */
export const SCRAPED_OMENS: Omen[] = allOmensJson as Omen[];

/**
 * Combined currency + essences for full crafting options
 */
export const ALL_CURRENCY: Currency[] = [...SCRAPED_CURRENCY, ...SCRAPED_ESSENCES];

/**
 * Get modifiers applicable to a specific item type
 */
export function getModifiersForItemType(itemType: string): Modifier[] {
  return SCRAPED_MODIFIERS.filter((m) => m.applicableTo.includes(itemType));
}

/**
 * Get a modifier by ID
 */
export function getScrapedModifierById(id: string): Modifier | undefined {
  return SCRAPED_MODIFIERS.find((m) => m.id === id);
}

/**
 * Get all prefixes
 */
export function getScrapedPrefixes(): Modifier[] {
  return SCRAPED_MODIFIERS.filter((m) => m.type === "prefix");
}

/**
 * Get all suffixes
 */
export function getScrapedSuffixes(): Modifier[] {
  return SCRAPED_MODIFIERS.filter((m) => m.type === "suffix");
}

/**
 * Get currency by ID
 */
export function getScrapedCurrencyById(id: string): Currency | undefined {
  return ALL_CURRENCY.find((c) => c.id === id);
}

/**
 * Get omen by ID
 */
export function getScrapedOmenById(id: string): Omen | undefined {
  return SCRAPED_OMENS.find((o) => o.id === id);
}
