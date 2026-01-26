import type { Omen } from "@crafterix/data";
import { CraftingState } from "@crafterix/engine";
import {
  type Position,
  type ItemNode,
  type CraftEdge,
  type GraphState,
  type GraphAction,
  initialState,
} from "./types";

// ============ Helpers ============

export function generateId(): string {
  return Math.random().toString(36).substring(2, 10);
}

/**
 * Get omens that conflict with the given omen (same exclusiveGroup).
 * Omens in the same exclusive group cannot be active simultaneously.
 */
export function getConflictingOmenIds(omenId: string, omens: Omen[]): string[] {
  const omen = omens.find((o) => o.id === omenId);
  if (!omen?.exclusiveGroup) return [];
  return omens
    .filter((o) => o.id !== omenId && o.exclusiveGroup === omen.exclusiveGroup)
    .map((o) => o.id);
}

/**
 * Calculate position for new node based on source node.
 * Offsets vertically if there are existing nodes at similar X coordinates.
 */
export function getNewNodePosition(sourceNode: ItemNode, existingNodes: ItemNode[]): Position {
  const baseX = sourceNode.position.x + 300;
  const baseY = sourceNode.position.y;

  // Check for existing nodes at similar positions and offset if needed
  const nodesAtSimilarX = existingNodes.filter(
    n => Math.abs(n.position.x - baseX) < 50
  );

  const yOffset = nodesAtSimilarX.length * 150;

  return { x: baseX, y: baseY + yOffset };
}

// ============ Reducer ============

export interface ReducerContext {
  omens: Omen[];
}

export function createReducer(context: ReducerContext) {
  return function reducer(state: GraphState, action: GraphAction): GraphState {
    switch (action.type) {
      case "SELECT_BASE": {
        const rootItem: ItemNode = {
          id: generateId(),
          item: CraftingState.fromBase(action.base).item,
          position: { x: 50, y: 200 },
        };
        return {
          ...initialState,
          base: action.base,
          items: [rootItem],
          selectedItemId: rootItem.id,
        };
      }

      case "SELECT_CURRENCY":
        return { ...state, selectedCurrencyId: action.currencyId, selectedOmenIds: [] };

      case "TOGGLE_OMEN": {
        const isCurrentlySelected = state.selectedOmenIds.includes(action.omenId);
        if (isCurrentlySelected) {
          // Remove it
          return {
            ...state,
            selectedOmenIds: state.selectedOmenIds.filter((id) => id !== action.omenId),
          };
        } else {
          // Add it, removing any conflicting omens
          const conflicts = getConflictingOmenIds(action.omenId, context.omens);
          const filtered = state.selectedOmenIds.filter((id) => !conflicts.includes(id));
          return {
            ...state,
            selectedOmenIds: [...filtered, action.omenId],
          };
        }
      }

      case "SELECT_ITEM":
        return { ...state, selectedItemId: action.itemId };

      case "OPEN_OUTCOME_MODAL": {
        return {
          ...state,
          outcomeModal: {
            sourceItemId: action.sourceItemId,
            currencyId: action.currencyId,
            outcomes: action.outcomes,
          },
        };
      }

      case "CLOSE_OUTCOME_MODAL":
        return { ...state, outcomeModal: null };

      case "SELECT_OUTCOME": {
        if (!state.outcomeModal) return state;

        const { sourceItemId, currencyId, outcomes } = state.outcomeModal;
        const outcome = outcomes[action.outcomeIndex];
        if (!outcome) return state;

        const sourceNode = state.items.find(n => n.id === sourceItemId);
        if (!sourceNode) return state;

        // Create new item node
        const newNode: ItemNode = {
          id: generateId(),
          item: outcome.resultingItem,
          position: getNewNodePosition(sourceNode, state.items),
        };

        // Create edge connecting source to new node
        const newEdge: CraftEdge = {
          id: generateId(),
          sourceId: sourceItemId,
          targetId: newNode.id,
          currencyId,
          probability: outcome.probability,
          modAdded: outcome.modAdded,
          modRemoved: outcome.modRemoved,
        };

        return {
          ...state,
          items: [...state.items, newNode],
          edges: [...state.edges, newEdge],
          selectedItemId: newNode.id,
          selectedCurrencyId: null,
          outcomeModal: null,
        };
      }

      case "UPDATE_NODE_POSITION": {
        const updatedItems = state.items.map(item =>
          item.id === action.itemId
            ? { ...item, position: action.position }
            : item
        );
        return { ...state, items: updatedItems };
      }

      case "RESET":
        return initialState;

      case "LOAD_STATE":
        return { ...initialState, ...action.state };

      default:
        return state;
    }
  };
}
