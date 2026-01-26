import {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useRef,
  type ReactNode,
  useMemo,
} from "react";
import type { Omen } from "@crafterix/data";
import {
  createAllActions,
  buildOutcomeOptions,
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
import {
  canApplyCurrency as canApplyCurrencyHelper,
  getDisabledReason as getDisabledReasonHelper,
  getModDisplayName as getModDisplayNameHelper,
  getCurrencyName as getCurrencyNameHelper,
  getApplicableOmens as getApplicableOmensHelper,
} from "./helpers";

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
    return canApplyCurrencyHelper(selectedItem.item, currencyId, actions);
  };

  const getDisabledReason = (currencyId: string): string | null => {
    const selectedItem = getSelectedItem();
    return getDisabledReasonHelper(selectedItem?.item ?? null, currencyId, SAMPLE_CURRENCY);
  };

  const getModDisplayName = (modId: string): string => {
    return getModDisplayNameHelper(modId, SAMPLE_MODIFIERS);
  };

  const getCurrencyName = (currencyId: string): string => {
    return getCurrencyNameHelper(currencyId, SAMPLE_CURRENCY);
  };

  const getApplicableOmens = (currencyId: string): Omen[] => {
    return getApplicableOmensHelper(currencyId, SAMPLE_OMENS);
  };

  const openOutcomeModal = (itemId: string) => {
    if (!state.selectedCurrencyId) return;

    const itemNode = state.items.find(n => n.id === itemId);
    if (!itemNode) return;

    const action = actions.get(state.selectedCurrencyId);
    if (!action) return;

    // Use engine's outcome builder for all calculation logic
    const engineOutcomes = buildOutcomeOptions(action, itemNode.item);
    if (engineOutcomes.length === 0) return;

    // Add unique IDs for UI tracking
    const outcomes: OutcomeOption[] = engineOutcomes.map((o, idx) => ({
      ...o,
      id: `outcome-${idx}-${generateId()}`,
    }));

    dispatch({
      type: "OPEN_OUTCOME_MODAL",
      outcomes,
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
