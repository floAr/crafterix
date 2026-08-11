# 08 — Staged plan review + shopping framework (floAr_Support)

Responds to the user's two staged-plan messages (stabilize → defend → Queen's Hunger), on the
**live 3.29 "Curse of the Allflame"** character decoded in `07`. Everything below is checked
against **poedb primary text this session** (network open). Prices are handled at the end.

> **Live-price limitation (read once).** The official trade API is behind Cloudflare's
> `cf_clearance`, which is bound to the **browser IP + User-Agent** that solved the challenge.
> Replayed from this environment's datacenter IP it returns **403** — verified with the user's
> own cookies. poe.ninja's economy API is unreachable here too (404). **So I cannot pull live
> asking-prices myself.** The shopping list therefore gives **buy/skip thresholds in divine
> terms + ready-to-run trade filters** the user executes in their (already-logged-in) browser.

## Mechanics validated this session (all confirmed)

| Piece | Verified poedb text | Implication for this build |
|---|---|---|
| **The Black Cane** (Reliquarian ascendancy node) | "Each Summoned Phantasm grants Phantasmal Might (Added Spell Physical Damage **based on the level of the Phantasm**. **Multiple instances stack**)." | Flat is **per-phantasm, stacks** → *count* is the multiplier; Soulwrest's L25 phantasms dominate. |
| **Hrimsorrow** | "**100%** of Physical Damage Converted to Cold" | Conversion already fully solved — no 2nd source needed. |
| **Volatile Dead of Seething** | "**210%** Effectiveness of Added Damage (was 170%); orb explosions **25% more**." | Best flat-packet vehicle. ⚠️ user's imported PoB still shows **regular VD** — swap to Seething = near-free upgrade. |
| **The Queen's Hunger** | "Trigger L20 Bone/Flesh/Spirit Offering **every 5s in sequence**. Offerings triggered this way **also affect you**." + big ES/Life. | Auto triple-offering engine; each offering re-fires every **15s**. |
| **Leash of Oblation** | "**You can have an Offering of each type.** Offering Skills have **50% reduced Duration**." | Enables all 3 at once — but halves duration (see uptime math). |
| **Flesh/Bone/Spirit Offering** | "Base duration **5s** (+1s per extra corpse consumed)." | Duration is the QH+Leash bottleneck. |
| **Guardian's Blessing Support** | Shares a supported **aura** to you via minions; "**lose ES as Physical Damage/sec** while you have the aura"; "**cannot support triggered skills**." | See deep-dive — the triggered-skill clause does **not** block this build. |
| **Tempered by War** (keystone, via Lethal Pride) | "**50%** of Cold & Lightning taken as Fire; **50% less** Cold/Light Res." | Defensive; needs a 2nd shift source for 95%+; costs 50% ele res. |
| **Prolonged Servitude** (tree notable) | "Minions **cannot be Killed, but die 6s after being reduced to 1 Life**." | Phantasm anti-attrition. Cheap (points). |
| **Blessed Rebirth** (cluster notable) | "Minions **created Recently cannot be Damaged** (past 4s)." | Perfect for constant Soulwrest resummon. |

## Verdict on the staged plan — endorsed, with corrections

**Stage 1 (stabilize phantasms) — correct and highest-ROI.** Prolonged Servitude + Blessed
Rebirth + constant Soulwrest resummon means a large fraction of the army sits permanently in a
damage-immune / can't-die window → the Black Cane stack stops collapsing on hits. This is real
DPS (more *living* phantasms = more stacking flat) for near-zero cost. **Do this first.** Add
the **VD→VD of Seething** swap here (free 210% vs 170% effectiveness on the flat packet) and
**Meat Shield → Congregation** on the socketed Summon Phantasm Support (more phantasm cap =
more stacks; see `07`).

