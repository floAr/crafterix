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
