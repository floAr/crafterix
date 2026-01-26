# Crafterix Refactoring Tasks

## Overview

This document contains atomic refactoring tasks for improving stability, simplicity, and maintainability. Each task is self-contained and can be tackled independently.

---

## Task 1: Extract Mod Grouping Utility

**Priority**: High | **Effort**: Low | **Risk**: Low

### Context Files
- `packages/engine/src/weighted-random.ts`
- `packages/engine/src/actions/base-action.ts` (lines 93-125)
- `packages/engine/src/actions/augmentation.ts` (lines 38-52)
- `packages/engine/src/actions/chaos.ts` (lines 70-83)
- `packages/engine/src/actions/vaal.ts` (lines 148-158)

### Problem
The pattern of grouping mods by ID and summing probabilities is duplicated 4+ times across action files. Each implementation is slightly different but does the same thing.

### Desired Outcome
A single `groupByModifierId()` function in `weighted-random.ts` that:
- Takes a probability map of `ModTierSelection`
- Returns grouped results with summed probabilities
- Keeps highest tier (lowest tier number) for display
- All actions use this shared utility

### Gotchas
- `base-action.ts` already has `getGroupedOutcomes()` which uses this pattern internally - consider whether to keep it as a convenience wrapper
- The "keep highest tier" logic (lower tier number = better) is PoE-specific domain knowledge - document it
- `vaal.ts` and `chaos.ts` build the map manually before grouping - the utility should accept either raw weighted items or pre-calculated probabilities

---

## Task 2: Add Lookup Maps to ModPool

**Priority**: High | **Effort**: Low | **Risk**: Low

### Context Files
- `packages/engine/src/mod-pool.ts`

### Problem
`ModPool.getModifierById()` uses `array.find()` which is O(n). Called frequently during outcome calculations. `getAvailableMods()` also does linear searches for existing groups.

### Desired Outcome
```typescript
class ModPool {
  private readonly modifierById: Map<string, Modifier>;
  private readonly modifiersByGroup: Map<string, Modifier[]>;

  constructor(modifiers: Modifier[]) {
    this.modifiers = modifiers;
    this.modifierById = new Map(modifiers.map(m => [m.id, m]));
    // Build group index...
  }
}
```
- O(1) lookups for `getModifierById()`
- Faster group conflict checking in `getAvailableMods()`

### Gotchas
- `ModPool` is instantiated per-action via `BaseCurrencyAction` constructor - ensure maps are built once, not on every method call
- The group lookup in `getAvailableMods()` iterates prefixes/suffixes and looks up each mod - this should also use the map

---

## Task 3: Fix Private Member Access in Essence Actions

**Priority**: High | **Effort**: Low | **Risk**: Low

### Context Files
- `packages/engine/src/actions/essence.ts` (lines 52-54, 117-119)
- `packages/engine/src/mod-pool.ts`
- `packages/engine/src/crafting-state.ts` (lines 58-64)

### Problem
Essence actions access `this.modPool["modifiers"]` using string indexing to bypass TypeScript's private access. This is used to check if an item already has a mod from the same group.

### Desired Outcome
Add public method to `ModPool`:
```typescript
hasGroupConflict(state: CraftingState, group: string): boolean
```
Or expose a read-only modifier group map. Remove all `["modifiers"]` string access patterns.

### Gotchas
- `CraftingState.hasModifierGroup()` currently requires passing a map from outside - consider deprecating it in favor of `ModPool.hasGroupConflict()`
- This check is needed by both `UpgradingEssence` and `PerfectEssence` - ensure both are updated
- The signature `hasModifierGroup(group, modifiers)` in CraftingState is awkward - if keeping it, at least make ModPool provide the map via a clean method

---

## Task 4: Remove Debug Logging

**Priority**: High | **Effort**: Trivial | **Risk**: None

### Context Files
- `packages/web/src/utils/mod-display.ts` (line 7)

### Problem
Production console.log statement:
```typescript
console.log("[mod-display] modifierMap size:", modifierMap.size, ...);
```

### Desired Outcome
Remove the line entirely. If debug logging is needed, gate behind `import.meta.env.DEV` or remove.

