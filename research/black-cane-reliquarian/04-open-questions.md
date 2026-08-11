# 04 — Open questions (next session's to-do, once network is unblocked)

These are the items we could NOT confirm because primary sources were network-blocked.
With poewiki/poedb/PoB reachable, close them — several change gearing or rankings.

## High priority (change the build)

1. ⚠️ **Which phantasm instance drives Phantasmal Might's per-phantasm flat?**
   Does the buff read the **socketed Summon Phantasm *Support* gem level** or the
   **highest** Summon Phantasm instance (Soulwrest's innate ~lvl 25)?
   - If socketed-support: the +gem-level double-dip is real → chase `+2 socketed
     support/minion` body armour + gem corrupts (biggest multiplier).
   - If highest-instance (Soulwrest lvl 25): +levels on the support only raise **cap**,
     not per-phantasm damage → gearing priority shifts.
   *Check: poewiki Summon Phantasm Support / The Black Cane / 3.29 Reliquarian node text,
   and confirm in PoB by toggling a +1 support gem level.*

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

5. **The 3.29 Reliquarian ascendancy node list** and exact "Black Cane" node wording
   (relic-collector mechanic). Confirm it grants Phantasmal Might as claimed.

6. **Watcher's Eye Hatred** exact rolls available (phys→cold conversion %, cold pen while
   affected by Hatred) — decides the gloves/Watcher's split for 100% conversion.

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
