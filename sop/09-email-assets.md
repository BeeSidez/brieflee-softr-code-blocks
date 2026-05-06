# Email assets — URLs, images, UTM tracking

How to source visuals for Brieflee email templates, what URLs/CTAs the templates expect, and how to tag every link for tracking. Replaces the old per-day icon table that pointed at the legacy "Help Icons" Cloudinary set — those were stickers being misused as heroes. See **Asset rules** below.

---

## Asset rules — how to pick visuals for an email

**Single source of truth:** `docs/assets-images-gifs-videos.csv` (in this repo). Every row maps an asset filename → Cloudinary URL → tags. Filter by `type` and `slug` to find candidates. Companion skill: `brieflee-assets`.

**Hero-eligible asset categories** (use ONE of these for the big visual at the top of an email or the lead image of a feature section):

| `type` in CSV | What it is | When to use |
|---|---|---|
| `feature-card` | UI mockup screenshots showing the actual product | DEFAULT for product/feature emails. Match by slug — e.g. `three-review-modes-feature-graphic-blue`, `customizable-quality-thresholds-feature-graphic`, `swipe-tablet-swiped-videos-search-list-blue-bg`. |
| `hero` | Purpose-built hero banners | Cross-product / brand-led emails. Includes the animated blue gradient and the three-vertical-videos-overlapping mp4. |
| `demo` | Screen recordings, walkthroughs (mp4) | Founder emails, "watch how it works" sections. |
| `illustration` | Large flat illustrations (rocket, fire, magnifying glass) | When the message is metaphorical, not product-specific. |
| `ad` | Full-bleed ad creative (photo / character) | Re-engagement, story-led emails. |

**Inline-accent categories — NEVER use as hero**:

| `type` in CSV | What it is | When to use |
|---|---|---|
| `engraving` | 3D emoji-equivalents on grey/white (champagne, brain, lightbulb) | Inline next to a list item or feature bullet. |
| `icon` | Sticker-style line icons in pink/blue circles, all `sticker-*` slugs | Inline accents, list bullets, secondary punctuation. |
| `app-icon` | Square / rounded-square app launcher | Favicon contexts only. |

> Stickers and engravings are Brieflee's branded equivalent of emojis. Putting one as a 200×200 hero is the same visual mistake as a 📧 emoji at the top of an email. Hero slot = `feature-card` / `hero` / `demo` / `illustration` / `ad`. Inline accent = `engraving` / `icon` / `app-icon`.

**Type-first emails (no hero image at all)** are correct when the message is utility — activation, payment-success, password-reset, etc. The big "Spell check / for video" type lockup IS the hero. See `bl-7day-d0-activate.html` for the canonical pattern.

**Logo (header):**
- Light backgrounds → `brieflee_logo_brieflee-wordmark-deep-blue-with-periwinkle-lee-and-smile_2025-03.png`
- Dark/colour backgrounds → `brieflee_logo_brieflee-wordmark-white-on-transparent-horizontal_2025-06.png`

**URL pattern:** versionless Cloudinary URLs with auto-format/quality:
```
https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/<public_id>.<ext>
```

---

## CTA URLs — Mustache variables in templates

| Placeholder | What it does | Suggested URL | Used in templates |
|---|---|---|---|
| `cta_dashboard` | App home | `https://www.brieflee.co/new` | bl-7day-d1-welcome, bl-tx-payment-success |
| `cta_brand_bio` | Brand bio settings | `https://www.brieflee.co/settings#tab1` | bl-7day-d1-welcome, bl-7day-d2-getting-started, bl-trial-create-account |
| `cta_thresholds` | Quality thresholds | `https://www.brieflee.co/settings#tab4` | bl-7day-d1-welcome, bl-7day-d4-quality-thresholds |
| `cta_review_mode` | AI review mode picker | `https://www.brieflee.co/settings#tab1` | bl-trial-pick-review-mode |
| `cta_swipe_files` | Swipe files library | `https://www.brieflee.co/videos` | bl-7day-d1-welcome, bl-7day-d5e1-remix |
| `cta_quick_review` | Start a quick review | `https://www.brieflee.co/videos?modal=%2Freview` | bl-trial-first-review |
| `cta_briefs` | Briefs list | `https://www.brieflee.co/project` | bl-7day-d3-mastering-brief |
| `cta_campaigns` | Campaigns list | `https://www.brieflee.co/project` | bl-7day-d3-mastering-brief |
| `cta_team_invite` | Team invite page | `https://www.brieflee.co/settings#tab3` | bl-7day-d6e1-team-collab |
| `cta_bulk_briefs` | Bulk import briefs | `https://www.brieflee.co/briefs` | bl-7day-d7e1-bulk-upload |
| `cta_bulk_videos` | Bulk import videos | `https://www.brieflee.co/bulk` | bl-7day-d7e1-bulk-upload |
| `cta_affiliate` | Affiliate dashboard | `https://www.brieflee.co/settings#tab5` | drip closing emails |
| `cta_upgrade` | Upgrade plan page | `https://www.brieflee.co/upgrade?promo={{promo_code}}` | bl-7day-d5e2-48h, bl-7day-d6e2-24h, bl-7day-d7e2-trial-ends |
| `cta_book_demo` | Sales rep calendar | `https://cal.com/brieflee/demo` | bl-7day-d1-welcome, bl-7day-d4-quality-thresholds |
| `cta_book_bev` | Bev's personal calendar (founder variant only) | `https://cal.com/bev` | bl-7day-d1-founder |
| `cta_bev_swipe` | Bev's personal swipe board (founder P.S.) | `https://www.brieflee.co/u/bev/swipe` | bl-7day-d1-founder |
| `cta_manage_subscription` | Subscription / billing | `https://www.brieflee.co/settings/billing` | bl-tx-payment-success |
| `cta_update_payment` | Stripe Customer Portal session URL | Generated per-user via Stripe API; fallback `https://www.brieflee.co/settings/billing` | bl-tx-payment-failed |
| `cta_accept_invite` | Accept team invite | `https://www.brieflee.co/login` | bl-tx-team-invite |
| `activation_url` | One-time activation link (per-user) | Generated per-user by `BL \| New Signup` workflow | bl-7day-d0-activate |
| `cta_terms` | Terms & conditions | `https://www.brieflee.co/terms` | bl-7day-d0-activate footer + others |
| `cta_privacy` | Privacy policy | `https://www.brieflee.co/privacy` | bl-7day-d0-activate footer + others |
| `unsubscribe` | One-click unsubscribe | Auto-handled by EmailIt — don't set manually | All marketing emails (NOT transactional) |

