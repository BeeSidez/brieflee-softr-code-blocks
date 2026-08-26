# Sync progress

The mirror holds what is running on Softr right now. Softr is the source of
truth; where this repo and Softr disagree, Softr is right and this repo is
stale.

**13 of 130 vibe blocks mirrored.** `BLOCK-IDS.txt` carries the live block
ids so the run resumes without re-deriving anything, and `manifest.json`
lists every block across all 67 pages that have one.

## Mirrored

| Page | Block | File |
| --- | --- | --- |
| /getting-started | `39683182` | app/ |
| /set-up | `1de12b60` | app/ |
| /set-up/customize | `70a72dc3` | app/ |
| /verify-email | `078408c2` | app/ |
| /new quick-links | `306ec3c3` | app/ |
| /new workspace-switcher | `2483592c` | app/ |
| /checklist | `6bcbe18e` | app/ |
| /settings plans-and-billing | `da36cd46` | app/ |
| /plan trial-plans | `8e98d3ac` | pricing/ |
| /plan change-plan | `52239992` | pricing/ |
| /pricing tracker | `96353646` | pricing/ |
| /sign-up tracker | `ac6319fa` | website/ |
| Home tracker | `ab85b7c9` | website/ |

## What the pull cost is

`get_vibe_coding_block_code` returns the whole bound table schema alongside
the source, so a single block runs 10k to 30k tokens even when the code is
short. The three Referly trackers proved the mirror earns its keep: two are
byte-identical and the Home one carries a longer header, so no block can be
assumed to be a copy of another.

## Reading order for whoever picks this up

1. `USER-GROUPS.md` — what every gate actually checks
2. `STRUCTURE-FINDINGS.md` — disabled blocks, duplicate hrids, where gating lives
3. `PRICING-NOTES.md` — the pricing surface, already migrated
4. `app/settings__plans-and-billing__da36cd46.BUG.md` — a live bug with its fix