### Gotchas
- Check for other `console.log` statements across the codebase: `grep -r "console\." packages/`
- The warn on line 39 (`console.warn("[mod-display] Unknown mod ID:")`) may be intentional for catching data issues - consider keeping it or converting to proper error handling

---

## Task 5: Remove Unused Parameter in ChaosOrb

**Priority**: Low | **Effort**: Trivial | **Risk**: None

### Context Files
- `packages/engine/src/actions/chaos.ts` (line 54)

### Problem
```typescript
private getAddOutcomesAfterRemoval(
  stateAfterRemoval: CraftingState,
  removalProb: number,
  _removedModId: string  // ← unused
)
```

### Desired Outcome
Remove `_removedModId` parameter from method signature and call sites.

### Gotchas
- Verify it's not used anywhere - the underscore prefix suggests intentional unused marker
- If there was a plan to use it (e.g., for tracking what was removed), add a TODO comment instead

---

## Task 6: Split CraftingContext Types

**Priority**: Medium | **Effort**: Low | **Risk**: Low

### Context Files
- `packages/web/src/state/crafting-context.tsx` (lines 1-100)

### Problem
Type definitions, interfaces, and initial state are mixed with the provider implementation in a 563-line file.

### Desired Outcome
Create `packages/web/src/state/types.ts` containing:
- `Position`, `ItemNode`, `CraftEdge`, `OutcomeOption`, `OutcomeModalState`, `GraphState`
- `GraphAction` union type
- `initialState` constant
- `CraftingContextValue` interface

Update `crafting-context.tsx` to import from `./types`.

### Gotchas
- `CraftEdge` and `ItemNode` are also used by `storage.ts` - ensure imports still work
- The `GraphAction` type is only used internally by the reducer - could stay in context file, but cleaner to extract
- Don't move the `CraftingContext` creation or `useCrafting` hook - those should stay in the provider file

---

## Task 7: Extract Reducer to Separate File

**Priority**: Medium | **Effort**: Low | **Risk**: Low

### Context Files
- `packages/web/src/state/crafting-context.tsx` (lines 102-245)

### Problem
The reducer function (140 lines) is embedded in the context file, making it harder to test and reason about.

### Desired Outcome
Create `packages/web/src/state/reducer.ts`:
- Export `reducer` function
- Export helper functions: `generateId()`, `getConflictingOmenIds()`, `getNewNodePosition()`

