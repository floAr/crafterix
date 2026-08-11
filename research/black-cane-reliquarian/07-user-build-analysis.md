# 07 — The user's build, analyzed (network unblocked, PoB decoded)

Session that produced this: the fresh session promised in `HANDOVER.md`. Network is now
open; the user's PoB (`https://pobb.in/eAT34Ikb6aXa/raw`) was fetched via `curl` and
decoded locally. poedb/poewiki now reachable — the ⚠️ mechanics in `04` are closed below.

> **How to read the numbers:** the PoB's `Config` section is **empty** — no phantasm count,
> no enemy setup. So the headline **AverageHit 131,322 / TotalDPS 198,973** is computed with
> **Phantasmal Might contributing ~nothing** (PoB adds the flat only when phantasms are
> modelled). Real single-target with a full phantasm stack is **materially higher** — the
> first thing to do in PoB is set the active-phantasm count in Configuration and re-read DPS.

## What the character actually is (active item set)

It **is Plan A**, already assembled — near-textbook:

| Slot | Item | Role |
|---|---|---|
| Weapon | **Soulwrest** (2H staff) | Trigger lvl-25 Summon Phantasm on corpse-consume; +120% spell dmg, block |
| Helmet | **The Dark Monarch** | Doubles phantasm cap, +1 minion gems; *cannot have non-phantasm minions* |
| Gloves | **Hrimsorrow** | **100%** phys→cold (confirmed poedb) — conversion fully solved |
| Body | **Wrath Ward** (rare Vaal Regalia) | 683 ES, 17% inc cold dmg, 10% phys taken as chaos |
| Boots | Storm Road (rare) | life, MS, res |
| Amulet | Corruption Noose (rare Citrine) | attributes, life, res |
| Rings | Rage Hold + Skull Knot (rare 2-stones) | ES, life, res |
| Belt | Death Buckle (rare) | life, ES, res |
| Swap | Trypanon (100%-crit mallet) | one-hit curse/charge application swap |

