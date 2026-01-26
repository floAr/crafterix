import { useState } from "react";
import { useCrafting } from "../state/crafting-context";
import type { Currency, Omen } from "@crafterix/data";
import { CurrencyButton } from "./CurrencyButton";
import {
  CURRENCY_CATEGORIES,
  ESSENCE_CATEGORIES,
  ESSENCE_TYPES,
  ESSENCE_TYPE_LABELS,
  getEssenceId,
  type CurrencyCategory,
} from "../utils/currency-images";

const TAB_LABELS: Record<CurrencyCategory, string> = {
  simple: "Basic",
  advanced: "Advanced",
};

const ESSENCE_TIER_ORDER = ["lesser", "normal", "greater", "perfect"] as const;

type MainTab = CurrencyCategory | "essences";
type EssenceSubTab = "regular" | "corrupted";

export function CurrencySidebar() {
  const [mainTab, setMainTab] = useState<MainTab>("simple");
  const [essenceSubTab, setEssenceSubTab] = useState<EssenceSubTab>("regular");
  const [hoveredCurrency, setHoveredCurrency] = useState<string | null>(null);

  const {
    currencies,
    state,
    selectCurrency,
    toggleOmen,
    canApplyCurrency,
    getDisabledReason,
    getApplicableOmens,
  } = useCrafting();

  // Get applicable omens for the selected currency
  const applicableOmens = state.selectedCurrencyId
    ? getApplicableOmens(state.selectedCurrencyId)
    : [];

  const selectedCurrency = currencies.find((c) => c.id === state.selectedCurrencyId);

  // Get visible currencies based on current tab (for non-essence tabs)
  const visibleCurrencies = mainTab !== "essences"
    ? CURRENCY_CATEGORIES[mainTab]
        .map((id) => currencies.find((c) => c.id === id))
        .filter((c): c is Currency => c !== undefined)
    : [];

  // Helper to get currency by ID
  const getCurrency = (id: string) => currencies.find((c) => c.id === id);

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-poe-normal/70 uppercase tracking-wide">
        Currency
      </h3>

      {/* Main tab buttons */}
      <div className="flex gap-1 border-b border-poe-border/30 pb-1">
        {(Object.keys(TAB_LABELS) as CurrencyCategory[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setMainTab(tab)}
            className={`px-2 py-1 text-xs rounded-t transition-colors ${
              mainTab === tab
                ? "bg-poe-panel text-poe-currency border-b-2 border-poe-currency -mb-[3px]"
                : "text-poe-normal/60 hover:text-poe-normal/80"
            }`}
          >
            {TAB_LABELS[tab]}
          </button>
        ))}
        <button
          onClick={() => setMainTab("essences")}
          className={`px-2 py-1 text-xs rounded-t transition-colors ${
            mainTab === "essences"
              ? "bg-poe-panel text-poe-unique border-b-2 border-poe-unique -mb-[3px]"
              : "text-poe-normal/60 hover:text-poe-normal/80"
          }`}
        >
          Essences
        </button>
      </div>

      {/* Essence sub-tabs (Regular / Corrupted) */}
      {mainTab === "essences" && (
        <div className="flex gap-1">
          <button
            onClick={() => setEssenceSubTab("regular")}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              essenceSubTab === "regular"
                ? "bg-poe-unique/20 text-poe-unique border border-poe-unique/50"
                : "bg-poe-panel/50 text-poe-normal/50 border border-poe-border/30 hover:text-poe-normal/70"
            }`}
          >
            Regular
          </button>
          <button
            onClick={() => setEssenceSubTab("corrupted")}
            className={`px-2 py-0.5 text-xs rounded transition-colors ${
              essenceSubTab === "corrupted"
                ? "bg-red-900/40 text-red-400 border border-red-500/50"
                : "bg-poe-panel/50 text-poe-normal/50 border border-poe-border/30 hover:text-poe-normal/70"
            }`}
          >
            Corrupted
          </button>
        </div>
      )}

      {/* Currency grid (non-essence tabs) */}
      {mainTab !== "essences" && (
        <div className="grid gap-1.5 grid-cols-4">
          {visibleCurrencies.map((currency) => (
            <CurrencyButton
              key={currency.id}
              currency={currency}
              isSelected={state.selectedCurrencyId === currency.id}
              canApply={canApplyCurrency(currency.id)}
              disabledReason={getDisabledReason(currency.id)}
              isHovered={hoveredCurrency === currency.id}
              onHover={setHoveredCurrency}
              onSelect={() => {
                if (canApplyCurrency(currency.id)) {
                  selectCurrency(state.selectedCurrencyId === currency.id ? null : currency.id);
                }
              }}
            />
          ))}
        </div>
      )}

      {/* Essence rows (horizontal tier progression) */}
      {mainTab === "essences" && essenceSubTab === "regular" && (
        <div className="space-y-1">
          {/* Tier labels header */}
          <div className="flex items-center gap-1 text-[10px] text-poe-normal/40 pl-[72px]">
            <span className="w-8 text-center">L</span>
            <span className="w-8 text-center">N</span>
            <span className="w-8 text-center">G</span>
            <span className="w-8 text-center">P</span>
          </div>
          {ESSENCE_TYPES.map((essenceType) => (
            <div key={essenceType} className="flex items-center gap-1">
              <span className="w-[68px] text-[10px] text-poe-normal/60 truncate" title={ESSENCE_TYPE_LABELS[essenceType]}>
                {ESSENCE_TYPE_LABELS[essenceType]}
              </span>
              {ESSENCE_TIER_ORDER.map((tier) => {
                const id = getEssenceId(essenceType, tier);
                const currency = getCurrency(id);
                if (!currency) return <div key={tier} className="w-8 h-8" />;
                return (
                  <CurrencyButton
                    key={tier}
                    currency={currency}
                    isSelected={state.selectedCurrencyId === id}
                    canApply={canApplyCurrency(id)}
                    disabledReason={getDisabledReason(id)}
                    isHovered={hoveredCurrency === id}
                    onHover={setHoveredCurrency}
                    onSelect={() => {
                      if (canApplyCurrency(id)) {
                        selectCurrency(state.selectedCurrencyId === id ? null : id);
                      }
                    }}
                    compact
                  />
                );
              })}
            </div>
          ))}
        </div>
      )}

      {/* Corrupted essences grid */}
      {mainTab === "essences" && essenceSubTab === "corrupted" && (
        <div className="grid gap-1.5 grid-cols-5">
          {ESSENCE_CATEGORIES.corrupted.map((id) => {
            const currency = getCurrency(id);
            if (!currency) return null;
            return (
              <CurrencyButton
                key={id}
                currency={currency}
                isSelected={state.selectedCurrencyId === id}
                canApply={canApplyCurrency(id)}
                disabledReason={getDisabledReason(id)}
                isHovered={hoveredCurrency === id}
                onHover={setHoveredCurrency}
                onSelect={() => {
                  if (canApplyCurrency(id)) {
                    selectCurrency(state.selectedCurrencyId === id ? null : id);
                  }
                }}
              />
            );
          })}
        </div>
      )}

      {/* Selected currency info */}
      {selectedCurrency && (
        <div className="p-2 bg-poe-currency/10 border border-poe-currency/30 rounded">
          <div className="text-sm font-medium text-poe-currency mb-1">
            {selectedCurrency.name}
          </div>
          <div className="text-xs text-poe-normal/60">
            {selectedCurrency.description}
          </div>
        </div>
      )}

      {/* Omen toggles */}
      {applicableOmens.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-poe-unique/70 uppercase tracking-wide">
            Omens
          </h4>
          <div className="space-y-1">
            {applicableOmens.map((omen) => (
              <OmenToggle
                key={omen.id}
                omen={omen}
                isActive={state.selectedOmenIds.includes(omen.id)}
                onToggle={() => toggleOmen(omen.id)}
              />
            ))}
          </div>
        </div>
      )}

      {/* Click instruction */}
      {state.selectedCurrencyId && (
        <div className="p-2 bg-poe-panel border border-poe-border/50 rounded">
          <p className="text-xs text-poe-normal/70">
            Click on an item node to see crafting outcomes
          </p>
        </div>
      )}

      {!state.selectedItemId && state.base && (
        <div className="p-2 bg-poe-panel border border-poe-border/50 rounded">
          <p className="text-xs text-poe-normal/60">
            Select an item in the graph to craft
          </p>
        </div>
      )}
    </div>
  );
}

function OmenToggle({
  omen,
  isActive,
  onToggle,
}: {
  omen: Omen;
  isActive: boolean;
  onToggle: () => void;
}) {
  const shortName = omen.name.replace("Omen of ", "");

  return (
    <button
      onClick={onToggle}
      className={`
        w-full text-left px-2 py-1.5 rounded border text-xs transition-colors
        ${
          isActive
            ? "bg-poe-unique/20 border-poe-unique text-poe-unique"
            : "bg-poe-panel border-poe-border/50 text-poe-normal/70 hover:border-poe-unique/50"
        }
      `}
      title={omen.description}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3 h-3 rounded-sm border ${
            isActive
              ? "bg-poe-unique border-poe-unique"
              : "border-poe-normal/40"
          }`}
        />
        <span className="truncate">{shortName}</span>
      </div>
    </button>
  );
}