**Stage 2 (defensive floor) — right target, and more urgent than the PoB suggests.** From `07`:
**1,624 unreserved life**, no Discipline, no ES-on-hit, running **Petrified Blood** (bad on
ES-hybrid) and **Herald of Purity whose Sentinels are blocked by Dark Monarch** ("cannot have
minions other than Phantasms") — you're paying life reservation for a half-working aura. Fixes:
drop Petrified Blood; drop/replace HoP to reclaim reservation; add **Discipline**; make recovery
**hit-based (ES-on-hit) + corpse-based (tattoos)** exactly as you proposed — both scale with what
the loop already does. Chaos res and physical max-hit are the other two holes.

**Stage 3 (Queen's Hunger experiment) — worth prototyping, not buying blind.** Agreed: don't buy
QH+Leash before Stage 1–2. The comparison is genuine (see deep-dive). Your instinct to take the
**safe, non-death-on-expiry** version is correct and *required* given your thin pool.

## Prototype deep-dive A — Queen's Hunger + Leash, the *safe* version

**The uptime problem, quantified.** QH re-fires each offering every **15s**; Leash halves
duration. Effective duration ≈ `(5s base + 1s/extra corpse) × 0.5 × (1 + skill-effect-duration)`.
- Base, no duration investment: `5 × 0.5 = 2.5s` up out of every 15s per offering → **big gaps**.
- Your VD corpse-flood helps: consuming ~8–10 corpses/cast adds ~+8–10s pre-Leash → ~+4–5s post
  → offerings land at ~**6–7s**. Still < 15s → **partial uptime (~40–50%) without duration**.
- To approach permanent triple-offering you need roughly **+150–250% skill effect duration**
  (tree/cluster/Reliquarian). That's the "engineered duration" the crank builds run.

**Conclusion:** the **safe** version = accept ~50–70% offering uptime as a *strong intermittent*
buff (block/speed/crit spikes) and **never gate survival on it** (no Death's Offering, no
offering-dependent life recovery). That's a legitimate, low-risk chest choice. The **permanent**
version is a duration project for later. Either way it's **zero extra keys** (all behind Cyclone)
and the offerings **also buff phantasms** (block-capped phantasms = far less Black Cane attrition)
— which is worth more to *this* build than to a normal caster.

**QH+Leash vs rare ES chest — decide in PoB, not by vibe:**
- Rare ES chest = **+raw pool + res** (your thinnest stat), no strings. Wins pure EHP.
- QH+Leash = capped/near-capped **block + speed + crit + phantasm survival** from 2 slots (chest+belt
  locked), **lower raw ES**, needs duration for full value.
- **Test protocol:** import current PoB → (a) best-affordable rare chest + rare belt, (b) QH +
  Leash with your realistic duration. Compare **effective HP (with block), phantasm count/uptime,
  and VD DPS**. On a thin pool, block+phantasm-survival may beat raw ES — but only if uptime holds.

## Prototype deep-dive B — Guardian's Blessing (your triggered-skill worry is unfounded)

You worried GB is awkward because phantasms are trigger-summoned. **That's not how GB wires.** GB
supports an **aura** (the "cannot support triggered skills" clause applies to *that aura*, not to
your minions). You link **GB + a normal aura** (e.g. Determination / Grace / a Herald) in a 2-link;
your **existing phantasms carry it and share it to you with zero reservation**; the cost is the
built-in **ES-as-physical degen** while the aura is on you. So:
- **Feasible now** — you already keep a permanent phantasm army; they're the carriers.
- **The real cost is the ES degen**, which fights your already-thin ES — so pair it with Stage-2
  recovery first, and prefer it to free reservation for a *defensive* aura (Determination/Grace)
  rather than adding offense you can't afford to bleed for.
- **Verdict:** medium priority, *after* the defensive floor — then it's a reservation-free
  Determination/Grace, which is a strong pool/mitigation swing. Prototype in PoB alongside the
  degen number before committing sockets.

## Shopping list — thresholds anchored to your ~5–6d liquid (+CSV)

Ordered by ROI. "Buy ≤ / Skip >" are **decision thresholds**, not quotes — confirm live (below).

| # | Item | Why | Buy ≤ | Skip > |
|---|---|---|---|---|
| 1 | **VD of Seething** transfigured gem | 210% vs 170% eff. on the flat packet | ~5–20c | 1d |
| 2 | **Congregation Support** gem (replaces Meat Shield) | +phantasm cap = +Black Cane stacks | ~5–15c | 0.5d |
| 3 | **Medium cluster (minion, ilvl 68+) w/ Blessed Rebirth** | phantasm damage-immunity window | ~0.3–0.5d | 1d |
| 4 | **Corpse-consumption recovery tattoo(s)** | passive recovery on a loop you already run | few c each | — |
| 5 | **Leveled Cold Penetration** (to 20/21) + **Frostbite**/Wave-of-Conviction cold-exposure | biggest *offense* lever left (`07`) | ~5–30c gems | — |
| 6 | **2–3 rare slots: ES + chaos res + ele res** (boots/rings/amulet) | fix 1,624 unreserved-life shell, chaos res, caps | ~0.3–0.8d ea | 1.5d ea |
| 7 | **Watcher's Eye — "Discipline: gain ES per enemy hit"** (1-mod ok) | best recovery/cost for a channeller | ~1–2d (1-mod) | 4d |
| 8 | **Queen's Hunger + Leash of Oblation** | Stage-3 experiment — price both, test vs rare chest | compare vs ~2–4d rare chest | — |

**Sell now (your CSV):** Golden Oil (~344c) + 2× Cartography Scarab of Risk (~374c) = ~718c ≈ 3.6d,
plus your 1d + 254c → ~5.8d liquid, as you scoped. **Hold** Entropic/BBoU pieces, Congregation
(buy the *support gem*, not premium jewels yet), Ward gear, luxury crit jewels — matches your "not
yet" list. Keep ~1d liquid for crafting/mapping mistakes.

**Suggested first spend (~5–6d):** Stage 1 items #1–#4 (~0.5–1d) → #5 pen (~0.3d) → #6 two rare
slots (~1–1.5d) → hold #7 reserve (~1–2d) for a compelling ES-on-hit WE listing → keep ~1d liquid.
Defer #8 until after you re-import the improved PoB and run the QH-vs-rare test.

## How to get exact live prices (since I can't fetch them)

For each priceable line, open the trade site (you're logged in, league = Curse of the Allflame)
and set these filters — or paste me the resulting listings/JSON and I'll parse asking-prices and
apply the thresholds:
- **Uniques (#8, Watcher's Eye base):** Search by name → sort by price → read the cheapest ~10.
- **Watcher's Eye (#7):** name "Watcher's Eye" → add explicit mod filter *"#% of Damage Leeched as
  Energy Shield ... while affected by Discipline"* / *"Gain # Energy Shield ... on Hit while affected
  by Discipline"* → 1 min value → sort price.
- **Cluster (#3):** Type "Medium Cluster Jewel", item level ≥ 68, enchant/notable filter
  **Blessed Rebirth**, added-passives 4–5 → sort price.
- **Rares (#6):** base with ES + "+#% Chaos Resistance" + two ele-res mods, min values to taste.

If you paste any of these result sets, I'll turn them into a concrete buy list with exact numbers.
