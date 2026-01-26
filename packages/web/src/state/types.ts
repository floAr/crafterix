import type { ItemBase, CraftedItem, RolledModifier, Currency, Modifier, Omen } from "@crafterix/data";
import type { CraftingAction } from "@crafterix/engine";

// ============ Position ============

export interface Position {
  x: number;
  y: number;
}

// ============ Graph Nodes & Edges ============

export interface ItemNode {
  id: string;
  item: CraftedItem;
  position: Position;
}

export interface CraftEdge {
  id: string;
  sourceId: string;
  targetId: string;
  currencyId: string;
  probability: number;
  modAdded: RolledModifier | null;
  modRemoved: RolledModifier | null;
}

// ============ Outcome Modal ============

export interface OutcomeOption {
  id: string;
  modAdded: RolledModifier | null;
  modRemoved: RolledModifier | null;
  probability: number;
  resultingItem: CraftedItem;
}

export interface OutcomeModalState {
  sourceItemId: string;
  currencyId: string;
  outcomes: OutcomeOption[];
}

// ============ Graph State ============

export interface GraphState {
  base: ItemBase | null;
  items: ItemNode[];
  edges: CraftEdge[];
  selectedItemId: string | null;
  selectedCurrencyId: string | null;
  selectedOmenIds: string[];
  outcomeModal: OutcomeModalState | null;
}

export const initialState: GraphState = {
  base: null,
  items: [],
  edges: [],
  selectedItemId: null,
  selectedCurrencyId: null,
  selectedOmenIds: [],
  outcomeModal: null,
};

// ============ Actions ============

export type GraphAction =
  | { type: "SELECT_BASE"; base: ItemBase }
  | { type: "SELECT_CURRENCY"; currencyId: string | null }
  | { type: "SELECT_ITEM"; itemId: string }
  | { type: "TOGGLE_OMEN"; omenId: string }
  | { type: "OPEN_OUTCOME_MODAL"; outcomes: OutcomeOption[]; currencyId: string; sourceItemId: string }
  | { type: "CLOSE_OUTCOME_MODAL" }
  | { type: "SELECT_OUTCOME"; outcomeIndex: number }
  | { type: "UPDATE_NODE_POSITION"; itemId: string; position: Position }
  | { type: "RESET" }
  | { type: "LOAD_STATE"; state: Partial<GraphState> };

// ============ Context Value ============

export interface CraftingContextValue {
  state: GraphState;
  items: ItemBase[];
  currencies: Currency[];
  modifiers: Modifier[];
  omens: Omen[];
  actions: Map<string, CraftingAction>;

  selectBase: (base: ItemBase) => void;
  selectCurrency: (currencyId: string | null) => void;
  selectItem: (itemId: string) => void;
  toggleOmen: (omenId: string) => void;
  openOutcomeModal: (itemId: string) => void;
  closeOutcomeModal: () => void;
  selectOutcome: (outcomeIndex: number) => void;
  updateNodePosition: (itemId: string, position: Position) => void;
  reset: () => void;

  // Persistence
  exportProject: () => void;
  importProject: (file: File) => Promise<boolean>;
  getShareableUrl: () => string;

  getSelectedItem: () => ItemNode | null;
  canApplyCurrency: (currencyId: string) => boolean;
  getDisabledReason: (currencyId: string) => string | null;
  getModDisplayName: (modId: string) => string;
  getCurrencyName: (currencyId: string) => string;
  getApplicableOmens: (currencyId: string) => Omen[];
}