**Main link (in Body Armour):** `Cyclone – Cast while Channelling – Volatile Dead(L1) –
Greater Spell Cascade(L19) – Desecrate(L1) – Cold Penetration(L11)`. This is exactly the
recommended Plan A engine (VD/Desecrate kept at L1 so Cyclone→CwC spawns+consumes corpses
cheaply; each consume triggers Soulwrest's phantasms). ✅

**Phantasm engine (in Soulwrest):** `Summon Phantasm Support(L19) + Meat Shield(L18)` plus
Soulwrest's innate `Triggered Summon Phantasm(L25)`. Other Soulwrest sockets: Blind+Frostblink,
Item Rarity, Culling Strike.

**Auras/utility:** Hatred (gloves) ✓ · Herald of Purity + Clarity + Vitality, **reserved on
life via Arrogance** (boots) · Petrified Blood + Assassin's Mark + Mark-on-Hit (helmet).

**Defensive stats:** Life 3,272 (**only 1,624 unreserved**) · ES 2,519 · **TotalEHP 58,085** ·
crit 42% × 3.51 multi.

---

## The five questions from `HANDOVER.md` step 4 — answered

### 1. Are they capturing the "+gem-level double-dip"? — **Partly; the framing was wrong.**

Verified wording (poedb, *The Black Cane* / Phantasmal Might):

> "Each Summoned Phantasm grants you Phantasmal Might. **Phantasmal Might grants Added Spell
> Physical Damage based on the level of the Phantasm. Multiple instances of Phantasmal Might
> stack.**"

So the flat packet is **per-phantasm, scaled by that phantasm's own level, and the stacks add
up**. That reframes `04` Q1 and the `01`/`02` "near-quadratic socketed-support double-dip":

- **Soulwrest's innate phantasms are a fixed level 25** → the bulk of the flat. `+gem levels`,
  Empower, etc. do **nothing** to these (item-granted skill).
- The **socketed Summon Phantasm Support (L19)** summons *its* phantasms at *its* gem level, and
  its own "Maximum Summoned Phantasm" grows 5→10 with level. So raising **that** gem does double
  up — but only for *its* slice of phantasms, not Soulwrest's.
- Because flat **stacks per phantasm**, the real top lever is **phantasm COUNT**, not one gem's
  level.

**Where the user is leaving damage on the floor:** the socketed Summon Phantasm Support is
linked with **Meat Shield** — a purely defensive minion support that adds **zero** cap and zero
damage. Swapping it to **Congregation Support** (+max phantasms, +phantasm damage) is a direct,
cheap increase to the number of stacking Phantasmal Might instances → more flat on every VD
hit. No `+gem-level` investment on the socketed support either (Empower/`+2 socketed` gains are
available and do help this instance's level→flat + its cap).

### 2. Is the phys→cold conversion + cold-pen stack optimal? — **Conversion yes, penetration no.**

- **Conversion: solved.** Hrimsorrow is **100%** phys→cold (poedb + the user's own PoB item
  text; the dossier's earlier "Hrimsorrow 50%" is corrected). The entire Phantasmal Might
  physical packet **and** VD are 100% cold with **no residual physical** — so a *second*
  conversion source (rare gloves / Watcher's Eye "% converted") is **redundant**. That frees
  the Watcher's Eye slot for pen/defense instead of conversion.
- **Penetration: weak.** Cold Penetration gem is only **level 11** (≈ −25% vs −35% at 20/21) and
  Intuitive Leap contributes a trivial 1% cold pen. There is **no Frostbite**, **no Cold
  Exposure** (Wave of Conviction), and **no Watcher's Eye "Cold Penetration while affected by
  Hatred."** This is the single biggest *offensive* multiplier left: level the Cold Pen gem, add
  a −cold-res layer (Frostbite curse and/or Wave-of-Conviction cold exposure), optionally a
  Hatred Watcher's Eye pen roll.

### 3. Where is the mid-ES shell thin? — **Everywhere; it's the weakest part of the build.**

- **1,624 unreserved life** is dangerously low. Cause: **Herald of Purity reserved on *life*
  via Arrogance** + **Petrified Blood**'s life-tax. And per Dark Monarch — *"Cannot have Minions
  other than Summoned Phantasms"* — **HoP's Sentinels don't even spawn** (only the flat-phys
  aura buff applies). Reserving a chunk of life for a half-working Herald is a bad trade here.
- **Petrified Blood** on an ES-hybrid is exactly what `03` says to avoid: it taxes the life half
  without touching ES, and doesn't suit a channeller taking frequent hits.
- **No Discipline** (the mandatory mid-ES aura) and **no Watcher's Eye "gain ES per enemy hit."**
  On a *constant* Cyclone channeller, ES-on-hit is the highest recovery-per-cost layer in the
  game and it's entirely absent — this is the biggest defensive upgrade available.
- Net: **TotalEHP ~58k** is fine for maps, thin for pinnacle bosses.

### 4. Highest-leverage upgrades, in order

1. **Meat Shield → Congregation Support** on the socketed Summon Phantasm engine. More
   phantasms = more stacking Phantasmal Might = more flat cold on every VD hit. Cheap, pure gain.
2. **Fix penetration:** level Cold Penetration (L11 → 20/21) and add one −cold-res layer —
   **Frostbite** (fold into the existing Mark-on-Hit curse setup) and/or **Wave of Conviction**
   for Cold Exposure. Large multiplicative damage.
3. **Defense overhaul:** add **Discipline** and chase a **Watcher's Eye "Discipline: gain ES per
   enemy hit."** To pay reservation, **drop Herald of Purity** (its sentinels are blocked by Dark
   Monarch anyway) — recovering both life and a socket.
4. **Drop Petrified Blood** — wrong tool on an ES-hybrid; frees the life half and a slot.
5. **Raise phantasm cap/uptime:** higher socketed Summon Phantasm Support level (`+2 socketed
   minion/support` body corrupt, Empower on the *socketed* support — **not** Soulwrest's innate),
   plus minion life/duration for a fuller sustained stack.
6. **Watcher's Eye Hatred (cold pen / added cold as extra):** now a *pure damage* add (conversion
   is already handled), so it sits below count + gem-pen in priority.

### 5. `04` open questions — closed / updated

- **Q1 (which phantasm instance drives Phantasmal Might):** **RESOLVED.** All of them —
  *multiple instances stack*, each scaled by *its own* phantasm level. Soulwrest = fixed L25;
  socketed support = its gem level. `+levels` help only the socketed instance; **count** is king.
- **Q5 (Reliquarian real + Black Cane grants Phantasmal Might):** **CONFIRMED.** Reliquarian is a
  real Scion ascendancy (introduced 3.28 Mirage, continues in 3.29 "Curse of the Allflame"); its
  **Black Cane** node grants Phantasmal Might as a passive — so the user gets the packet while
  wielding Soulwrest, **no sceptre needed**. The whole premise holds.
- **Q6 (Hrimsorrow conversion / Watcher's split):** **CONFIRMED 100%.** Conversion is fully
  solved by the gloves; Watcher's Eye is for *pen/defense*, not conversion.
- Q2/Q3/Q7 (transfigured-gem coefficients, Dark-Monarch totem block, BB-Unloading numbers)
  pertain to **Plan B / alternate skills** the user is **not** running — left open, low priority.

---

## One-line verdict

The character is a correctly-built Plan A cold-VD Reliquarian with **conversion already solved**;
its damage ceiling is gated by **phantasm count + cold penetration**, and its survivability is
gated by **reservation waste (Herald/Petrified Blood) and a missing Discipline + ES-on-hit
layer** — all cheap-to-moderate fixes, none requiring a rebuild.

## Sources (primary, this session)

- User PoB: `https://pobb.in/eAT34Ikb6aXa/raw` (decoded locally: urlsafe-b64 → zlib → XML).
- poedb *The Black Cane* / Phantasmal Might wording: `https://poedb.tw/us/The_Black_Cane`
- poedb *Hrimsorrow* (100% conversion): `https://poedb.tw/us/Hrimsorrow`
- 3.29 Reliquarian / Black Cane / Phantasmal Might context (WebSearch): mobalytics, u4gm,
  ssegold, aoeah guides for 3.29 "Curse of the Allflame".
