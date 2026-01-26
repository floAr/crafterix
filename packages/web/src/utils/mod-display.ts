import { ANY_PREFIX, ANY_SUFFIX, SCRAPED_MODIFIERS } from "@crafterix/data";

// Build a lookup map for fast access
const modifierMap = new Map(SCRAPED_MODIFIERS.map((m) => [m.id, m]));

/**
 * Format a modifier for display, replacing # placeholders with actual values.
 * Uses displayName from the modifier data.
 */
export function formatModText(modifierId: string, values: number[]): string {
  // Handle placeholder mods
  if (modifierId === ANY_PREFIX) return "Any Prefix";
  if (modifierId === ANY_SUFFIX) return "Any Suffix";

  const mod = modifierMap.get(modifierId);
  const template = mod?.displayName || modifierId;

  let result = template;
  for (const value of values) {
    result = result.replace("#", value.toString());
  }
  return result;
}

/**
 * Format a modifier for compact display (shorter text for nodes/edges).
 */
export function formatModShort(modifierId: string, values: number[]): string {
  // Handle placeholder mods
  if (modifierId === ANY_PREFIX) return "Random Prefix";
  if (modifierId === ANY_SUFFIX) return "Random Suffix";

  const mod = modifierMap.get(modifierId);
  if (!mod) {
    console.warn("[mod-display] Unknown mod ID:", modifierId);
  }
  // Use displayName but it's usually already concise
  const template = mod?.displayName || modifierId;

  let result = template;
  for (const value of values) {
    result = result.replace("#", value.toString());
  }
  return result;
}

/**
 * Get a modifier by ID
 */
export function getModifier(modifierId: string) {
  return modifierMap.get(modifierId);
}
