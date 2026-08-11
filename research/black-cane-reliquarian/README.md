# Black Cane Reliquarian — build research (PoE1 3.29 "Curse of the Allflame")

Research dossier for a **Scion Reliquarian "Black Cane" phantasm caster** — the build
uses *Phantasmal Might* (large flat Added Physical Damage to Spells per active Phantasm)
sustained by **Soulwrest** (corpse-consume → Summon Phantasm) + **The Dark Monarch**
(doubles phantasm cap), on a mid-ES shell.

> This folder is a **session handover**. It was produced across several multi-agent
> research loops. Start with `HANDOVER.md`.

## Files

| File | What's in it |
|---|---|
| `HANDOVER.md` | **Read first.** State of play, what the next session should do first (pull the user's build), branch info. |
| `01-synthesis.md` | The bottom-line synthesis: two build approaches, recommendation, gearing priority. |
| `02-mechanics-reference.md` | Validated mechanics + confidence levels + the corrections we made to earlier/content-farm claims. |
| `03-approaches-and-gearing.md` | Plan A (cold VD) and Plan B (phys BB-Unloading + Impale) in detail: gem plans, sockets, keys, amps. |
| `04-open-questions.md` | Things to verify in PoB 3.29 / once network is unblocked. The next session's to-do list. |
| `05-research-log.md` | Condensed loop-by-loop findings with sources. |
| `06-user-build.md` | The user's character links + the local-decode problem, for retrieval next session. |
| `07-user-build-analysis.md` | **Network-open session.** The decoded PoB analyzed against the framework; the `HANDOVER` step-4 answers; closed open questions. |
| `08-staged-plan-and-shopping.md` | **Network-open session.** Review of the user's staged upgrade plan (Queen's Hunger + Leash, Guardian's Blessing, phantasm-survival), buy/skip thresholds, and the live-price limitation + workaround. |

## One-paragraph TL;DR

On the user's **locked chassis** (Reliquarian + Soulwrest + Dark Monarch + mid-ES),
the natural, proven, ~1-button build is **Plan A: phys→cold Volatile Dead** in a
`Cyclone–CwC–Desecrate–VD–Cold Pen–Greater Spell Cascade` link — it *does* cash
Phantasmal Might (the flat physical is added to VD, then converted 100% to cold).
**Plan B** (physical Blade Vortex + Blade Blast of Unloading + Impale) has a higher
theoretical ceiling and is the user's theorycraft favorite, but this specific
**non-Saboteur** chassis strains it: no Triggerbots (~⅓–½ blade throughput), a
mandatory parallel corpse loop, socket starvation, and ~4 keys with 2 spam. The single
biggest scaling lever for *either* approach is the **+gem-level double-dip** on the
socketed Summon Phantasm Support.

## Sourcing caveat (applies throughout)

All primary PoE sources (poewiki, poedb, pathofexile.com, poe.ninja, maxroll, pobb.in)
were **network-blocked** in the research environment; findings rest on WebSearch
snippets + stable game mechanics, with content-farm 3.29-specific numbers flagged as
lower confidence. Items marked ⚠️ in `04-open-questions.md` still need PoB/wiki
confirmation.
