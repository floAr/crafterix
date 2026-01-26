import type { Currency, Omen } from "@crafterix/data";
import { ALL_CURRENCY, SCRAPED_OMENS } from "@crafterix/data";

/**
 * All available currency items (using scraped data from poe2db)
 */
export const SAMPLE_CURRENCY: Currency[] = ALL_CURRENCY;

/**
 * All available omens (using scraped data from poe2db)
 */
export const SAMPLE_OMENS: Omen[] = SCRAPED_OMENS;

export function getCurrencyById(id: string): Currency | undefined {
  return SAMPLE_CURRENCY.find((c) => c.id === id);
}

export function getOmenById(id: string): Omen | undefined {
  return SAMPLE_OMENS.find((o) => o.id === id);
}
