import type { Modifier } from "@crafterix/data";
import { SCRAPED_MODIFIERS } from "@crafterix/data";

/**
 * All available modifiers (using scraped data from poe2db)
 */
export const SAMPLE_MODIFIERS: Modifier[] = SCRAPED_MODIFIERS;

export function getModifierById(id: string): Modifier | undefined {
  return SAMPLE_MODIFIERS.find((mod) => mod.id === id);
}

export function getModifiersByType(type: "prefix" | "suffix"): Modifier[] {
  return SAMPLE_MODIFIERS.filter((mod) => mod.type === type);
}
