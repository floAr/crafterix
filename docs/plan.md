# Crafterix Development Plan

## Current Status: Omen System Complete

### Completed (2026-01-16)

**Omen Wiring - Full Integration:**
- [x] `exclusiveGroup` field on Omen type for mutual exclusivity
- [x] Sample omens updated: `exalt_direction`, `regal_direction` groups
- [x] ActionContext supports `omens: Omen[]` (multi-omen)
- [x] BaseCurrencyAction: `getForcedModType()`, `guaranteesHighestTier()`, `hasOmenEffect()` helpers
- [x] ExaltedOrb/RegalOrb use base class omen methods
- [x] Context tracks `selectedOmenIds: string[]`
- [x] TOGGLE_OMEN reducer with automatic conflict resolution
- [x] Actions recreate when omens change (omens now affect outcome calculations)
- [x] UI multi-select with exclusivity enforcement

### Completed (2026-01-15)

**Engine - New Currencies:**
- [x] Chaos Orb: removes 1 random affix + adds 1 new affix (PoE2 behavior)
- [x] Divine Orb: rerolls numeric values within tier ranges
- [x] Vaal Orb: 4-way outcome branching (no change, reroll, corrupted implicit, socket)
- [x] Perfect Essences: remove random mod + add guaranteed mod (Battle, Haste)

**Engine - Omen System:**
- [x] Omen type with force_mod_type effect
- [x] 4 omens: Sinistral/Dextral Exaltation, Sinistral/Dextral Crystallisation
- [x] Exalted/Regal orbs respect omen prefix/suffix forcing
- [x] createAction supports omen parameter

**Engine - Corrupted Implicits:**
- [x] CorruptedImplicit and RolledCorruptedImplicit types
- [x] CraftedItem extended with corruptedImplicit field
- [x] 8 sample corrupted implicits for body armour
- [x] Vaal Orb adds corrupted implicits on corruption

**Web - Persistence:**
- [x] localStorage auto-save/restore on state changes
- [x] Export project to JSON file
- [x] Import project from JSON file
- [x] URL sharing with base64 encoded state

**Web - UI:**
- [x] Condensed 4-column currency grid with icon abbreviations
- [x] Omen toggle section (appears when applicable currency selected)
- [x] Selected currency info panel

**Data:**
- [x] Expanded sample mods: 8 regular + 2 essence-only
- [x] 12 currencies total (including 2 essences)
- [x] 5 omens
- [x] poe2db scraping guide in docs/

### Completed (2026-01-16) - Data Integration

**Scraped Data:**
- [x] 204 modifiers scraped from poe2db (all item types)
- [x] 19 crafting orbs (including Greater/Perfect variants)
- [x] 81 essences (19 types × 4 tiers + 5 corrupted)
- [x] 10 crafting omens with new effect types
- [x] Currency images for all orbs, essences, omens

**UI Updates:**
- [x] Mod display names from scraped data (displayName field)
- [x] Currency sidebar with images and tooltips
- [x] Essence tab with tier sub-tabs (Lesser/Normal/Greater/Perfect/Corrupted)
- [x] Centralized mod formatting utility

### Completed (2026-01-14)

**Engine:**
- [x] Core types: ItemBase, Modifier, Currency, CraftedItem
- [x] CraftingState immutable wrapper
- [x] ModPool with weighted selection, tag filtering, group exclusion
- [x] Currency actions: Transmutation, Augmentation, Regal, Exalted, Annulment
- [x] AugmentationOrb fix: only offers opposite affix type for magic items

**Web UI:**
- [x] React + Vite + TailwindCSS setup
- [x] PoE-style color scheme (normal/magic/rare/currency)
- [x] BasePicker, CurrencySidebar components
- [x] React Flow freeform graph with draggable nodes
- [x] CraftItemNode: shows affixes inline (prefixes blue, suffixes amber)
- [x] ProbabilityEdge: clickable labels with mod/currency details popup
- [x] OutcomeModal: lists all outcomes when applying currency
- [x] ItemTooltip: full item preview in right sidebar
- [x] Simplified GraphState: items[], edges[], outcomeModal

**Data:**
- [x] Sample data for MVP (body armour base)

---

## Next Steps

### Priority 1: Tier Selection & Probability Display
- [ ] Tier range selection on edges (click edge → select acceptable tier range)
- [ ] Adjust probability display based on selected tier range
- [ ] "Starting base" node designation
- [ ] Total probability calculation from starting base to selected item
- [ ] Expected attempts display (1/probability)
- [ ] Settings: configurable default acceptable tier ranges

### Priority 2: More Currency Support
- [ ] Orb of Chance (normal → random rarity)
- [ ] Orb of Alteration (reroll magic)
- [ ] Rune system (socket crafting)
- [ ] Essence crafting actions (upgrade_magic_to_rare_guaranteed effect)

### Priority 3: UX Improvements
- [x] Wire omen selection to outcome calculations
- [ ] Undo/redo support
- [ ] Export tree as image
- [ ] Keyboard shortcuts (1-5 for currencies, Enter to apply)
- [ ] Better auto-layout for new nodes (avoid overlaps)
- [ ] Zoom to fit button

### Priority 4: Tree Search Algorithm
- [ ] Goal-based search: "find path to item with +Life and +FireRes"
- [ ] Cost estimation (currency counts)
- [ ] Probability-weighted pathfinding
- [ ] Display optimal path highlighting

### Priority 5: Advanced Features
- [ ] More omens (protect prefix/suffix, etc.)
- [ ] Fractured/synthesized items
- [ ] Influence types
- [ ] Multi-item category support (weapons, jewellery, etc.)
- [ ] Mod weighting visualization (show spawn chances)

---

## Architecture Notes

```
User Flow:
1. Select base → root node created
2. Select currency → sidebar highlights applicable
3. Click item → OutcomeModal shows all possibilities
4. Click outcome → new node + edge created
5. Repeat to build crafting tree
6. Click edges to see probability/mod details
```

```
State Model:
GraphState {
  base: ItemBase | null
  items: ItemNode[]           // {id, item, position}
  edges: CraftEdge[]          // {id, source, target, currency, probability, mod}
  selectedItemId
  selectedCurrencyId
  selectedOmenIds: string[]   // multi-select, exclusivity handled by reducer
  outcomeModal: {sourceItemId, currencyId, outcomes[]} | null
}
```

---

## Known Issues / Tech Debt

- Edge details popup doesn't close on outside click
- No loading/error states for future async operations
- URL sharing uses base64 without compression (large trees may hit URL limits)
- No test files yet (vitest configured but no tests written)
