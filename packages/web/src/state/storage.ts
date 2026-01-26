import type { ItemBase } from "@crafterix/data";
import type { GraphState, ItemNode, CraftEdge } from "./types";

const STORAGE_KEY = "crafterix_project";

/**
 * Serializable version of GraphState for storage.
 * Stores base by ID instead of full object.
 */
export interface SerializedGraphState {
  version: 1;
  baseId: string | null;
  items: ItemNode[];
  edges: CraftEdge[];
}

export function serializeState(state: GraphState): SerializedGraphState {
  return {
    version: 1,
    baseId: state.base?.id ?? null,
    items: state.items,
    edges: state.edges,
  };
}

export function deserializeState(
  data: SerializedGraphState,
  availableItems: ItemBase[]
): Partial<GraphState> | null {
  if (data.version !== 1) return null;

  const base = data.baseId ? availableItems.find((i) => i.id === data.baseId) : null;

  // Restore base reference in items
  const restoredItems = data.items.map((item) => ({
    ...item,
    item: {
      ...item.item,
      base: base ?? item.item.base,
    },
  }));

  return {
    base: base ?? null,
    items: restoredItems,
    edges: data.edges,
    selectedItemId: restoredItems.length > 0 ? restoredItems[0].id : null,
    selectedCurrencyId: null,
    outcomeModal: null,
  };
}

export function saveToLocalStorage(state: GraphState): void {
  try {
    const serialized = serializeState(state);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(serialized));
  } catch (e) {
    console.error("Failed to save to localStorage:", e);
  }
}

export function loadFromLocalStorage(items: ItemBase[]): Partial<GraphState> | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as SerializedGraphState;
    return deserializeState(data, items);
  } catch (e) {
    console.error("Failed to load from localStorage:", e);
    return null;
  }
}

export function clearLocalStorage(): void {
  localStorage.removeItem(STORAGE_KEY);
}

/**
 * Export state to downloadable JSON file.
 */
export function exportToFile(state: GraphState, filename = "crafterix-project.json"): void {
  const serialized = serializeState(state);
  const blob = new Blob([JSON.stringify(serialized, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

/**
 * Import state from uploaded JSON file.
 */
export function importFromFile(
  file: File,
  items: ItemBase[]
): Promise<Partial<GraphState> | null> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string) as SerializedGraphState;
        resolve(deserializeState(data, items));
      } catch {
        resolve(null);
      }
    };
    reader.onerror = () => resolve(null);
    reader.readAsText(file);
  });
}

/**
 * Compress state for URL sharing using lz-string.
 * Note: lz-string needs to be installed separately.
 */
export function stateToUrlParam(state: GraphState): string {
  const serialized = serializeState(state);
  const json = JSON.stringify(serialized);
  // For now, use base64. In production, use lz-string for compression.
  return btoa(encodeURIComponent(json));
}

export function urlParamToState(
  param: string,
  items: ItemBase[]
): Partial<GraphState> | null {
  try {
    const json = decodeURIComponent(atob(param));
    const data = JSON.parse(json) as SerializedGraphState;
    return deserializeState(data, items);
  } catch {
    return null;
  }
}

export function generateShareableUrl(state: GraphState): string {
  const param = stateToUrlParam(state);
  const url = new URL(window.location.href);
  url.searchParams.set("project", param);
  return url.toString();
}

export function getProjectFromUrl(items: ItemBase[]): Partial<GraphState> | null {
  const url = new URL(window.location.href);
  const param = url.searchParams.get("project");
  if (!param) return null;
  return urlParamToState(param, items);
}
