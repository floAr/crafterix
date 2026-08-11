# HANDOVER — read first

## Where we are

We spent several research loops theorycrafting a **PoE1 3.29 Scion Reliquarian "Black
Cane" phantasm build** and validating mechanics against external sources. All findings
are persisted in this folder. The synthesis is done (`01-synthesis.md`); what remains is
**analyzing the user's actual character** and closing a short list of PoB-verification
items (`04-open-questions.md`).

## The blocker that created this handover

The research environment's **egress proxy blocks every PoE build site** (poe.ninja,
pobb.in, maxroll.gg, pathofexile.com, poewiki, poedb) with `403/407` policy denials.
So we could not:
- open the user's poe.ninja profile, or
- decode their PoB code (an 11.7k-char base64 blob had to be hand-transcribed into the
  sandbox to decode locally, and it corrupted early — see `06-user-build.md`).

The user was setting up a **network allowlist** for these domains, which only takes
effect in a **freshly started session**. Hence this handover.

## What THIS (fresh) session should do first

1. **Confirm network access is live.** Try fetching the user's build:
   - Profile: `https://poe.ninja/poe1/profile/floAr-6143/allflame/character/floAr_Support`
   - PoB (raw): `https://pobb.in/eAT34Ikb6aXa/raw`  (returns the base64 PoB code directly)
   - PoB (page): `https://pobb.in/eAT34Ikb6aXa`
   - If these still `EGRESS_BLOCKED`, the allowlist didn't save — tell the user to add
     `poe.ninja, pobb.in, maxroll.gg, pathofexile.com, poewiki.net, poedb.tw` to the
     **environment network policy** (see `06-user-build.md`) and restart. Meanwhile fall
     back to a chunked PoB paste or a text summary.
2. **Decode/read the build** and extract: ascendancy relics, main skill + 6-link,
   Soulwrest sockets (Summon Phantasm Support + level), gloves + conversion source,
   Watcher's Eye mods, uniques/jewels, Life/ES, phantasm count, tooltip DPS.
3. **Map it onto the framework** in `01-synthesis.md` / `03-approaches-and-gearing.md`
   and answer the concrete questions in step 4.
4. **Tell the user, specifically:**
   - Are they capturing the **+gem-level double-dip** (see `02` §1)?
   - Is the **phys→cold conversion + cold-pen** stack optimal (Plan A)?
   - Where is the **mid-ES shell** thin (see `03` defense section)?
   - Highest-leverage upgrades, in order.
5. **Close the ⚠️ open questions** in `04-open-questions.md` now that wiki/poedb/PoB are
   reachable — especially *"which phantasm instance drives Phantasmal Might"* and the
   transfigured-gem effectiveness coefficients.

## Branch / git

- Work branch: `claude/poe-ninja-black-cane-reliquarian-19r4a9` (this folder is committed
  there). A fresh session must `git checkout` this branch to see these files.
- This is research/notes only — it does **not** touch the crafterix app code.

## The user's playstyle constraint (locked)

They **committed to Reliquary** and already have a character leveled with **Soulwrest +
Dark Monarch + a mid-ES shell**. So: no Saboteur, weapon slot = Soulwrest (2H), helmet =
Dark Monarch. Don't re-litigate the ascendancy/weapon choice — build advice on top of it.
