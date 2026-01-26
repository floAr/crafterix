# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Crafterix is a Path of Exile 2 crafting simulator. Users build freeform graphs showing all possible crafting outcomes, with probability-weighted edges connecting item states.

## Commands

```bash
pnpm install          # Install dependencies
pnpm dev              # Run web dev server (packages/web)
pnpm build            # Build all packages
pnpm test             # Run all tests
```

## Architecture

```
packages/
├── data/        # Types (ItemBase, Modifier, Currency, CraftedItem)
├── engine/      # CraftingState, ModPool, currency actions
├── scraper/     # (stub) poe2db.tw scraper
└── web/         # React + Vite + TailwindCSS + React Flow
```

### Engine (`@crafterix/engine`)

- `CraftingState`: immutable item wrapper with `withPrefix()`, `withSuffix()`, `withoutAffix()`
- `ModPool.getAvailableMods(state, type)`: returns weighted mods filtered by tags/groups/ilvl
- Actions implement `CraftingAction`: `canApply()`, `getOutcomes()`, `apply()`
- `getOutcomes()` returns all possible results with probabilities (grouped by mod, summed across tiers)

### Web (`@crafterix/web`)

- State in `crafting-context.tsx`: GraphState with items[], edges[], outcomeModal
- React Flow for freeform graph: `CraftItemNode`, `ProbabilityEdge` custom components
- Flow: select base → select currency → click item → OutcomeModal → select outcome → new node+edge

## Crafting Rules (PoE2)

- Normal: 0 affixes | Magic: max 1 prefix + 1 suffix | Rare: max 3P + 3S
- **No Orb of Scouring** - cannot downgrade rarity
- Same mod group = mutually exclusive (can't roll two life mods)
- AugmentationOrb on magic: only adds the missing affix type

## Code Patterns

- Immutable state: `CraftingState` returns new instances, never mutates
- Probabilities: outcomes grouped by mod ID, probability summed across tiers
- React Flow nodes: pass data via `data` prop, use `Handle` for connections
- Mod display: `formatModText(modifierId, values)` replaces `#` with values

## Current State

Full crafting simulator with:
- 10 currencies: Transmutation, Augmentation, Regal, Exalted, Annulment, Chaos, Divine, Vaal, + 2 Perfect Essences
- Omen system: 5 omens with multi-select + exclusivity groups (omens affect outcome calculations)
- Corrupted implicits: Vaal Orb can add corrupted mods
- Persistence: localStorage auto-save, file export/import, URL sharing
- Freeform graph with draggable nodes, outcome modal, edge probability details

See `docs/plan.md` for next steps and roadmap.

## Omen System

- `Omen.exclusiveGroup`: omens in same group auto-deselect each other
- `ActionContext.omens: Omen[]`: supports multiple active omens
- `BaseCurrencyAction` helpers: `getForcedModType()`, `guaranteesHighestTier()`, `hasOmenEffect()`
- Context: `selectedOmenIds` state, `TOGGLE_OMEN` reducer handles conflicts
- Actions recreate via useMemo when omens change

## Plan Mode

- Keep plans extremely concise - sacrifice grammar for brevity
- List unresolved questions at the end
- Focus on what changes, not explanations of existing code


## ideas
- we should have a tier selection. so I transmute an item, select that i want flat life and then the connector shows the probability to get any tier life roll. I can click it and specify a tier range that I am happy with, and it adjusts the probability.
- it should show the total probability of crafting a final item (and in conjunction how many tries i need)
- with the point above i do wnat the ability to set an item node as "starting base" and then see the overall probability for the selected item, starting from that note.
- maybe acceptable tier ranges is something that is configurable in settings