# 05 — Research log (condensed, by loop)

Multi-agent research; every primary PoE site was network-blocked, so findings rest on
WebSearch snippets + stable mechanics. Content-farm 3.29 specifics flagged low-confidence.

## Loop 1 — orientation
Identified the archetype: PoE1 3.29 Scion **Reliquarian** "Black Cane" phantasm caster,
Soulwrest + Dark Monarch + Congregation → ~62 phantasms → ~4,000 flat added phys to
spells → CwC Volatile Dead (phys→cold). Established the sourcing problem (all sites
blocked).

## Loop 2 — mechanics + build space (4 agents)
- Black Cane flat scales with Summon Phantasm gem level; applies to triggers/totems/traps,
  **not minions**; arrives physical → conversion mandatory.
- Ecosystem: Soulwrest cap and Summon Phantasm Support cap stack **separately**; Blessed
  Rebirth makes a high-churn phantasm pool tanky "for free"; Desecrate+Spell Cascade is a
  damage lever; **Black Cane can't be ported via Forbidden jewels**.
- Ascendancy: Reliquarian is a **Scion** sub-ascendancy whose notables **copy a unique's
  signature mod** ("relic collector"). Debunked a confabulated "Rakiata + Bound by Destiny"
  defense; real tech is Dawnbreaker + Melding of the Flesh. RT is a trap for casters.
- Flat-phys theorycraft: conversion is the crown jewel (4-bucket double-dip + unlocks
  penetration/ailments); Exsanguinate has 270% eff; ignite = 3.6× hit; bleed/Corrupting
  Fever are dead ends; trigger delivery is the best amplifier.

## Loop 3 — niche interactions (user's candidate list, 4 agents + validation)
- **BV → Blade Blast of Unloading multi-hit CONFIRMED:** sequential detonations = N hits
  on one boss, each with the full packet. Entropic Devastation = **gloves** (not a
  notable). Use **regular BV** (of-the-Scythe = 1 blade). BV nerfed per-blade in 3.29,
  crit 6→10%.
- **Coefficients** (content-farm): Frost Bomb of Forthcoming 460%, Flame Surge of
  Combusting 410%, Frost Bomb 380%, Freezing Pulse 370%, Void Sphere of Rending 250% —
  ⚠️ unverified. Frost Bomb of Forthcoming = burst nuke (delay, no cooldown); Flame Surge
  of Combusting = best sustained. Freezing Pulse return **doesn't work** (pierce+fade).
- **Void Sphere** = comfy mapper, loses on bosses (pulse-clock capped); conversion +
  gain-as-extra ordering confirmed orthogonal.
- **Defensive uniques:** Graven's Secret base 3 charges (36% recoup, hits-only, no DoT);
  Chayula life→ES (dead on CI); Ming's −25% max ES is *additive*→~7% real loss on stacked
  ES (permanent item, not swap); Incandescent Heart **anti-synergizes** with Graven;
  Gloomfang is after-chain not per-chain. **Fork:** Graven consumes Power Charges → non-crit
  branch, incompatible with the crit/Impale branch.
- Validation: Ming's 25%/40-60% confirmed real PoE1 (not PoE2); reduced-max-ES additive
  (defensive agent right); return capped at +1 same-target hit.

## Loop 4 — numbers + ergonomics (4 agents + validation)
- **Physical mitigation:** boss armour ~1–3% on a 15k+ hit (max monster armour ~983); no
  phys pen exists; Overwhelm→chance-to-ignore-PDR (useless vs bosses); Armour Break is
  PoE2-only; Impale ~90%+ lands. Physical/Impale is boss-competitive; cold's edge is
  freeze utility, not armour.
- **DPS model:** added-damage-throughput proxy. Crossover: BB-Unloading alone beats all of
  Storm Burst once detonations > ~6.1 hits/sec. Storm Burst pulses 0.4s (not 0.15), 190%
  eff, 50% converts to lightning (compromises Impale).
- **Trigger cadence:** BB consumes ALL blades → DPS = blade throughput (cap 10). Canonical
  = Saboteur (Perfect Crime Triggerbots). Realistic ~12–15 detonation-hits/sec + ~7 BV
  ticks in bursts (manual play). **Without Saboteur → ~⅓–½ throughput.**
- **Automation/keys:** Cyclone-CwC & Void Sphere = ~1 key; Storm Burst 1-key-but-rooted;
  BB-Unloading = 2–4 keys, auto-vs-bank tension, furthest from one-button.

## Loop 5 — chassis lock (user committed to Reliquary + Soulwrest + Monarch + mid-ES)
- **Corpse-consumer fusion:** only **Volatile Dead** (and secondarily Cremation) carry the
  packet; DD/Bodyswap deal corpse-life % (ignore it). VD fuses damage + phantasm sustain
  into one CwC link (~1 key). Meta = phys→**cold**.
- **Socket/key audit:** Plan A fits comfortably (~2–3 keys, 6L spare); Plan B socket-
  starved + key-heavy + half-throughput (no Saboteur). **Correction:** the audit wrongly
  claimed VD ignores the packet — reconciled via §3 of `02` (it converts).
- **Hidden tech:** ⭐ **gem-level double-dip** = biggest multiplier (socketed Summon
  Phantasm Support +levels; ⚠️ which-instance question). Watcher's Eye Hatred [A],
  Entropic Devastation [B], Militant Faith Inner Conviction, Glorious Vanity Corrupted
  Soul. **Defense:** Discipline WE "ES per hit" + Vaal Discipline best per cost; freeze =
  clear defense only; avoid Petrified Blood/Progenesis-for-life on ES; Impale not worth it
  on a mid-ES Scion vs just running cold.

## Selected sources (all snippet-verified; primary pages were blocked)
- poewiki: Summon Phantasm(_Support), The Black Cane, Blade Vortex, Impale, Volatile Dead,
  Desecrate, Soulwrest, Damage conversion, Physical damage reduction, Overwhelm, Freeze,
  Taken as, Cast On Critical Strike Support, Arcanist Brand, Watcher's Eye.
- 3.29 recaps (content-farm, low conf.): maxroll "Curse of the Allflame patch notes",
  mobalytics/odealo/u4gm/aoeah/iggm/mmoexp Reliquarian pages, pobb.in PoB pastes
  (xhkT2rRrlGSb hybrid-crit VD, 6mlDKbfRgDEG VD).
- Precedent: Primaeva Blade Blast Unloader (Saboteur) — pathofexile.com forum 3488000.
