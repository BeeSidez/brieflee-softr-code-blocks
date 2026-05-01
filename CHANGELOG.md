# Changelog

All notable changes to Brieflee infrastructure. Schema, workflows, code blocks, emails, SOPs.

Latest at top. Each entry: date · area · summary · link to commit/artifact where useful.

---

## 2026-05-01

- **Onboarding code · gate logic updated** in `onboarding/brieflee-chat` + `app/dashboard-chat` (byte-for-byte identical). Old gate read `users.payment_status` (broken billing chain) and `users.videos_remaining` (Ef7z6, removed during migration). New gate: `is_internal = true` bypasses; otherwise `subscription_status IN ('trialing','active')` AND `videos_remaining > 0`. New field added: `users.subscription_status` (id `SQuxf`, lookup via `accounts → current_subscription.status`). [commit 539ce9f](https://github.com/BeeSidez/brieflee-softr-code-blocks/commit/539ce9f)

- **EmailIt · 30 templates uploaded** to live EmailIt account. All using locked Brieflee design (periwinkle hero `#ECF0FF→#879CF7`, navy text `#001364`, periwinkle CTA + "Spell Check For Video" pill, 16px-cornered roadmap rows). Subject + HTML pushed via API for all 30 templates. Generator script saved at `emails/generator.py` so future copy edits in `emails/copy/*.md` regenerate automatically.

- **Email assets · brand colours locked** as `sop/10-brand-colours.md`. Source of truth for Brieflee visual surfaces.

- **Email assets · CTA URLs + Cloudinary mappings finalised** in `sop/09-email-assets.md`. 19 CTA placeholders mapped to live Brieflee URLs; 14 day-icon Cloudinary URLs mapped (12 from existing Help Icons set; days 3 + 6 still need new icons sourced).

- **Affiliate commission corrected**: 40% → 20% for 3 months across emails + spec + Referly API call body. Headlines just say "Earn 20%"; "for 3 months" lives in body details.

## 2026-04-30

- **Email matrix locked** at `sop/08-email-matrix.md` — every email categorised by audience automation vs transactional, with wait times + offer codes (TRIALUPGRADE / LASTCHANCE / FINALDAY).

- **EmailIt cURL reference** at `sop/07-emailit-curl-reference.md` — every EmailIt API action used by the workflows, ready to import into Softr Call API.

- **Email content drafted** for all 30 templates in `emails/copy/*.md`.

- **Schema · `accounts.team_emails` LONG_TEXT field added** (id `wIvhQ`). Replaces `team_email1/2/3` sequence — onboarding form parses comma/newline-separated up to 9 emails.

- **Schema · `accounts.logo_url` FORMULA field added** (id `nPI65`). Auto-derives Clearbit logo URL from `accounts.website` (strips https/www, takes everything before first `/`).

## 2026-04-29

- **EmailIt · 4 audiences + 30 templates created** via API. Audiences: `BL | Onboarding`, `BL | Subscribers`, `BL | Lapsed`, `BL | Team Members`. Template aliases all `bl-` prefixed. IDs at `docs/emailit-assets-2026-04-29.json`.

- **6 FigJam diagrams generated** for the workflows. Master overview + 5 per-workflow detail boards. Linked from `sop/01-workflow-architecture.md`.

- **SOP folder structure created** at `sop/`. 10 docs covering workflow architecture, EmailIt system, database schema, Stripe integration, deletion policy, test accounts, cURL reference, email matrix, email assets, brand colours.

- **`is_internal` checkbox added on users** (id `gdFt4`). Bypasses paywall + quota gates for staff and test users. Bev's user (`qjQjF66Q2sYGBa`) flagged.

- **Subscription backfill v3** completed. 14 accounts had `current_subscription` set from billing records. Then cleaned up to match Stripe truth (only Mohamad has an active sub). Final state: 1 subscription record. 75 inactive accounts will get fresh trial via re-engagement campaign.

- **Workflow architecture spec locked** at `docs/workflows-spec.md`. 5 workflows: New Signup, New Workspace+Team, New Stripe Sub, Sub Cancelled, Payment Failed. Trial timer anchors on account creation, not signup. 30/60/90 winback cadence then auto-delete on day 97.

## 2026-04-28

- **Schema migration completed**. Created `subscriptions` table (id `s7xluIUfztpBhY`); added `accounts.current_subscription` link (id `f5UWR`); rewired `usage` formulas to read through `accounts → current_subscription → plan` instead of the old `accounts → billing → pricing` chain. 9 broken lookups on accounts repointed.

- **Repo reorganised** into `onboarding/`, `app/`, `website/`, `docs/`. Code blocks moved into the right folders.

- **Schema snapshot** captured at `docs/schema-snapshot-2026-04-28.{md,json}`. 13 tables, 577 fields. Baseline before migration.

---

## Decisions pending implementation

### Onboarding streamline (decided 2026-05-01)

Bev's plan to overhaul the onboarding flow before relaunch:

1. **14-day trial for everyone, Studio plan, no card required** — already locked in workflow spec; will be enforced when `BL | New Workspace + Team` workflow goes live.
2. **Consolidate the chat into ONE code block** — currently `onboarding/brieflee-chat` and `app/dashboard-chat` are byte-for-byte identical. Make it one canonical block, used in both contexts. Drops maintenance overhead.
3. **Streamline account setup** — current pattern uses two blocks (one shows when website is populated, one when not) which is clunky. Replace with a single one-page setup that lets users get in quickly and refine settings afterwards. Move detailed config (thresholds, review modes, brand voice) to settings rather than blocking them in the wizard.
4. **Capture user type in onboarding** — add a question: are they a company / solo creator / agency / brand? Drives segmentation, future content tailoring, and possibly different drip variations.
5. **Re-engagement variant of the 14-day drip** — for existing users (the 75 dormant accounts in the system), don't put them through the same drip. Adapt to a re-engagement framing. To-do later, after streamline lands.

### Other deferred items

- Stripe Checkout success-redirect code block (instant subscription write, replaces broken webhook reliance)
- `paywall` + `upgrade` blocks updated to use the success-redirect pattern
- `screen-2` blueprint polling fix (replace 120s hardcoded timeout with polling on `account.blueprint_status = 'Complete'`)
- `screen-5` emoji reactions actually tracked (currently redirect-only)
- Day 3 + Day 6 email hero icons sourced (swipe files + remix — not in existing Cloudinary set)
- Onboarding form field validation: reject subdomain URLs to make Clearbit logo lookup work
- N8N → Softr native Gemini migration for brand blueprint generation
