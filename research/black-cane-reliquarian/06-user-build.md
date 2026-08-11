# 06 — The user's character (for retrieval next session)

The whole point of the fresh session is to **read the user's actual build** and analyze it
against `01`/`03`. The user already has this character leveled: **Reliquary + Soulwrest +
Dark Monarch + a mid-ES shell.**

## Links the user shared (all network-blocked in the research session)

- **poe.ninja profile:**
  `https://poe.ninja/poe1/profile/floAr-6143/allflame/character/floAr_Support`
- **PoB (pobb.in):** `https://pobb.in/eAT34Ikb6aXa`
  - raw code endpoint: `https://pobb.in/eAT34Ikb6aXa/raw`
- **PoB (maxroll):** `https://maxroll.gg/poe/pob/2wkoi0el`

## First action next session

Try fetching the pobb.in **/raw** endpoint (cleanest — returns the base64 PoB code
directly), or the poe.ninja profile. If they resolve, you're unblocked. If they still
return `EGRESS_BLOCKED`, the allowlist didn't apply — see "Network" below.

## Decoding a PoB code locally (if you must, e.g. user pastes it)

PoB codes are **URL-safe base64 → zlib → XML**. Decode:

```python
import base64, zlib
raw = open('pob.txt').read().strip()          # the base64 string, no whitespace
data = base64.urlsafe_b64decode(raw + '='*(-len(raw)%4))
xml  = zlib.decompress(data).decode('utf-8')  # header should be 78da
```

**Lesson learned:** hand-transcribing an 11.7k-char code into the sandbox corrupted it
(zlib failed at the first block). If the user must paste, have them **split it into 3–4
smaller chunks** across messages — those transcribe reliably — or fetch the /raw URL once
network is open. A text summary (ascendancy relics, main 6-link, Soulwrest sockets,
gloves + conversion, Watcher's Eye, uniques/jewels, Life/ES, phantasm count, tooltip DPS)
is the most robust fallback.

## Network (how the user grants access)

The environment's **egress proxy** blocks PoE sites via org policy (`403/407`). To allow:
in **Claude Code on the web → environment settings → Network access**, add a custom
allowlist with:

```
poe.ninja, pobb.in, maxroll.gg, pathofexile.com, poewiki.net, poedb.tw
```

then **start a new session** (policy applies at startup). Docs:
`https://code.claude.com/docs/en/claude-code-on-the-web`.

## What to extract and report (mapped to the framework)

1. Ascendancy relics taken (Black Cane + which others).
2. Main skill + full 6-link; what's in Soulwrest's sockets (Summon Phantasm Support +
   level + supports).
3. Gloves + conversion path (Hrimsorrow / rare / Watcher's Eye Hatred); is it 100% phys→cold?
4. Watcher's Eye mods; key uniques (Dark Monarch ✓) + jewels (timeless?).
5. Life/ES totals; CI / low-life / hybrid.
6. Phantasm count + main-skill tooltip/DPS.
7. Then answer: capturing the **gem-level double-dip**? conversion + cold-pen optimal?
   where is the **mid-ES** thin? top upgrades in order. (See `HANDOVER.md` step 4.)
