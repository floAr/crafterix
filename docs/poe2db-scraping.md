# poe2db.tw Scraping Guide

Data source for modifiers, item bases, and currencies.

## URL Structure

### Modifiers Index
- **Main page:** `https://poe2db.tw/us/Modifiers`
- Categories: Skill Gems, Support Gems, Map Mods, Crafting Bench, Item Mods, etc.

### Item-Specific Modifiers
Pattern: `https://poe2db.tw/us/{ItemType}#ModifiersCalc`

Examples:
- `https://poe2db.tw/us/Claws#ModifiersCalc`
- `https://poe2db.tw/us/Body_Armours#ModifiersCalc`
- `https://poe2db.tw/us/Helmets#ModifiersCalc`

### Modifier Categories per Item Page

Each item type page has modifiers split into:
1. **Augment** - Crafting mods (prefix/suffix via orbs)
2. **Bonded** - Socket system mods (runes)
3. **Corrupted** - Vaal Orb implicit mods

## Data Fields

### Crafting Modifiers (Prefix/Suffix)
```
- Mod name/ID
- Display text (with # placeholders)
- Type: prefix | suffix
- Group (mutually exclusive mods share a group)
- Tags (life, fire, defences, etc.)
- Applicable item types
- Tiers:
  - Tier number
  - Required item level
  - Weight (spawn chance)
  - Value ranges [{min, max}]
```

### Corrupted Implicits
From Claws page example:
```
- (10—20)% reduced Attributes Requirements    weight: 1
- (15—25)% increased Physical Damage          weight: 1
- Adds (9—14) to (15—22) Fire Damage          weight: 1
- Adds (8—12) to (13—19) Cold Damage          weight: 1
- Adds (1—2) to (29—43) Lightning Damage      weight: 1
- Adds (7—11) to (12—18) Chaos damage         weight: 1
- (6—8)% increased Attack Speed               weight: 1
- +(5—10)% to Critical Damage Bonus           weight: 1
- (20—30)% increased Elemental Damage         weight: 1
```

All corrupted mods have weight=1 (equal probability).

## Scraping Notes

### Update Frequency
Data changes only with new leagues/seasons (~every 4 months). No need for automated pipeline - manual scrape when needed.

### HTML Structure
Tables use standard HTML `<table>` with modifier data in rows. Look for:
- Section headers identifying mod category (Augment/Bonded/Corrupted)
- Tier tables with columns: Name, Level, Stats, Weight

### Parsing Value Ranges
Format: `(min—max)` or `(min1—max1) to (min2—max2)` for dual-range mods
- Single value: `+# to maximum Life` with `(10—19)` → `{min: 10, max: 19}`
- Dual value: `Adds # to # Fire Damage` with `(9—14) to (15—22)` → `[{min: 9, max: 14}, {min: 15, max: 22}]`

### Item Type Mapping
URL slugs → internal item types:
- `Body_Armours` → `body_armour`
- `Claws` → `claw`
- `One_Hand_Swords` → `one_hand_sword`

## Implementation Approach

1. Fetch item type page with Puppeteer/Playwright (JS-rendered content)
2. Parse modifier tables by section (Augment/Bonded/Corrupted)
3. Extract tier data, weights, value ranges
4. Map to `Modifier` type from `@crafterix/data`
5. Output to `packages/data/data/{item-type}.json`
