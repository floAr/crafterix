export interface WeightedItem<T> {
  item: T;
  weight: number;
}

/**
 * Calculates selection probability for each item based on weights.
 */
export function calculateProbabilities<T>(items: WeightedItem<T>[]): Map<T, number> {
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);
  const probabilities = new Map<T, number>();

  if (totalWeight === 0) {
    return probabilities;
  }

  for (const { item, weight } of items) {
    probabilities.set(item, weight / totalWeight);
  }

  return probabilities;
}

/**
 * Selects a random item based on weights.
 * @param items Array of weighted items
 * @param random Random number between 0 and 1
 */
export function selectWeighted<T>(items: WeightedItem<T>[], random: number): T | null {
  const totalWeight = items.reduce((sum, { weight }) => sum + weight, 0);

  if (totalWeight === 0 || items.length === 0) {
    return null;
  }

  let threshold = random * totalWeight;

  for (const { item, weight } of items) {
    threshold -= weight;
    if (threshold <= 0) {
      return item;
    }
  }

  return items[items.length - 1].item;
}

/**
 * Groups probabilities by a key function (e.g., group tiers by mod name).
 */
export function groupProbabilities<T, K>(
  probabilities: Map<T, number>,
  keyFn: (item: T) => K
): Map<K, number> {
  const grouped = new Map<K, number>();

  for (const [item, prob] of probabilities) {
    const key = keyFn(item);
    const existing = grouped.get(key) ?? 0;
    grouped.set(key, existing + prob);
  }

  return grouped;
}

/**
 * Result of grouping mod tier selections by modifier ID.
 */
export interface GroupedModSelection<T extends { modifier: { id: string }; tier: { tier: number } }> {
  /** Representative selection - the highest tier (lowest tier number) for display */
  selection: T;
  /** Combined probability/weight across all tiers */
  value: number;
}

/**
 * Groups mod tier selections by modifier ID, summing probabilities and keeping highest tier.
 *
 * PoE domain note: Lower tier number = better tier (tier 1 is best).
 * This function keeps the lowest tier number as the representative for display purposes.
 *
 * @param probabilities Map of selection to probability (from calculateProbabilities)
 * @returns Map of modifier ID to grouped result
 */
export function groupByModifierId<T extends { modifier: { id: string }; tier: { tier: number } }>(
  probabilities: Map<T, number>
): Map<string, GroupedModSelection<T>> {
  const grouped = new Map<string, GroupedModSelection<T>>();

  for (const [selection, prob] of probabilities) {
    const modId = selection.modifier.id;
    const existing = grouped.get(modId);

    if (existing) {
      existing.value += prob;
      // Keep highest tier (lowest tier number) for display
      if (selection.tier.tier < existing.selection.tier.tier) {
        existing.selection = selection;
      }
    } else {
      grouped.set(modId, { selection, value: prob });
    }
  }

  return grouped;
}

/**
 * Groups weighted items by modifier ID, summing weights and keeping highest tier.
 * Use this when you have raw weighted items before probability calculation.
 *
 * @param items Array of weighted mod tier selections
 * @returns Map of modifier ID to grouped result (value is summed weight, not probability)
 */
export function groupWeightedByModifierId<T extends { modifier: { id: string }; tier: { tier: number } }>(
  items: WeightedItem<T>[]
): Map<string, GroupedModSelection<T>> {
  const grouped = new Map<string, GroupedModSelection<T>>();

  for (const { item: selection, weight } of items) {
    const modId = selection.modifier.id;
    const existing = grouped.get(modId);

    if (existing) {
      existing.value += weight;
      // Keep highest tier (lowest tier number) for display
      if (selection.tier.tier < existing.selection.tier.tier) {
        existing.selection = selection;
      }
    } else {
      grouped.set(modId, { selection, value: weight });
    }
  }

  return grouped;
}