### Gotchas
- `getConflictingOmenIds()` references `SAMPLE_OMENS` directly - consider passing omens as parameter or keeping the reference (it's sample data anyway)
- The reducer is pure and doesn't depend on React - good candidate for unit testing after extraction
- `generateId()` uses `Math.random()` - not ideal for testing, but acceptable for now

---

## Task 8: Extract Context Helper Functions

**Priority**: Medium | **Effort**: Medium | **Risk**: Low

### Context Files
- `packages/web/src/state/crafting-context.tsx` (lines 335-395)

### Problem
Helper functions like `canApplyCurrency`, `getDisabledReason`, `getModDisplayName`, `getCurrencyName`, `getApplicableOmens` are defined inside the provider component, recreated on every render.

### Desired Outcome
Create `packages/web/src/state/helpers.ts`:
- Pure functions that take explicit parameters instead of closing over context
- Example: `canApplyCurrency(item: CraftedItem, currencyId: string, actions: Map<string, CraftingAction>): boolean`

### Gotchas
- These functions currently rely on `getSelectedItem()` which accesses state - need to pass item explicitly
- `getDisabledReason` accesses `SAMPLE_CURRENCY` directly - consider passing currency list as parameter
- After extraction, wrap with `useCallback` in context if needed for memoization

---

## Task 9: Move Outcome Calculation to Engine

**Priority**: Medium | **Effort**: Medium | **Risk**: Medium

### Context Files
- `packages/web/src/state/crafting-context.tsx` (lines 396-505, `openOutcomeModal` function)
- `packages/data/src/types/modifier.ts` (`ANY_PREFIX`, `ANY_SUFFIX`)

### Problem
The `openOutcomeModal` function contains ~100 lines of business logic:
- Calls action's `getOutcomes()`
- Compares old/new items to determine what mod was added/removed
- Creates "Any Prefix" / "Any Suffix" placeholder options
- Calculates aggregated probabilities

This is engine-level logic in the UI layer.

### Desired Outcome
Create `packages/engine/src/outcome-builder.ts`:
```typescript
export interface OutcomeOption {
  modAdded: RolledModifier | null;
  modRemoved: RolledModifier | null;
  probability: number;
  resultingItem: CraftedItem;
}

export function buildOutcomeOptions(
  action: CraftingAction,
  currentItem: CraftedItem
): OutcomeOption[];
```

### Gotchas
- The "Any Prefix/Suffix" logic creates placeholder mods using `ANY_PREFIX`/`ANY_SUFFIX` from `@crafterix/data` - engine already has access to this
- The mod diff logic (finding what was added/removed) is repeated logic that could be its own utility
- The UI still needs to generate unique IDs for outcomes - keep that in UI, just move calculation to engine
- Consider whether `OutcomeOption` type belongs in `@crafterix/data` or `@crafterix/engine`

---

## Task 10: Extract CurrencyButton Component

**Priority**: Low | **Effort**: Low | **Risk**: None

### Context Files
- `packages/web/src/components/CurrencySidebar.tsx` (lines 257-323)

### Problem
`CurrencyButton` is a 66-line component defined inside `CurrencySidebar.tsx`. It has its own state (`imageError`) and is reused multiple times.

### Desired Outcome
Create `packages/web/src/components/CurrencyButton.tsx`:
- Move component and its props interface
- Export for use in `CurrencySidebar`

### Gotchas
- Uses `getCurrencyImagePath` from `../utils/currency-images` - import path changes
- `CurrencyTooltip` is imported and used - ensure import works from new location
- The `compact` prop changes sizing - ensure both variants still work after extraction

---

## Task 11: Extract OmenToggle Component

**Priority**: Low | **Effort**: Trivial | **Risk**: None

### Context Files
- `packages/web/src/components/CurrencySidebar.tsx` (lines 325-361)

### Problem
`OmenToggle` is a small component (37 lines) nested in `CurrencySidebar.tsx`.

### Desired Outcome
Create `packages/web/src/components/OmenToggle.tsx` or keep inline if preferred. If extracting, update imports.

### Gotchas
- Very simple component with no internal state - extraction is optional
- Could be combined with Task 10 into a `currency/` folder with related components

---

## Task 12: Add Engine Unit Tests - Core Classes

**Priority**: High | **Effort**: Medium | **Risk**: None

### Context Files
- `packages/engine/src/crafting-state.ts`
- `packages/engine/src/mod-pool.ts`
- `packages/engine/src/weighted-random.ts`
- `packages/engine/package.json` (add vitest)

### Problem
No test coverage exists. Core probability calculations and state management are untested.

### Desired Outcome
Create `packages/engine/src/__tests__/`:
- `crafting-state.test.ts`: Test immutability, prefix/suffix limits, corruption
- `mod-pool.test.ts`: Test filtering by type, group exclusion, weight modifications
- `weighted-random.test.ts`: Test probability calculation, edge cases (empty list, single item)

Add to `package.json`:
```json
"scripts": {
  "test": "vitest"
}
```

### Gotchas
- Need sample test data - can use existing `SAMPLE_*` exports or create minimal fixtures
- `weighted-random.ts` uses `Math.random()` in `selectWeighted` - may need to mock or test probabilistically
- Focus on `calculateProbabilities` which is deterministic and testable

---

## Task 13: Add Engine Unit Tests - Actions

**Priority**: High | **Effort**: Medium | **Risk**: None

### Context Files
- `packages/engine/src/actions/*.ts`
- `packages/engine/src/__tests__/` (after Task 12)

### Problem
Currency actions have complex branching logic for outcomes. No tests verify correctness.

### Desired Outcome
Create `packages/engine/src/__tests__/actions/`:
- `transmutation.test.ts`: Normal → Magic, verify outcome count
- `augmentation.test.ts`: Fills missing affix type only
- `annulment.test.ts`: One outcome per existing affix
- Verify all actions: `getOutcomes()` probabilities sum to 1.0

### Gotchas
- Actions need `Currency` objects - use `SAMPLE_CURRENCY` or create minimal test fixtures
- Actions need `Modifier[]` - large dataset, consider creating small focused test mod pools
- `canApply()` has specific rarity/corruption requirements - test both positive and negative cases
- Probability sum test: `outcomes.reduce((sum, o) => sum + o.probability, 0)` should equal ~1.0 (floating point tolerance)

---

## Task 14: Simplify VaalOrb Structure

**Priority**: Low | **Effort**: Medium | **Risk**: Medium

### Context Files
- `packages/engine/src/actions/vaal.ts` (247 lines)

### Problem
VaalOrb has 7 private methods handling different outcome branches. Complex nested logic for rerolling magic vs rare items.

### Desired Outcome
Either:
1. Extract outcome strategies to separate functions/files
2. Simplify by removing redundant branches (e.g., merge similar magic/rare reroll logic)
3. Add clear comments documenting the 4 Vaal outcomes and their probabilities

At minimum, document the outcome breakdown:
- 50%: No change (outcomes 1 & 4 combined)
- 25%: Reroll affixes (outcome 2)
- 25%: Add corrupted implicit (outcome 3)

### Gotchas
- The "representative sample" approach for rare rerolls (lines 177-200) is a simplification - don't accidentally expand to full combinatorics
- Corrupted implicits are filtered by item tags - ensure this still works after refactoring
- The probability split (50/25/25) is hardcoded - consider making configurable if PoE2 changes this

---

## Task 15: Create Data Provider Pattern

**Priority**: Low | **Effort**: Medium | **Risk**: Medium

### Context Files
- `packages/web/src/state/crafting-context.tsx` (lines 19-29, 296-302, 526-529)

### Problem
`SAMPLE_ITEMS`, `SAMPLE_MODIFIERS`, `SAMPLE_CURRENCY`, `SAMPLE_OMENS` are directly imported and hardcoded throughout the context. Makes it impossible to swap data sources.

### Desired Outcome
Create `packages/web/src/state/data-context.tsx`:
```typescript
interface GameData {
  items: ItemBase[];
  modifiers: Modifier[];
  currencies: Currency[];
  omens: Omen[];
  corruptedImplicits: CorruptedImplicit[];
}

const DataContext = createContext<GameData | null>(null);
export function DataProvider({ data, children });
export function useGameData(): GameData;
```

`CraftingProvider` consumes `useGameData()` instead of imports.

### Gotchas
- `SAMPLE_OMENS` is also used in `reducer.ts` helper `getConflictingOmenIds()` - need to pass omens through or restructure
- The engine's `createAllActions` needs modifiers/omens - data must flow through
- This is a larger architectural change - ensure backwards compatibility or update all consumers together
- `storage.ts` uses `SAMPLE_ITEMS` for deserialization - needs access to data context or passed explicitly

---

## Completion Checklist

- [x] Task 1: Extract mod grouping utility
- [x] Task 2: Add lookup maps to ModPool
- [x] Task 3: Fix private member access in essence
- [x] Task 4: Remove debug logging
- [x] Task 5: Remove unused parameter
- [ ] Task 6: Split CraftingContext types
- [ ] Task 7: Extract reducer
- [ ] Task 8: Extract context helpers
- [ ] Task 9: Move outcome calculation to engine
- [ ] Task 10: Extract CurrencyButton
- [ ] Task 11: Extract OmenToggle
- [ ] Task 12: Add engine tests - core
- [ ] Task 13: Add engine tests - actions
- [ ] Task 14: Simplify VaalOrb
- [ ] Task 15: Create data provider pattern

---

## Suggested Order

**Phase 1 - Quick Wins (do first)**
1. Task 4: Remove debug logging
2. Task 5: Remove unused parameter
3. Task 3: Fix private member access

**Phase 2 - Core Engine Improvements**
4. Task 2: Add lookup maps to ModPool
5. Task 1: Extract mod grouping utility
6. Task 12: Add engine tests - core
7. Task 13: Add engine tests - actions

**Phase 3 - Context Refactoring**
8. Task 6: Split CraftingContext types
9. Task 7: Extract reducer
10. Task 8: Extract context helpers
11. Task 9: Move outcome calculation to engine

**Phase 4 - Component Extraction (optional)**
12. Task 10: Extract CurrencyButton
13. Task 11: Extract OmenToggle

**Phase 5 - Larger Refactors (optional)**
14. Task 14: Simplify VaalOrb
15. Task 15: Create data provider pattern
