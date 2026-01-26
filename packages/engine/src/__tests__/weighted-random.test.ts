import { describe, it, expect } from "vitest";
import {
  calculateProbabilities,
  selectWeighted,
  groupProbabilities,
  groupByModifierId,
  groupWeightedByModifierId,
  type WeightedItem,
} from "../weighted-random.js";

describe("calculateProbabilities", () => {
  it("returns empty map for empty list", () => {
    const result = calculateProbabilities([]);
    expect(result.size).toBe(0);
  });

  it("returns 1.0 for single item", () => {
    const items: WeightedItem<string>[] = [{ item: "only", weight: 100 }];
    const result = calculateProbabilities(items);

    expect(result.get("only")).toBe(1);
  });

  it("calculates correct probabilities for equal weights", () => {
    const items: WeightedItem<string>[] = [
      { item: "a", weight: 100 },
      { item: "b", weight: 100 },
      { item: "c", weight: 100 },
      { item: "d", weight: 100 },
    ];
    const result = calculateProbabilities(items);

    expect(result.get("a")).toBe(0.25);
    expect(result.get("b")).toBe(0.25);
    expect(result.get("c")).toBe(0.25);
    expect(result.get("d")).toBe(0.25);
  });

  it("calculates correct probabilities for different weights", () => {
    const items: WeightedItem<string>[] = [
      { item: "common", weight: 70 },
      { item: "uncommon", weight: 20 },
      { item: "rare", weight: 10 },
    ];
    const result = calculateProbabilities(items);

    expect(result.get("common")).toBe(0.7);
    expect(result.get("uncommon")).toBe(0.2);
    expect(result.get("rare")).toBe(0.1);
  });

  it("returns empty map when all weights are zero", () => {
    const items: WeightedItem<string>[] = [
      { item: "a", weight: 0 },
      { item: "b", weight: 0 },
    ];
    const result = calculateProbabilities(items);

    expect(result.size).toBe(0);
  });

  it("probabilities sum to 1", () => {
    const items: WeightedItem<number>[] = [
      { item: 1, weight: 123 },
      { item: 2, weight: 456 },
      { item: 3, weight: 789 },
      { item: 4, weight: 321 },
    ];
    const result = calculateProbabilities(items);

    let sum = 0;
    for (const prob of result.values()) {
      sum += prob;
    }
    expect(sum).toBeCloseTo(1, 10);
  });

  it("works with object items", () => {
    const obj1 = { id: 1 };
    const obj2 = { id: 2 };
    const items: WeightedItem<{ id: number }>[] = [
      { item: obj1, weight: 30 },
      { item: obj2, weight: 70 },
    ];
    const result = calculateProbabilities(items);

    expect(result.get(obj1)).toBe(0.3);
    expect(result.get(obj2)).toBe(0.7);
  });
});

describe("selectWeighted", () => {
  it("returns null for empty list", () => {
    const result = selectWeighted([], 0.5);
    expect(result).toBeNull();
  });

  it("returns null when all weights are zero", () => {
    const items: WeightedItem<string>[] = [
      { item: "a", weight: 0 },
      { item: "b", weight: 0 },
    ];
    const result = selectWeighted(items, 0.5);

    expect(result).toBeNull();
  });

  it("returns only item for single item list", () => {
    const items: WeightedItem<string>[] = [{ item: "only", weight: 100 }];

    expect(selectWeighted(items, 0)).toBe("only");
    expect(selectWeighted(items, 0.5)).toBe("only");
    expect(selectWeighted(items, 0.99)).toBe("only");
  });

  it("selects items based on random threshold", () => {
    const items: WeightedItem<string>[] = [
      { item: "first", weight: 50 },
      { item: "second", weight: 50 },
    ];

    // random = 0 should select first item
    expect(selectWeighted(items, 0)).toBe("first");

    // random = 0.49 should still be in first item's range
    expect(selectWeighted(items, 0.49)).toBe("first");

    // random = 0.51 should be in second item's range
    expect(selectWeighted(items, 0.51)).toBe("second");

    // random = 0.99 should select second item
    expect(selectWeighted(items, 0.99)).toBe("second");
  });

  it("handles edge case at boundary", () => {
    const items: WeightedItem<string>[] = [
      { item: "a", weight: 100 },
      { item: "b", weight: 100 },
      { item: "c", weight: 100 },
    ];

    // At exactly 1/3, should still be in first item
    expect(selectWeighted(items, 0)).toBe("a");
    // At 1.0 (edge case), should return last item
    expect(selectWeighted(items, 1)).toBe("c");
  });

  it("respects weight proportions", () => {
    const items: WeightedItem<string>[] = [
      { item: "common", weight: 90 },
      { item: "rare", weight: 10 },
    ];

    // 0.89 should be in common range (90% of total)
    expect(selectWeighted(items, 0.89)).toBe("common");

    // 0.91 should be in rare range
    expect(selectWeighted(items, 0.91)).toBe("rare");
  });
});

