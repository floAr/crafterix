# 04 — Open questions (next session's to-do, once network is unblocked)

These are the items we could NOT confirm because primary sources were network-blocked.
With poewiki/poedb/PoB reachable, close them — several change gearing or rankings.

> **Status (network-open session):** Q1, Q5, Q6 **CLOSED** below against poedb primary text.
> See `07-user-build-analysis.md` for the full resolution and the user's build mapping.

## High priority (change the build)

1. ✅ **RESOLVED — Which phantasm instance drives Phantasmal Might's per-phantasm flat?**
   poedb (The Black Cane / Reliquarian ascendancy): *"Each Summoned Phantasm grants you
   Phantasmal Might (grants Added Spell Physical Damage **based on the level of the Phantasm**.
   **Multiple instances of Phantasmal Might stack**)."*
   → **Both instances contribute, each scaled by its own phantasm's level, and they stack.**
   Soulwrest's innate phantasms are a fixed **level 25** (the bulk of the flat; ignore +gem
   levels/Empower). The **socketed Summon Phantasm Support** summons *its* phantasms at *its*
   gem level and grows its own cap 5→10 — so +levels there double-benefit *that* subset only.
   **Net: the "near-quadratic socketed-support double-dip" was overstated — phantasm COUNT is
   the real multiplier** (flat stacks per phantasm). Chase Congregation + cap + uptime first.

2. ⚠️ **Transfigured-gem effectiveness-of-added-damage in 3.29.** Content-farm sources
   conflicted (e.g. Flame Surge of Combusting 410% vs 280%; BV of the Scythe 370% vs 200%;
   also VD ~210%). Pull the real 3.29 values from poedb/PoB — they reorder the nuke ranking.

3. ⚠️ **Dark Monarch totem-block.** 3.26 bug reports say Dark Monarch blocks totems/traps/
   mines as "other minions." If **still true in 3.29**, no totem automation (forces
   Arcanist Brand / CwC) — matters most for Plan B. If **fixed**, Plan B eases a lot.
   *Check: current Dark Monarch wording + a 3.29 build using totems, or test in PoB/client.*

## Medium priority (confirm numbers)

4. **Real phantasm count** achievable on the user's gear (the "~62" is marketing). Soulwrest
   innate cap + socketed Summon Phantasm Support cap (they stack separately) + Congregation
   + Dark Monarch doubling. Confirm each contribution and the realistic sustained count.

5. ✅ **RESOLVED — Reliquarian ascendancy + "Black Cane" node.** poedb `/us/Reliquarian`
   returns a real 36-node Scion ascendancy (introduced 3.28 Mirage, live in 3.29 "Curse of
   the Allflame"). **The Black Cane** is an ascendancy node granting Phantasmal Might as a
   passive — so the packet applies **while wielding Soulwrest, no sceptre needed**. Premise
   confirmed. (Also saw a **"The Shattered Divinity"** node granting Summon Greater Harbinger.)

6. ✅ **RESOLVED — conversion / Watcher's split.** **Hrimsorrow is 100% phys→cold** (poedb +
   the user's own PoB item text; the dossier's earlier "50%" was wrong). Conversion is fully
   solved by the gloves alone → **Watcher's Eye is for cold *pen* / added cold, NOT conversion.**

7. **Blade Blast of Unloading** base crit (we have ~6%; the "10%" was likely BV's buff),
   the exact "% more per blade" (≈5%), and AoE-per-blade (80% vs 100%).

## Low priority / nice to have

8. Live **poe.ninja** popularity + a couple of real PoB pastes for the archetype
   (e.g. the "Hybrid Crit Volatile Dead Reliquarian" and "CwC VD Reliquarian" builds) to
   sanity-check gem links and defensive layers against ours.

9. Exact **boss ailment thresholds** (freeze) and **monster armour** tables to firm up the
   "freeze = clear-only" and "armour ~1–3%" claims (both currently H on mechanic, M on
   exact numbers).

## How to close them fast

Once network is live: fetch poedb.tw gem pages (effectiveness, crit, per-blade), poewiki
Summon Phantasm Support + The Black Cane, and import the user's PoB to read the actual
numbers. Then update `01`/`02`/`03` and delete resolved ⚠️ flags.