**Notes:**
- Transactional emails (`bl-7day-d0-activate`, `bl-tx-payment-failed`) MUST NOT include an `unsubscribe` link — required for inbox placement.
- For `cta_update_payment`, generate a per-user Stripe Customer Portal session in the workflow and pass as a variable. The static `/settings/billing` link is a fallback.
- For `cta_upgrade`, append `?promo={{promo_code}}` so the upgrade page pre-fills `TRIALUPGRADE` / `LASTCHANCE` / `FINALDAY` per the trial countdown spec.

---

## UTM tracking — every CTA, every email

Every clickable link in every email gets UTM params so analytics attribute clicks back to the source email. Pattern hardcoded in the HTML template:

```
?utm_source=emailit&utm_medium=email&utm_campaign=<template-alias>&utm_content=<slot-name>
```

| Param | Value | Notes |
|---|---|---|
| `utm_source` | `emailit` | Always — identifies the channel |
| `utm_medium` | `email` | Always |
| `utm_campaign` | template alias (e.g. `bl-7day-d1-welcome`) | Hardcoded into the template's HTML — same for every CTA in the email |
| `utm_content` | slot name (e.g. `hero_book_demo`, `section1_open`, `section3_swipe`) | Different per CTA inside the same email — lets you see WHICH button was clicked |

**Worked example** — welcome email's hero "Book a demo" button:
```html
<a href="{{cta_book_demo}}?utm_source=emailit&utm_medium=email&utm_campaign=bl-7day-d1-welcome&utm_content=hero_book_demo">
  Book a demo
</a>
```

**If the CTA URL already has query params** (e.g. `cta_upgrade` resolves to `https://www.brieflee.co/upgrade?promo=TRIALUPGRADE`), append UTMs with `&` instead of `?`:
```html
<a href="{{cta_upgrade}}&utm_source=emailit&utm_medium=email&utm_campaign=bl-7day-d5e2-48h&utm_content=hero_upgrade">
```

Or — cleaner — have the workflow build the final URL with UTMs already attached and pass it in as `{{cta_upgrade_tracked}}`. Pick one pattern per template and stick to it.

**Suggested `utm_content` slot names** (for consistency across templates):
- `hero_<action>` — primary CTA in the hero
- `section<N>_<action>` — CTA in a feature section (e.g. `section3_swipe`)
- `section<N>_image` — when the image itself is wrapped in a link
- `secondary_<action>` — text-link CTAs ("Book a 10-min call")
- `footer_<action>` — footer links if tracked

---

## Suggested template HTML pattern

```html
<!-- Header with logo -->
<img src="https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_logo_brieflee-wordmark-deep-blue-with-periwinkle-lee-and-smile_2025-03.png" alt="Brieflee" height="28">

<!-- Type-first hero (no image needed for utility/transactional) -->
<h1>Welcome to <span style="color:#879CF7;">Brieflee.</span></h1>

<!-- Feature section with REAL UI mockup as hero -->
<img src="https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_feature-card_three-review-modes-feature-graphic-blue_2025-12.png" alt="Brieflee three review modes — autonomous, hybrid, manual" width="504">

<!-- Primary CTA with UTMs -->
<a href="{{cta_dashboard}}?utm_source=emailit&utm_medium=email&utm_campaign=bl-7day-d1-welcome&utm_content=section1_open">Open Brieflee →</a>

<!-- Inline accent — engraving / sticker IS the right call here -->
<img src="https://res.cloudinary.com/dchroynzv/image/upload/f_auto,q_auto/brieflee_engraving_thumbs-up-line-icon_2025-07.png" alt="" width="24"> Approved
```

---

## Reference

- `docs/assets-images-gifs-videos.csv` — every Brieflee asset, tagged
- `brieflee-assets` skill — interactive helper for asset selection
- `sop/10-brand-colours.md` — palette
- `sop/08-email-matrix.md` — every template, when it sends
- `sop/07-emailit-curl-reference.md` — how the workflow Call API steps fire each template