describe("groupProbabilities", () => {
  it("returns empty map for empty input", () => {
    const result = groupProbabilities(new Map(), (item) => item);
    expect(result.size).toBe(0);
  });

  it("groups items by key function", () => {
    const items: WeightedItem<{ type: string; name: string }>[] = [
      { item: { type: "fruit", name: "apple" }, weight: 30 },
      { item: { type: "fruit", name: "banana" }, weight: 20 },
      { item: { type: "vegetable", name: "carrot" }, weight: 50 },
    ];
    const probs = calculateProbabilities(items);
    const grouped = groupProbabilities(probs, (item) => item.type);

    expect(grouped.get("fruit")).toBeCloseTo(0.5, 10);
    expect(grouped.get("vegetable")).toBeCloseTo(0.5, 10);
  });

  it("sums probabilities within groups", () => {
    const items: WeightedItem<string>[] = [
      { item: "a1", weight: 10 },
      { item: "a2", weight: 20 },
      { item: "b1", weight: 30 },
      { item: "b2", weight: 40 },
    ];
    const probs = calculateProbabilities(items);
    const grouped = groupProbabilities(probs, (item) => item[0]);

    // a group: 10 + 20 = 30 out of 100
    expect(grouped.get("a")).toBeCloseTo(0.3, 10);
    // b group: 30 + 40 = 70 out of 100
    expect(grouped.get("b")).toBeCloseTo(0.7, 10);
  });
});

describe("groupByModifierId", () => {
  // Test fixture that matches the expected interface
  interface TestSelection {
    modifier: { id: string };
    tier: { tier: number };
  }

  it("returns empty map for empty input", () => {
    const result = groupByModifierId(new Map<TestSelection, number>());
    expect(result.size).toBe(0);
  });

  it("groups by modifier ID", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel2: TestSelection = { modifier: { id: "life" }, tier: { tier: 2 } };
    const sel3: TestSelection = { modifier: { id: "mana" }, tier: { tier: 1 } };

    const probs = new Map<TestSelection, number>([
      [sel1, 0.1],
      [sel2, 0.2],
      [sel3, 0.7],
    ]);

    const grouped = groupByModifierId(probs);

    expect(grouped.size).toBe(2);
    expect(grouped.get("life")?.value).toBeCloseTo(0.3, 10);
    expect(grouped.get("mana")?.value).toBeCloseTo(0.7, 10);
  });

  it("keeps highest tier (lowest tier number) as representative", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 3 } };
    const sel2: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel3: TestSelection = { modifier: { id: "life" }, tier: { tier: 2 } };

    const probs = new Map<TestSelection, number>([
      [sel1, 0.3],
      [sel2, 0.5],
      [sel3, 0.2],
    ]);

    const grouped = groupByModifierId(probs);
    const lifeGroup = grouped.get("life");

    expect(lifeGroup?.selection.tier.tier).toBe(1);
    expect(lifeGroup?.value).toBeCloseTo(1, 10);
  });

  it("works with single tier per mod", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel2: TestSelection = { modifier: { id: "mana" }, tier: { tier: 1 } };

    const probs = new Map<TestSelection, number>([
      [sel1, 0.6],
      [sel2, 0.4],
    ]);

    const grouped = groupByModifierId(probs);

    expect(grouped.get("life")?.selection).toBe(sel1);
    expect(grouped.get("mana")?.selection).toBe(sel2);
  });
});

describe("groupWeightedByModifierId", () => {
  interface TestSelection {
    modifier: { id: string };
    tier: { tier: number };
  }

  it("returns empty map for empty input", () => {
    const result = groupWeightedByModifierId<TestSelection>([]);
    expect(result.size).toBe(0);
  });

  it("groups weighted items by modifier ID", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel2: TestSelection = { modifier: { id: "life" }, tier: { tier: 2 } };
    const sel3: TestSelection = { modifier: { id: "mana" }, tier: { tier: 1 } };

    const items: WeightedItem<TestSelection>[] = [
      { item: sel1, weight: 100 },
      { item: sel2, weight: 200 },
      { item: sel3, weight: 150 },
    ];

    const grouped = groupWeightedByModifierId(items);

    expect(grouped.size).toBe(2);
    expect(grouped.get("life")?.value).toBe(300);
    expect(grouped.get("mana")?.value).toBe(150);
  });

  it("keeps highest tier (lowest tier number) as representative", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 3 } };
    const sel2: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel3: TestSelection = { modifier: { id: "life" }, tier: { tier: 2 } };

    const items: WeightedItem<TestSelection>[] = [
      { item: sel1, weight: 100 },
      { item: sel2, weight: 200 },
      { item: sel3, weight: 150 },
    ];

    const grouped = groupWeightedByModifierId(items);
    const lifeGroup = grouped.get("life");

    expect(lifeGroup?.selection.tier.tier).toBe(1);
    expect(lifeGroup?.value).toBe(450);
  });

  it("preserves original selection reference", () => {
    const sel1: TestSelection = { modifier: { id: "life" }, tier: { tier: 1 } };
    const sel2: TestSelection = { modifier: { id: "life" }, tier: { tier: 2 } };

    const items: WeightedItem<TestSelection>[] = [
      { item: sel2, weight: 100 },
      { item: sel1, weight: 200 },
    ];

    const grouped = groupWeightedByModifierId(items);

    // sel1 has lower tier number, so it should be the representative
    expect(grouped.get("life")?.selection).toBe(sel1);
  });
});
