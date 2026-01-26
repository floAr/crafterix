import { CraftingProvider, useCrafting } from "./state/crafting-context";
import { BasePicker } from "./components/BasePicker";
import { CurrencySidebar } from "./components/CurrencySidebar";
import { CraftGraph } from "./components/CraftGraph";
import { ItemTooltip } from "./components/ItemTooltip";
import { OutcomeModal } from "./components/OutcomeModal";

function CraftingWorkspace() {
  const { getSelectedItem } = useCrafting();
  const selectedItem = getSelectedItem();

  return (
    <>
      <div className="flex gap-4 h-[calc(100vh-120px)]">
        {/* Left Sidebar */}
        <aside className="w-64 flex-shrink-0 space-y-6 overflow-y-auto">
          <BasePicker />
          <CurrencySidebar />
        </aside>

        {/* Main Graph Area */}
        <main className="flex-1 min-w-0">
          <CraftGraph />
        </main>

        {/* Right Sidebar - Item Preview */}
        <aside className="w-80 flex-shrink-0">
          <h3 className="text-sm font-semibold text-poe-normal/70 uppercase tracking-wide mb-2">
            Selected Item
          </h3>
          {selectedItem ? (
            <ItemTooltip item={selectedItem.item} />
          ) : (
            <div className="border border-poe-border rounded p-4 text-poe-normal/50 text-sm">
              Select an item to see details
            </div>
          )}
        </aside>
      </div>

      {/* Outcome Modal */}
      <OutcomeModal />
    </>
  );
}

export function App() {
  return (
    <CraftingProvider>
      <div className="min-h-screen p-6 bg-poe-bg">
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-poe-rare">Crafterix</h1>
          <p className="text-sm text-poe-normal/60">
            Path of Exile 2 Crafting Simulator
          </p>
        </header>

        <CraftingWorkspace />
      </div>
    </CraftingProvider>
  );
}
