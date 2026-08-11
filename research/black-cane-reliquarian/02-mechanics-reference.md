# 02 — Mechanics reference (validated + corrections)

Confidence: **H** = GGG/wiki-grade, corroborated · **M** = content-farm corroborated /
directionally certain · **L** = single-source / inference. All primary sites were
network-blocked; see sourcing caveat in `README.md`.

## 1. Phantasmal Might / The Black Cane — the flat packet

- The Black Cane (base unique, **Royal Sceptre**) grants *Phantasmal Might*: flat Added
  **Physical** Damage to Spells **per active Phantasm**; **~44–66 per phantasm** at a
  ~lvl-21 Summon Phantasm (scales with Summon Phantasm **gem level**). **Dual-wielding
  does NOT stack the buff.** [H]
- 3.29 Reliquarian ascendancy reportedly grants this as a notable ("Black Cane"), so you
  get it **without holding the sceptre** → frees the weapon slot for Soulwrest. [M]
- Illustrative endgame: ~62 phantasms → **~2,976–4,588 (≈3,782 avg) added phys to
  spells.** The 62 / ~4,000 figures are **content-farm marketing** — treat as ballpark. [L]
- **The gem-level double-dip:** per-phantasm flat *and* phantasm cap both rise with
  Summon Phantasm gem level → near-quadratic. Best lever = **+levels to the socketed
  Summon Phantasm *Support*** (via `+2 socketed support/minion` body armour, gem
  corrupts). **Empower and Soulwrest's innate skill do NOT benefit** (item-granted skills
  ignore +levels; Empower supports skills not supports). ⚠️ Unconfirmed: whether the buff
  reads the socketed-support level or the highest phantasm instance. [M / ⚠️]

## 2. It applies to / it does NOT apply to

"Added Physical Damage to Spells" is a **character** stat: [H]
- **Applies fully** to: triggered spells (CoC/CwC/CwDT/Cast-on-Stun), **spell totems**,
  **traps/mines** (spells). Applied **per hit**.
- Does **NOT** apply to: **minions/phantasms' own hits** (separate entities), attacks,
  physical **DoT** (Exsanguinate/Reap degens use only their hit portion).
- **Arrives as physical** → conversion is required to scale it with elemental mods.

## 3. Volatile Dead uses the packet (correction)

- VD is **added-damage-driven** (~150–210% effectiveness of added damage), **not**
  corpse-max-life %. So the flat physical **is added to VD's hit**, then the meta
  **converts 100% phys→cold** (Hrimsorrow alone — see below) and scales cold + Cold Pen +
  crit. Confirmed: *"~2,976–4,588 added physical to every Volatile Dead ball… converted to
  cold."* [H/M]
- **[VERIFIED, network-open session] Best packet vehicle = Volatile Dead of Seething:** poedb
  gives it **210% effectiveness of added damage** (vs regular VD 170%) plus "orb explosions
  25% more damage." Effectiveness is the multiplier on the Phantasmal Might flat → Seething is
  strictly the best flat-packet carrier. Use it over regular VD.
