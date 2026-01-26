import { createContext, useContext, type ReactNode } from "react";
import type {
  ItemBase,
  Modifier,
  Currency,
  Omen,
  CorruptedImplicit,
} from "@crafterix/data";

/**
 * GameData contains all reference data needed by the crafting system.
 * This allows swapping data sources (e.g., real scraped data vs test fixtures).
 */
export interface GameData {
  items: ItemBase[];
  modifiers: Modifier[];
  currencies: Currency[];
  omens: Omen[];
  corruptedImplicits: CorruptedImplicit[];
}

const DataContext = createContext<GameData | null>(null);

interface DataProviderProps {
  data: GameData;
  children: ReactNode;
}

export function DataProvider({ data, children }: DataProviderProps) {
  return <DataContext.Provider value={data}>{children}</DataContext.Provider>;
}

export function useGameData(): GameData {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useGameData must be used within DataProvider");
  }
  return context;
}
