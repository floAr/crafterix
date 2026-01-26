import { useCrafting, type OutcomeOption } from "../state/crafting-context";
import { isPlaceholderMod } from "@crafterix/data";
import { formatModText } from "../utils/mod-display";

function formatProbability(prob: number): string {
  return (prob * 100).toFixed(1) + "%";
}

interface OutcomeRowProps {
  outcome: OutcomeOption;
  index: number;
  onSelect: () => void;
}

function OutcomeRow({ outcome, onSelect }: OutcomeRowProps) {
  const { modAdded, modRemoved, probability, resultingItem } = outcome;

  // Determine the change description
  let changeText: string;
  let changeColor: string;
  const isPlaceholder = modAdded && isPlaceholderMod(modAdded.modifierId);

  if (modAdded) {
    changeText = formatModText(modAdded.modifierId, modAdded.values);
    changeColor = isPlaceholder ? "text-purple-400 italic" : "text-green-400";
  } else if (modRemoved) {
    changeText = `Remove: ${formatModText(modRemoved.modifierId, modRemoved.values)}`;
    changeColor = "text-red-400";
  } else {
    changeText = "No change";
    changeColor = "text-poe-normal/50";
  }

  const totalAffixes = resultingItem.prefixes.length + resultingItem.suffixes.length;

  return (
    <button
      className={`w-full text-left px-4 py-3 hover:bg-poe-panel/60 transition-colors border-b border-poe-border/30 last:border-b-0 ${isPlaceholder ? "bg-purple-900/20" : ""}`}
      onClick={onSelect}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1 min-w-0">
          <div className={`font-medium ${changeColor}`}>
            {changeText}
            {modAdded && !isPlaceholder && (
              <span className="text-poe-normal/40 text-xs ml-1">(T{modAdded.tier})</span>
            )}
          </div>
          <div className="text-xs text-poe-normal/50 mt-1">
            Result: {resultingItem.rarity} with {totalAffixes} affix{totalAffixes !== 1 ? "es" : ""}
          </div>
        </div>
        <div className="flex-shrink-0 ml-4">
          <div className="text-lg font-bold text-poe-currency">
            {formatProbability(probability)}
          </div>
        </div>
      </div>
    </button>
  );
}

export function OutcomeModal() {
  const { state, closeOutcomeModal, selectOutcome, getCurrencyName } = useCrafting();

  if (!state.outcomeModal) return null;

  const { currencyId, outcomes } = state.outcomeModal;
  const currencyName = getCurrencyName(currencyId);

  return (
    <div
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
      onClick={closeOutcomeModal}
    >
      <div
        className="bg-poe-bg border-2 border-poe-border rounded-lg shadow-xl max-w-lg w-full mx-4 max-h-[80vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-poe-border bg-poe-panel/30 rounded-t-lg flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-poe-currency">{currencyName}</h2>
            <p className="text-sm text-poe-normal/60">Select an outcome</p>
          </div>
          <button
            className="text-poe-normal/50 hover:text-poe-normal text-2xl leading-none px-2"
            onClick={closeOutcomeModal}
          >
            &times;
          </button>
        </div>

        {/* Outcome list */}
        <div className="flex-1 overflow-y-auto">
          {outcomes.length === 0 ? (
            <div className="p-4 text-center text-poe-normal/50">
              No possible outcomes
            </div>
          ) : (
            outcomes.map((outcome, index) => (
              <OutcomeRow
                key={outcome.id}
                outcome={outcome}
                index={index}
                onSelect={() => selectOutcome(index)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-2 border-t border-poe-border bg-poe-panel/20 rounded-b-lg text-xs text-poe-normal/40 text-center">
          {outcomes.length} possible outcome{outcomes.length !== 1 ? "s" : ""}
        </div>
      </div>
    </div>
  );
}
