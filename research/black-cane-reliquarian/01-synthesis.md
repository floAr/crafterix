# 01 — Synthesis (bottom line)

> **Update (network-open session):** the user's actual PoB is decoded and analyzed in
> `07-user-build-analysis.md`; the staged upgrade plan + shopping thresholds are in
> `08-staged-plan-and-shopping.md`. Two corrections propagate from primary sources:
> **(a) Hrimsorrow is 100% phys→cold** (not 50% — conversion is already solved, so Watcher's
> Eye is a pen pick), and **(b) Phantasmal Might stacks per phantasm scaled by each phantasm's
> level** — so the "near-quadratic socketed-support double-dip" below is overstated; **phantasm
> COUNT is the real lever.** Read priority #1 through that lens.

**Chassis (locked by the user):** Scion Reliquarian · Soulwrest (2H) · The Dark Monarch ·
mid-ES.

## Headline

On this exact chassis, the honest recommendation **inverts the original theorycraft
ranking**:

- ✅ **Plan A — phys→cold Volatile Dead — is the right build.** It fully cashes
  Phantasmal Might (the flat physical is added to VD, then converted 100% → cold), plays
  as ~1 held key, fits sockets comfortably, and hands you freeze/shatter as a clear
  defense on a mid-ES shell.
- **Plan B — physical Blade Vortex + Blade Blast of Unloading + Impale — is the
  higher-ceiling enthusiast build** (the user's favorite) but this **non-Saboteur**
  chassis actively strains it. Viable, not optimal here.

Physical damage is *not* the problem (boss armour is a ~1–3% non-issue, see `02` §5).
Plan B's costs are **ergonomics + sockets**, not damage.

## The two approaches side by side

| | **Plan A — cold VD** ✅ | **Plan B — phys BB-Unloading + Impale** |
|---|---|---|
| Cashes Phantasmal Might? | Yes — added phys → VD, converted 100%→cold | Yes — stays physical, feeds Impale |
| Damage routing | phys→**cold** (Hrimsorrow/rare gloves + Watcher's Eye Hatred); scale cold + Cold Pen + crit | pure physical + Impale |
| Single-target ceiling | High, smooth | **Highest in theory**, but ~⅓–½ throttled here (no Saboteur Triggerbots) |
| Automation / keys | **~2–3 keys, one held Cyclone** | **~4 keys, 2 continuous spam**, whole engine on one fragile Arcanist Brand |
| Sockets (of 24) | ~16–18, **a 6-link to spare** | **~24, both 6-links spent + aura package cut** |
| Defense fit (mid-ES) | Comfortable; freeze/shatter = clear defense | Squeezed auras on a fragile base |
| Boss armour | n/a (cold) | Non-issue (~1–3%); physical is fine on defenses |
| Key enabler | Watcher's Eye Hatred (convert + cold pen) | **Entropic Devastation gloves** (spell-crit → Impale) |
| Verdict | **Recommended for this chassis** | Only if you want crit-phys single-target and accept the costs |

## The scaling spine (applies to BOTH approaches)

1. **⭐ The Summon-Phantasm gem-level double-dip — the single biggest hidden
   multiplier.** Per-phantasm flat **and** phantasm cap both scale with the Summon
   Phantasm gem level → near-quadratic. **Lever = the *socketed* Summon Phantasm
   *Support* gem** (Soulwrest's innate trigger ignores +levels/Empower), pushed by
   **"+2 to socketed support/minion gems" body armour + gem corruptions**.
   ⚠️ *Verify whether Phantasmal Might reads the socketed support's level or the highest
   phantasm instance (Soulwrest's innate ~25) — that decides whether +levels buy
   per-phantasm damage or only cap. See `04`.*
2. **Phantasm count *is* damage** — Dark Monarch doubling (✓) + Congregation Support +
   the separately-tracked socketed cap; minion **duration** raises average count.
3. **Conversion is mandatory** — the packet is physical. Plan A → cold; Plan B keeps it
   physical for Impale. **Controlled Destruction and any crit layer are mutually
   exclusive** — pick one per plan.

## Gearing priority (in order)

1. **+gem levels to the *socketed* Summon Phantasm Support** (the double-dip) — `+2
   socketed support/minion` body armour, gem corruptions.
2. **Max phantasm cap** — Congregation Support, Summon Phantasm Support level (Dark
   Monarch ✓ already).
3. **[A]** Watcher's Eye Hatred (phys→cold conversion + cold pen) · **[B]** Entropic
   Devastation gloves.
4. **Discipline Watcher's Eye "ES per enemy hit"** (defense — huge on a CwC channeler).
5. **[A]** cold pen / Cold Exposure (Wave of Conviction) / Frostbite → ~−80 to −120
   effective cold res · **[B]** crit multi + Power Charge on Crit.
6. Timeless jewel — **Militant Faith → Inner Conviction** (more spell dmg per power
   charge) if you can hold charges; **Glorious Vanity → Corrupted Soul** funds the mid-ES.

## What NOT to do

- Don't run **BV of the Scythe** for Plan B — it caps at **1 blade**; Blade Blast of
  Unloading needs regular BV's **10** blades. (Regular BV is already physical.)
- Don't build for **Overwhelm / physical penetration** vs bosses — no phys pen exists and
  boss armour is negligible; **Vulnerability** is your only real phys "pen" (Plan B).
- Don't stack **Original Sin** with Plan A cold — it forks the whole build to chaos.
- Don't use **Detonate Dead / Bodyswap** as the damage skill — they deal corpse-max-life
  % damage that **ignores** the flat packet (fine as consumers, useless as flat-packet
  vehicles). Only **Volatile Dead** (and secondarily **Cremation**) carry the packet.
