import type { CraftedItem, RolledModifier } from "@crafterix/data";
import { ANY_PREFIX, ANY_SUFFIX } from "@crafterix/data";
import type { CraftingAction } from "./crafting-action.js";
import { CraftingState } from "./crafting-state.js";

/**
 * Represents a single possible outcome from applying a currency.
 * Unlike CraftingOutcome which wraps CraftingState, this contains
 * the actual item and diff information for UI display.
 */
export interface OutcomeOption {
  modAdded: RolledModifier | null;
  modRemoved: RolledModifier | null;
  probability: number;
  resultingItem: CraftedItem;
}

/**
 * Finds the first mod in `newMods` that doesn't exist in `oldMods` by modifierId.
 */
function findAddedMod(
  oldMods: RolledModifier[],
  newMods: RolledModifier[]
): RolledModifier | null {
  return newMods.find(
    (m) => !oldMods.some((old) => old.modifierId === m.modifierId)
  ) ?? null;
}

/**
 * Finds the first mod in `oldMods` that doesn't exist in `newMods` by modifierId.
 */
function findRemovedMod(
  oldMods: RolledModifier[],
  newMods: RolledModifier[]
): RolledModifier | null {
  return oldMods.find(
    (m) => !newMods.some((newM) => newM.modifierId === m.modifierId)
  ) ?? null;
}

/**
 * Compares old and new items to determine what mod was added or removed.
 */
function diffItems(
  oldItem: CraftedItem,
  newItem: CraftedItem
): { modAdded: RolledModifier | null; modRemoved: RolledModifier | null } {
  // Check prefixes first, then suffixes
  const addedPrefix = findAddedMod(oldItem.prefixes, newItem.prefixes);
  const addedSuffix = findAddedMod(oldItem.suffixes, newItem.suffixes);
  const removedPrefix = findRemovedMod(oldItem.prefixes, newItem.prefixes);
  const removedSuffix = findRemovedMod(oldItem.suffixes, newItem.suffixes);

  return {
    modAdded: addedPrefix ?? addedSuffix,
    modRemoved: removedPrefix ?? removedSuffix,
  };
}

/**
 * Creates "Any Prefix" / "Any Suffix" placeholder options that aggregate
 * all outcomes that add a prefix or suffix.
 */
function createAnyOptions(
  oldItem: CraftedItem,
  outcomes: OutcomeOption[]
): OutcomeOption[] {
  const anyOptions: OutcomeOption[] = [];

  // Group by prefix/suffix adds
  const prefixOutcomes = outcomes.filter(
    (o) => o.resultingItem.prefixes.length > oldItem.prefixes.length
  );
  const suffixOutcomes = outcomes.filter(
    (o) => o.resultingItem.suffixes.length > oldItem.suffixes.length
  );

  if (prefixOutcomes.length > 0) {
    const totalProb = prefixOutcomes.reduce((sum, o) => sum + o.probability, 0);
    const placeholderMod: RolledModifier = { modifierId: ANY_PREFIX, tier: 0, values: [] };
    // Use rarity from actual outcomes (handles Transmutation normal→magic)
    const newRarity = prefixOutcomes[0].resultingItem.rarity;
    anyOptions.push({
      modAdded: placeholderMod,
      modRemoved: null,
      probability: totalProb,
      resultingItem: {
        ...oldItem,
        rarity: newRarity,
        prefixes: [...oldItem.prefixes, placeholderMod],
      },
    });
  }

  if (suffixOutcomes.length > 0) {
    const totalProb = suffixOutcomes.reduce((sum, o) => sum + o.probability, 0);
    const placeholderMod: RolledModifier = { modifierId: ANY_SUFFIX, tier: 0, values: [] };
    // Use rarity from actual outcomes (handles Transmutation normal→magic)
    const newRarity = suffixOutcomes[0].resultingItem.rarity;
    anyOptions.push({
      modAdded: placeholderMod,
      modRemoved: null,
      probability: totalProb,
      resultingItem: {
        ...oldItem,
        rarity: newRarity,
        suffixes: [...oldItem.suffixes, placeholderMod],
      },
    });
  }

  return anyOptions;
}

/**
 * Builds outcome options from a crafting action's raw outcomes.
 *
 * Converts CraftingOutcome[] (state + probability) to OutcomeOption[]
 * (item + mod diff + probability), and prepends "Any Prefix/Suffix"
 * aggregate options.
 *
 * @param action The crafting action to get outcomes from
 * @param currentItem The item the action will be applied to
 * @returns Array of outcome options with "Any" aggregates first
 */
export function buildOutcomeOptions(
  action: CraftingAction,
  currentItem: CraftedItem
): OutcomeOption[] {
  const craftingState = new CraftingState(currentItem);

  if (!action.canApply(craftingState)) {
    return [];
  }

  const rawOutcomes = action.getOutcomes(craftingState);

  // Convert to OutcomeOptions with mod diff info
  const outcomes: OutcomeOption[] = rawOutcomes.map((o) => {
    const newItem = o.state.item;
    const { modAdded, modRemoved } = diffItems(currentItem, newItem);
    return {
      modAdded,
      modRemoved,
      probability: o.probability,
      resultingItem: newItem,
    };
  });

  // Create "Any" aggregate options
  const anyOptions = createAnyOptions(currentItem, outcomes);

  // Prepend "Any" options
  return [...anyOptions, ...outcomes];
}
