# Data Integration Plan

## Overview

Integrate scraped poe2db data:
1. **Currency images** - show in sidebar with styled hover tooltips
2. **Modifiers** - replace dummy SAMPLE_MODIFIERS with real data

---

## 1. Currency Images in Sidebar

### Current State
- `CurrencySidebar.tsx` uses text abbreviations ("Tr", "Au", etc.)
- Images downloaded to `packages/data/assets/currency/*.webp`
- Mapping in `packages/data/data/currency/currency-images.json`

### Implementation Steps

**A. Copy images to web public folder**
```
packages/data/assets/currency/*.webp
  → packages/web/public/currency/*.webp
```

**B. Create image helper**
```typescript
// packages/web/src/utils/currency-images.ts
export function getCurrencyImagePath(currencyId: string): string | null {
  // Map currency ID to image filename
  // Return null if no image exists
}
```

**C. Update CurrencySidebar.tsx**
- Replace text icon with `<img>` element
- Add fallback to text if image missing
- Style: 32x32px, slightly larger on hover

**D. Add styled hover tooltip**
- Show on hover (not just title attribute)
- Content:
  - Currency name (large)
  - Description
  - "Applies to: Normal/Magic/Rare"
- Style: Dark panel with gold border, positioned above button

### Component Changes

```tsx
// Before
<button>{icon}</button>

// After
<button className="group relative">
  <img src={imagePath} className="w-8 h-8" />
  <CurrencyTooltip currency={currency} />
</button>
```

---

## 2. Modifiers from Scraped Data

### Current State
- `SAMPLE_MODIFIERS` in `packages/engine/src/data/sample-mods.ts`
- 10 hardcoded mods for body armour only
- Scraped: 204 mods in `packages/data/data/modifiers/all-modifiers.json`

### Data Format Comparison

**Sample data:**
```json
{
  "id": "flat_life",
  "applicableTo": ["body_armour", "armour"]
}
```

**Scraped data:**
```json
{
  "id": "of_the_titan_strength",
  "applicableTo": ["ring", "amulet", "belt", "body_armour", ...]
}
```

### Implementation Steps

**A. Create data loader in engine**
```typescript
// packages/engine/src/data/load-modifiers.ts
import allModifiers from "../../data/data/modifiers/all-modifiers.json";

export function getModifiersForItemType(itemTag: string): Modifier[] {
  return allModifiers.filter(m => m.applicableTo.includes(itemTag));
}
```

**B. Update sample-mods.ts**
- Import from JSON instead of hardcoding
- Keep helper functions (getModifierById, etc.)

**C. Handle item tag mapping**
Current item bases use tags like `"armour"`, `"str_armour"`
Scraped mods use `"body_armour"`, `"helmet"`, etc.

Need to map item base tags → mod applicableTo tags:
```typescript
const TAG_MAP: Record<string, string[]> = {
  "str_armour": ["body_armour"],
  "armour": ["body_armour", "helmet", "gloves", "boots"],
  // ...
}
```

**D. Update ModPool to use real data**
- `ModPool.getAvailableMods()` already filters by `applicableTo`
- Just need to pass the full modifier list

### Migration Path

1. Keep SAMPLE_MODIFIERS working (backwards compat)
2. Add real modifiers alongside
3. Switch context to use real data
4. Remove sample data once verified

---

## 3. Questions to Resolve

### Currency
- [ ] Which currencies to show? (currently 12, we have 114 images)
- [ ] Keep same grid layout or expand?
- [ ] Tooltip positioning (above vs. side)

### Modifiers
- [ ] How to handle item tag mismatch?
- [ ] Filter mods by selected item base, or show all?
- [ ] What about essence-only mods (weight: 0)?

---

## 4. File Changes Summary

| File | Change |
|------|--------|
| `packages/web/public/currency/` | Add images |
| `packages/web/src/components/CurrencySidebar.tsx` | Images + tooltip |
| `packages/web/src/components/CurrencyTooltip.tsx` | New component |
| `packages/engine/src/data/sample-mods.ts` | Import from JSON |
| `packages/engine/src/data/load-modifiers.ts` | New loader |
| `packages/data/src/types/item.ts` | Maybe add tag mapping |

---

## 5. Priority Order

1. **Currency images** - Visual improvement, standalone change
2. **Modifier loader** - Foundation for real data
3. **Tag mapping** - Connect items to correct mods
4. **Full integration** - Use real mods in crafting