- **[CORRECTION, verified] Hrimsorrow = 100% phys→cold**, not 50% (poedb `/us/Hrimsorrow`,
  corroborated by the user's PoB item text). Conversion is fully solved by the gloves alone; a
  second conversion source is redundant. Watcher's Eye Hatred is therefore a **cold-pen / added
  cold** pick, not a conversion pick.
- **Correction:** an earlier audit claimed VD "ignores the flat phys because it's fire" —
  **false.** Added phys applies before conversion; VD is *the* meta precisely because it
  cashes the packet.
- **Detonate Dead (all variants) & Bodyswap deal corpse-max-life % damage that DOES
  ignore the packet** — good corpse consumers, useless as damage vehicles. **Cremation**
  is hit-based and carries the packet (weaker phantasm sustain: 1 corpse/cast vs VD's 3). [H]

## 4. Blade Vortex + Blade Blast of Unloading (Plan B)

- **Blade Blast of Unloading** detonates BV blades **sequentially ("in turn")** → each
  detonation is a **separate hit/activation**, so vs a single boss you get **N hits, each
  carrying the full packet** (250% eff × ~5% more/blade). GGG's anti-shotgun rule only
  bans *simultaneous overlap within one activation*; sequential detonations are allowed.
  Proven by the skill's history as a single-target poison boss-killer. [H]
- **Use REGULAR Blade Vortex (10 blades), NOT "of the Scythe" (1 blade).** Of-the-Scythe
  breaks the per-blade Unloading premise. Regular BV is physical → keeps Impale. [H]
  - *Correction:* earlier notes recommended "of the Scythe" to stay physical — wrong;
    regular BV is already physical.
- BV 3.29: per-blade damage/hit-rate **nerfed 35%→30%**, base **crit 6%→10%**. That 10%
  is likely where a mistaken "Blade Blast 10% crit" claim came from (BB base ≈ 6%). [M]
- **Consumes ALL blades on detonation** → DPS stat is **blade throughput** (generation =
  consumption), capped by the 10-pool. Without Saboteur Triggerbots, generation is
  Arcanist Brand + Brand Recall only → **~⅓–½ throughput**, bursty restack cadence
  (~1.5–2 detonation events/sec of ~10 hits ≈ ~12–15 detonation-hits/sec + ~7 BV
  ticks/sec on the manual/max-DPS play). [M]

## 5. Impale (Plan B enabler)

- **Entropic Devastation = unique GLOVES** (Assassin's Mitts): *"Critical Strikes with
  Spells inflict Impale"* + *"(30–50)% increased Effect of Impales inflicted with
  Spells."* Impale is natively attack-only, so these gloves are the **sole** enabler of
  spell Impale → **hard-gates Plan B behind crit + this glove.** [H]
  - *Correction:* earlier notes called Entropic Devastation a support/notable — it's gloves.
- Impale: stores **10% of the hit's pre-mitigation physical** per stack, released over the
  next **5 hits (or 8s)**, **max 5 stacks**. On release it's re-mitigated but boss armour
  is negligible so it lands ~90%+. Bounded ~50%+ "more" physical. Scales only with
  Impale-effect and max-stack count. Without Champion (Scion has no Master of Metal) it's
  the "poor man's" version (gem ~59% + gloves 50%). [H]

## 6. Boss armour / physical mitigation (Plan B is fine here)

- PoE1 monster armour is tiny (**~983 max**). Formula `DR = A/(A + 5·Damage)`, cap 90%. A
  **15k–18k hit loses only ~1–3%** to a pinnacle boss. [H]
- **No physical penetration stat exists** in PoE1. **Overwhelm** became "chance to ignore
  PDR" in 3.25 (useless vs bosses, only vs armoured rares/map mods). **Armour Break is
  PoE2-only.** [H]
- The real phys "pen" is the **Vulnerability** curse (increased phys taken). Cold's edge
  over physical is **freeze/shatter + deeper scaling ecosystem**, NOT armour. [H]

## 7. Conversion vs gain-as-extra ordering (chaos/cold routing)

- Conversion chain: `Physical → Lightning → Cold → Fire → Chaos` (one direction). [H]
- **Skill/gem conversion is applied first and is NOT scaled down** when total >100%; gear
  conversion fights over the remainder. Converted damage **remembers its origin** (scaled
  by *both* the original and destination "increased" buckets = double-dip). [H]
- **"Gain X% of physical as extra [type]" reads the ORIGINAL pre-conversion physical
  base** — orthogonal to conversion, doesn't compete. Optimal recipe: **push conversion
  to 100% first (kill residual phys), then pile gain-as-extra on top.** [H]

## 8. Freeze as defense (Plan A)

- Freeze needs a cold hit ≈ **5% of the target's ailment threshold**; sub-0.3s freezes are
  discarded. Trash/most rares freeze & **shatter** (deletes corpses → no on-death
  detonations = real clear defense). **Bosses have inflated thresholds → effectively
  unfreezable** without dedicated freeze scaling. So freeze is a **clear/rare** defense,
  **not** a boss defense. [H mechanic / M thresholds]

## 9. Damage-shift stacking (defensive shells)

- All "X% of [type] taken as [other]" apply **simultaneously to the original hit** and
  shift each portion **only once** (no chaining cold→fire→chaos). Must cap **every**
  destination type. Governs Dawnbreaker + Incandescent Heart + Chayula composition. [H]
