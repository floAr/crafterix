import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
  useMemo,
} from "react";
import type { Omen, RolledModifier } from "@crafterix/data";
import { ANY_PREFIX, ANY_SUFFIX } from "@crafterix/data";
import {
  CraftingState,
  createAllActions,
  SAMPLE_ITEMS,
  SAMPLE_MODIFIERS,
  SAMPLE_CURRENCY,
  SAMPLE_CORRUPTED_IMPLICITS,
  SAMPLE_OMENS,
} from "@crafterix/engine";
import {
  saveToLocalStorage,
  loadFromLocalStorage,
  exportToFile,
  importFromFile,
  generateShareableUrl,
  getProjectFromUrl,
} from "./storage";
import {
  type ItemNode,
  type OutcomeOption,
  type CraftingContextValue,
  initialState,
} from "./types";
import { createReducer, generateId } from "./reducer";

// Re-export types for backwards compatibility
export type { Position, ItemNode, CraftEdge, OutcomeOption, OutcomeModalState, GraphState } from "./types";

// ============ Context ============

const CraftingContext = createContext<CraftingContextValue | null>(null);

export function CraftingProvider({ children }: { children: ReactNode }) {
  // Create reducer with context - omens list for conflict detection
  const reducer = useMemo(() => createReducer({ omens: SAMPLE_OMENS }), []);
  const [state, dispatch] = useReducer(reducer, initialState);
  const isInitialized = useRef(false);

  // Resolve selected omen IDs to Omen objects
  const selectedOmens = useMemo(
    () => state.selectedOmenIds
      .map((id) => SAMPLE_OMENS.find((o) => o.id === id))
      .filter((o): o is Omen => o !== undefined),
    [state.selectedOmenIds]
  );

  // Recreate actions when selected omens change
  const actions = useMemo(
    () => createAllActions(SAMPLE_CURRENCY, {
      modifiers: SAMPLE_MODIFIERS,
      corruptedImplicits: SAMPLE_CORRUPTED_IMPLICITS,
      omens: selectedOmens,
    }),
    [selectedOmens]
  );

  // Load state from URL param or localStorage on mount
  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;

    // URL param takes priority
    const urlState = getProjectFromUrl();
    if (urlState) {
      dispatch({ type: "LOAD_STATE", state: urlState });
      // Clear URL param after loading
      const url = new URL(window.location.href);
      url.searchParams.delete("project");
      window.history.replaceState({}, "", url.toString());
      return;
    }

    // Fall back to localStorage
    const savedState = loadFromLocalStorage();
    if (savedState) {
      dispatch({ type: "LOAD_STATE", state: savedState });
    }
  }, []);

  // Auto-save to localStorage when state changes
  useEffect(() => {
    // Only save if there's meaningful state
    if (state.base && state.items.length > 0) {
      saveToLocalStorage(state);
    }
  }, [state]);

  const getSelectedItem = (): ItemNode | null => {
    if (!state.selectedItemId) return null;
    return state.items.find((i) => i.id === state.selectedItemId) ?? null;
  };

  const canApplyCurrency = (currencyId: string): boolean => {
    const selectedItem = getSelectedItem();
    if (!selectedItem) return false;

    const action = actions.get(currencyId);
    if (!action) return false;

    const craftingState = new CraftingState(selectedItem.item);
    return action.canApply(craftingState);
  };

  const getDisabledReason = (currencyId: string): string | null => {
    const selectedItem = getSelectedItem();
    if (!selectedItem) return "No item selected";

    const currency = SAMPLE_CURRENCY.find((c) => c.id === currencyId);
    if (!currency) return "Unknown currency";

    const item = selectedItem.item;

    if (!currency.applicableToRarity.includes(item.rarity)) {
      const expected = currency.applicableToRarity.join(" or ");
      return `Requires ${expected} item (current: ${item.rarity})`;
    }

    if (item.corrupted) return "Item is corrupted";

    if (currency.effect === "add_affix") {
      const prefixFull = item.prefixes.length >= item.base.affixSlots.maxPrefixes;
      const suffixFull = item.suffixes.length >= item.base.affixSlots.maxSuffixes;
      if (prefixFull && suffixFull) return "Item has max affixes";
    }

    if (currency.effect === "remove_affix") {
      if (item.prefixes.length === 0 && item.suffixes.length === 0) {
        return "Item has no affixes to remove";
      }
    }

    return null;
  };

  const getModDisplayName = (modId: string): string => {
    const mod = SAMPLE_MODIFIERS.find((m) => m.id === modId);
    return mod?.displayName ?? modId;
  };

  const getCurrencyName = (currencyId: string): string => {
    const currency = SAMPLE_CURRENCY.find((c) => c.id === currencyId);
    return currency?.name ?? currencyId;
  };

  const getApplicableOmens = (currencyId: string): Omen[] => {
    return SAMPLE_OMENS.filter((o) => o.appliesTo.includes(currencyId));
  };

  const openOutcomeModal = (itemId: string) => {
    if (!state.selectedCurrencyId) return;

    const itemNode = state.items.find(n => n.id === itemId);
    if (!itemNode) return;

    const action = actions.get(state.selectedCurrencyId);
    if (!action) return;

    const craftingState = new CraftingState(itemNode.item);
    if (!action.canApply(craftingState)) return;

    const rawOutcomes = action.getOutcomes(craftingState);

    // Convert to OutcomeOptions with mod info
    const outcomes: OutcomeOption[] = rawOutcomes.map((o, idx) => {
      const newItem = o.state.item;
      const oldItem = itemNode.item;

      // Determine what mod was added or removed
      let modAdded: RolledModifier | null = null;
      let modRemoved: RolledModifier | null = null;

      // Find added prefix
      const newPrefixes = newItem.prefixes.filter(
        (p) => !oldItem.prefixes.some((op) => op.modifierId === p.modifierId)
      );
      if (newPrefixes.length > 0) modAdded = newPrefixes[0];

      // Find added suffix
      const newSuffixes = newItem.suffixes.filter(
        (s) => !oldItem.suffixes.some((os) => os.modifierId === s.modifierId)
      );
      if (newSuffixes.length > 0 && !modAdded) modAdded = newSuffixes[0];

      // Find removed prefix (for annulment)
      const removedPrefixes = oldItem.prefixes.filter(
        (p) => !newItem.prefixes.some((np) => np.modifierId === p.modifierId)
      );
      if (removedPrefixes.length > 0) modRemoved = removedPrefixes[0];

      // Find removed suffix
      const removedSuffixes = oldItem.suffixes.filter(
        (s) => !newItem.suffixes.some((ns) => ns.modifierId === s.modifierId)
      );
      if (removedSuffixes.length > 0 && !modRemoved) modRemoved = removedSuffixes[0];

      return {
        id: `outcome-${idx}-${generateId()}`,
        modAdded,
        modRemoved,
        probability: o.probability,
        resultingItem: newItem,
      };
    });

    // Create "Any" options for prefix and suffix adds
    const anyOptions: OutcomeOption[] = [];
    const oldItem = itemNode.item;

    // Group outcomes by whether they add a prefix or suffix
    const prefixOutcomes = outcomes.filter((o) => o.resultingItem.prefixes.length > oldItem.prefixes.length);
    const suffixOutcomes = outcomes.filter((o) => o.resultingItem.suffixes.length > oldItem.suffixes.length);

    if (prefixOutcomes.length > 0) {
      const totalPrefixProb = prefixOutcomes.reduce((sum, o) => sum + o.probability, 0);
      const placeholderMod: RolledModifier = { modifierId: ANY_PREFIX, tier: 0, values: [] };
      // Use rarity from actual outcomes (handles Transmutation normal→magic)
      const newRarity = prefixOutcomes[0].resultingItem.rarity;
      anyOptions.push({
        id: `any-prefix-${generateId()}`,
        modAdded: placeholderMod,
        modRemoved: null,
        probability: totalPrefixProb,
        resultingItem: {
          ...oldItem,
          rarity: newRarity,
          prefixes: [...oldItem.prefixes, placeholderMod],
        },
      });
    }

    if (suffixOutcomes.length > 0) {
      const totalSuffixProb = suffixOutcomes.reduce((sum, o) => sum + o.probability, 0);
      const placeholderMod: RolledModifier = { modifierId: ANY_SUFFIX, tier: 0, values: [] };
      // Use rarity from actual outcomes (handles Transmutation normal→magic)
      const newRarity = suffixOutcomes[0].resultingItem.rarity;
      anyOptions.push({
        id: `any-suffix-${generateId()}`,
        modAdded: placeholderMod,
        modRemoved: null,
        probability: totalSuffixProb,
        resultingItem: {
          ...oldItem,
          rarity: newRarity,
          suffixes: [...oldItem.suffixes, placeholderMod],
        },
      });
    }

    // Prepend "Any" options to the outcome list
    const allOutcomes = [...anyOptions, ...outcomes];

    dispatch({
      type: "OPEN_OUTCOME_MODAL",
      outcomes: allOutcomes,
      currencyId: state.selectedCurrencyId,
      sourceItemId: itemId,
    });
  };

  const exportProject = () => {
    exportToFile(state);
  };

  const importProjectFn = async (file: File): Promise<boolean> => {
    const loadedState = await importFromFile(file);
    if (loadedState) {
      dispatch({ type: "LOAD_STATE", state: loadedState });
      return true;
    }
    return false;
  };

  const getShareableUrl = () => {
    return generateShareableUrl(state);
  };

  const value: CraftingContextValue = {
    state,
    items: SAMPLE_ITEMS,
    currencies: SAMPLE_CURRENCY,
    modifiers: SAMPLE_MODIFIERS,
    omens: SAMPLE_OMENS,
    actions,
    selectBase: (base) => dispatch({ type: "SELECT_BASE", base }),
    selectCurrency: (currencyId) => dispatch({ type: "SELECT_CURRENCY", currencyId }),
    selectItem: (itemId) => dispatch({ type: "SELECT_ITEM", itemId }),
    toggleOmen: (omenId) => dispatch({ type: "TOGGLE_OMEN", omenId }),
    openOutcomeModal,
    closeOutcomeModal: () => dispatch({ type: "CLOSE_OUTCOME_MODAL" }),
    selectOutcome: (outcomeIndex) => dispatch({ type: "SELECT_OUTCOME", outcomeIndex }),
    updateNodePosition: (itemId, position) => dispatch({ type: "UPDATE_NODE_POSITION", itemId, position }),
    reset: () => dispatch({ type: "RESET" }),
    exportProject,
    importProject: importProjectFn,
    getShareableUrl,
    getSelectedItem,
    canApplyCurrency,
    getDisabledReason,
    getModDisplayName,
    getCurrencyName,
    getApplicableOmens,
  };

  return (
    <CraftingContext.Provider value={value}>{children}</CraftingContext.Provider>
  );
}

export function useCrafting() {
  const context = useContext(CraftingContext);
  if (!context) {
    throw new Error("useCrafting must be used within CraftingProvider");
  }
  return context;
}
