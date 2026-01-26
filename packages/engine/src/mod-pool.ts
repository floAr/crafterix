import type { ItemBase, Modifier, ModifierTier, ModifierType, WeightModification } from "@crafterix/data";
import { calculateProbabilities, type WeightedItem } from "./weighted-random.js";
import type { CraftingState } from "./crafting-state.js";

export interface ModTierSelection {
  modifier: Modifier;
  tier: ModifierTier;
}

export class ModPool {
  constructor(private readonly modifiers: Modifier[]) {}

  getModifierById(id: string): Modifier | undefined {
    return this.modifiers.find((m) => m.id === id);
  }

  /**
   * Get available mods for an item, filtered by type and existing mods.
   */
  getAvailableMods(
    state: CraftingState,
    type: ModifierType,
    weightMods: WeightModification[] = []
  ): WeightedItem<ModTierSelection>[] {
    const base = state.item.base;
    const existingGroups = new Set<string>();

    // Collect groups already on the item
    for (const prefix of state.item.prefixes) {
      const mod = this.modifiers.find((m) => m.id === prefix.modifierId);
      if (mod) existingGroups.add(mod.group);
    }
    for (const suffix of state.item.suffixes) {
      const mod = this.modifiers.find((m) => m.id === suffix.modifierId);
      if (mod) existingGroups.add(mod.group);
    }

    const results: WeightedItem<ModTierSelection>[] = [];

    for (const mod of this.modifiers) {
      // Filter by type
      if (mod.type !== type) continue;

      // Filter by applicable item tags
      if (!this.isApplicableToItem(mod, base)) continue;

      // Filter out groups already on item
      if (existingGroups.has(mod.group)) continue;

      // Get tiers available for item level
      for (const tier of mod.tiers) {
        if (tier.requiredLevel > base.itemLevel) continue;

        let weight = tier.weight;

        // Apply weight modifications
        for (const wm of weightMods) {
          if (mod.tags.includes(wm.tag)) {
            weight *= wm.multiplier;
          }
        }

        if (weight > 0) {
          results.push({
            item: { modifier: mod, tier },
            weight,
          });
        }
      }
    }

    return results;
  }

  /**
   * Get probabilities for each mod (collapsed across tiers).
   */
  getModProbabilities(
    state: CraftingState,
    type: ModifierType,
    weightMods: WeightModification[] = []
  ): Map<string, { total: number; byTier: Map<number, number> }> {
    const available = this.getAvailableMods(state, type, weightMods);
    const tierProbs = calculateProbabilities(available);

    const result = new Map<string, { total: number; byTier: Map<number, number> }>();

    for (const [selection, prob] of tierProbs) {
      const modId = selection.modifier.id;
      let entry = result.get(modId);

      if (!entry) {
        entry = { total: 0, byTier: new Map() };
        result.set(modId, entry);
      }

      entry.total += prob;
      entry.byTier.set(selection.tier.tier, prob);
    }

    return result;
  }

  private isApplicableToItem(mod: Modifier, base: ItemBase): boolean {
    // Mod must have at least one tag that matches item tags
    return mod.applicableTo.some((tag) => base.tags.includes(tag));
  }
}
