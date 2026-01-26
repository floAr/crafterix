import type { ItemBase, Modifier, ModifierTier, ModifierType, WeightModification } from "@crafterix/data";
import { calculateProbabilities, type WeightedItem } from "./weighted-random.js";
import type { CraftingState } from "./crafting-state.js";

export interface ModTierSelection {
  modifier: Modifier;
  tier: ModifierTier;
}

export class ModPool {
  private readonly modifierById: Map<string, Modifier>;
  private readonly modifiersByGroup: Map<string, Modifier[]>;

  constructor(private readonly modifiers: Modifier[]) {
    // Build O(1) lookup by ID
    this.modifierById = new Map(modifiers.map((m) => [m.id, m]));

    // Build group index for conflict checking
    this.modifiersByGroup = new Map();
    for (const mod of modifiers) {
      const group = this.modifiersByGroup.get(mod.group);
      if (group) {
        group.push(mod);
      } else {
        this.modifiersByGroup.set(mod.group, [mod]);
      }
    }
  }

  getModifierById(id: string): Modifier | undefined {
    return this.modifierById.get(id);
  }

  /**
   * Check if the item already has a modifier from the specified group.
   * Useful for checking if a guaranteed mod can be added.
   */
  hasGroupConflict(state: CraftingState, group: string): boolean {
    const allMods = [...state.item.prefixes, ...state.item.suffixes];
    return allMods.some((m) => {
      const mod = this.modifierById.get(m.modifierId);
      return mod?.group === group;
    });
  }

  /**
   * Get available mods for an item, filtered by type and existing mods.
   * @param includeEssenceMods - If true, includes essence-only mods. Default false.
   */
  getAvailableMods(
    state: CraftingState,
    type: ModifierType,
    weightMods: WeightModification[] = [],
    includeEssenceMods: boolean = false
  ): WeightedItem<ModTierSelection>[] {
    const base = state.item.base;
    const existingGroups = new Set<string>();

    // Collect groups already on the item using O(1) lookups
    for (const prefix of state.item.prefixes) {
      const mod = this.modifierById.get(prefix.modifierId);
      if (mod) existingGroups.add(mod.group);
    }
    for (const suffix of state.item.suffixes) {
      const mod = this.modifierById.get(suffix.modifierId);
      if (mod) existingGroups.add(mod.group);
    }

    const results: WeightedItem<ModTierSelection>[] = [];

    for (const mod of this.modifiers) {
      // Filter by type
      if (mod.type !== type) continue;

      // Filter out essence-only mods unless explicitly included
      if (!includeEssenceMods && mod.tags.includes("essence")) continue;

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
