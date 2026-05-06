# Brieflee Design System

> Brieflee is "Spell Check for Video" — an AI computer-vision tool that reviews
> creator content against your brief. Brands and agencies upload UGC,
> influencer, founder, employee, and customer videos; Brieflee scores every
> asset in seconds against thresholds the brand sets (hook timing, audio
> quality, content relevance, length, product visibility, brand mentions, and
> a 26-item QA checklist). Approve, reject, or send revision notes — without
> watching every video yourself.

This design system contains the visual foundations, brand assets, type & color
tokens, content rules, and high-fidelity UI kit needed to make production or
throwaway designs that look indistinguishable from real Brieflee surfaces.

---

## Sources

The contents of this system were derived from these inputs. None of them are
linked at runtime — everything Brieflee was distilled into local files.

- **Mounted local images folder** — `images/2025/` and `images/2026/` (345+
  brand assets: logos, app icons, illustrations, "engraving" 3D illustrations,
  feature cards, product screenshots, animated GIFs, ads, social posts).
- **GitHub repo** — `BeeSidez/brieflee-softr-code-blocks`
  - `docs/brand-guidelines.md` — color palette, component patterns, do/don't.
  - `sop/10-brand-colours.md` — locked source-of-truth hex values.
  - `app/bulk-import-briefs-v10.jsx` — production code-block built on shadcn
    primitives (`@/components/ui/{button,badge,select,checkbox,input,textarea}`)
    and `lucide-react` icons. Reference for how Brieflee composes interfaces
    and the tokens its app actually uses (`bg-primary`, `text-primary`,
    `rounded-2xl`, `border-dashed`, etc.).
  - `app/bulk-import-videos.jsx` — same.
  - `CHANGELOG.md` — history of brand decisions.
- **Live site** — `www.brieflee.co` (the periwinkle hero gradient
  `#ECF0FF→#879CF7` and navy text `#001364` are pulled from there).

---

## Index

```
README.md                  ← you are here
SKILL.md                   ← cross-compat with Claude Code Skills
colors_and_type.css        ← all CSS vars + semantic type classes
fonts/                     ← (none — Plus Jakarta Sans loaded from Google Fonts)
assets/
  logos/                   ← primary marks, app icons, lockups, beta tag
  icons/                   ← flat sticker-style brand icons (sparkles, etc.)
  illustrations/           ← cartoon stickers (rocket, fire, eyes, bullseye)
  engravings/              ← signature 3D engraving-style render illustrations
  hero/                    ← animated hero banner GIF
  brand/                   ← isometric smiley, marketing assets
  screenshots/             ← real product screens + feature-card mockups
preview/                   ← cards rendered in the Design System tab
  type-display.html
  type-body.html
  ...etc
ui_kits/
  app/                     ← Brieflee app · shadcn-style dashboard
    README.md
    index.html
    Sidebar.jsx · TopBar.jsx · BriefCard.jsx · ReviewTable.jsx ...
  marketing/               ← Brieflee marketing site
    README.md
    index.html
    Hero.jsx · FeatureGrid.jsx · CTA.jsx ...
```

---

## CONTENT FUNDAMENTALS

How Brieflee writes copy. Use these rules in any UI string, ad, email, or
social asset. The voice is consistent from the landing page hero down to a
button label.

### Voice & vibe

- **Clean, minimal, professional.** Brieflee is a B2B SaaS for marketing
  managers and agency operators reviewing dozens-to-hundreds of UGC videos.
  The tone leans utility-software, not creator-economy hype.
- **Confident and concrete.** Every line says what the product does, not what
  it "empowers." Copy is short, punchy, and benefit-led.
- **Friendly second person.** Reader is "you"; product is "Brieflee" (not
  "we"). Every CTA is something *you* do: "Try it for free," "Watch demo,"
  "Upload content."

### Casing

- **Sentence case for headings** — "Spell check for video," "Reviewed
  content," "Smart rewards." Title Case is reserved for the wordmark and
  proper nouns.
- **CTAs use sentence case too** — "Try free for 7 days," "Watch demo,"
  "Bulk import briefs."
- **All-caps eyebrow pills** — short labels above headlines, e.g.
  "SPELL CHECK FOR VIDEO," "AUTOMATED UGC MODERATION." Letter-spacing 0.08em.

### Punctuation

- **No em dashes anywhere.** This is a hard rule from `docs/brand-guidelines.md`:
  "DON'T use em dashes in any copy or AI-generated text." Use commas, periods,
  parentheses, or rephrase.
- En dashes for ranges only ("Day 3–6").
- Oxford comma is fine.
- **Headlines do not end with periods.** Subheads and sentences in body do.

### Specific examples

- Headline: **"Spell check for video"** — single line, sentence case.
- Subhead: **"Brieflee scores every asset in seconds against the thresholds
  you set."** — full sentence with period.
- Eyebrow: **"AUTOMATED UGC MODERATION"** — caps, no period.
- Primary CTA: **"Try it free for 14 days"** — sentence case, no period, no
  exclamation point.
- Secondary CTA: **"Watch demo"** — two words.
- Status badges: **"High quality," "Reviewed," "Pending."** Sentence case.
- In-app empty state: **"No briefs yet. Upload a CSV to create multiple
  briefs at once."** Two short sentences, plain language.

### What to avoid

- ❌ "Empower," "unlock," "supercharge," "revolutionize" — buzzwords.
- ❌ Exclamation points in headers or CTAs.
- ❌ "We help you …" — Brieflee speaks in second person, not first-person plural.
- ❌ Emoji in product UI. They appear in ads/social, not in the app.
- ❌ Em dashes anywhere.
- ❌ "Built with AI" / "Powered by AI" framing in headers — Brieflee just
  *does* the thing. AI is implementation detail, not the pitch.

---

## VISUAL FOUNDATIONS

The Brieflee surface is **light, periwinkle, and airy.** This is the brand's
single biggest contrast with sister product Creator Scans (which is dark,
TikTok-red, and creator-facing). Brieflee is for office workers reviewing
content; the surface should feel premium and easy on the eyes for long
review sessions.

### Color motif

- **Three layers of background**: page (`#FAFBFF`, near-white lavender),
  container (`#ECF0FF`, light periwinkle for sections / hero strips), card
  (`#FFFFFF`).
- **One canonical periwinkle for accents**: `#879CF7`. Used for the primary
  CTA, the eyebrow pill, and any "primary action" surface. The
  `#ECF0FF → #879CF7` gradient is the signature hero treatment.
- **Navy as gravity**: `#001364` on light, white on dark. Headings and bold
  metric values are always navy, never blue, on white surfaces. The blue
  `#294ff6` is for CTAs / data-viz / accents — it does not anchor headings.
- **No red accents.** Red is Creator Scans' territory; it never appears in
  Brieflee outside of destructive UI (reject, error).

### Type

Plus Jakarta Sans across the system — friendly geometric sans with humanist
edges, plays well in both display (-0.02em tracking, 800 weight) and dense
table UI (400, 14px). Fallback chain prefers Geist, then system-ui.

- Headings are **navy** (`#001364`), never blue.
- Body is `#333333` on white, `#001364` on periwinkle (text on periwinkle is
  always navy, never white — the brand reads light).
- Eyebrow pills are uppercase, +0.08em tracking, periwinkle bg, white text.

### Backgrounds & surfaces

- Marketing pages: page bg `#FAFBFF` with full-width hero strips in
  `#ECF0FF→#879CF7` linear gradient (top→bottom).
- App: page bg `#FAFBFF`, panels white with subtle `#D6DEFC` border or
  `shadow-sm`.
- Hero illustrations are placed inside a soft circle of `#879CF7 @ 20%` or
  `#D9E0FF` — the "lavender glow" pattern.
- Feature cards (square 1080×1080 marketing tiles) layer one product
  screenshot inside a gradient frame, often with one engraving illustration
  overlapping a corner. See `assets/screenshots/feature-*.png`.

### Imagery — TWO distinct illustration systems

This is one of Brieflee's most distinctive moves: it runs **two parallel
illustration styles** for different purposes.

1. **Flat sticker / cartoon icons** (`assets/icons/`, `assets/illustrations/`).
   Periwinkle + blue with a thick white stroke, soft drop shadow, slightly
   rotated for energy. Used for product feature thumbnails and onboarding.
   Examples: `ai-sparkles.png`, `magnifying-glass.png`, `looking-eyes.png`,
   `rocket.png`, `bullseye.png`. Bright cartoon vibe.
2. **Engraving 3D illustrations** (`assets/engravings/`). Black-and-white
   detailed pen-engraving renders on a soft grey background, sometimes with a
   single periwinkle accent ring. Used for editorial / blog / "spot
   illustrations" in marketing. Examples: `engraving-clapboard.png`,
   `engraving-iphone-tripod.png`, `engraving-diamond.png`,
   `engraving-brain.png`. Premium editorial vibe.

When picking imagery: stickers for product UI accents and signups; engravings
for marketing pages, blog posts, and feature explainers.

### Iconography (functional, in-app)

- **lucide-react** is the in-app icon family. Confirmed from
  `app/bulk-import-{briefs,videos}.jsx` — every UI affordance icon is lucide
  (`ArrowRight`, `FileText`, `ChevronRight`, `AlertCircle`, `Check`, `X`,
  `DownloadCloud`, `Video`, `ChevronDown`, `ChevronUp`).
- Icons are 16px (`w-4 h-4`) inline with text, 14px (`w-3.5`) inside
  table-row buttons, 24-32px (`w-6 h-6` / `w-8 h-8`) in feature affordances.
- Stroke weight 1.5-2 (lucide default).
- Icon color matches surrounding text or `var(--bl-blue)` for accent.
- **No emoji in product UI.** Emoji appear only on social posts and ads.

### Animation

- Brieflee uses **gentle, opacity-led transitions**: `transition-all`
  ~200ms, occasional `scale-[1.02]` on drop-zone hover. Nothing bouncy.
- Scrub-style demo animations for marketing GIFs (`assets/hero/animated-hero.gif`,
  `assets/screenshots/animated-app-demo.gif`).
- Logo lockup has a tasteful "blinking eyes" mark animation (the smiley face).
- Easing: `cubic-bezier(0.32, 0.72, 0, 1)` (Apple-spring-out) is the house
  curve. Defined as `--bl-ease`.
- Step-indicator dots fill with primary, ringed `ring-4 ring-primary/20` on
  current step — see briefs import block.
- Toasts via `sonner`.

### Hover & press

- **Hover on cards / buttons**: subtle bg shift (`hover:bg-primary/5` or
  `hover:bg-muted/40`), occasional `hover:shadow` lift.
- **Hover on dashed drop zones**: border darkens to `border-primary/50`,
  bg fills `bg-primary/5`, scales `scale-[1.02]`.
- **Press**: not visually distinct — buttons rely on color shift only. No
  pronounced shrink or shadow inset.
- **Focus**: subtle ring `ring-2 ring-primary/30 ring-offset-2`.

### Borders, shadows, corner radii

- **Cards**: `rounded-xl` (12px) or `rounded-2xl` (16px). Border is either
  none or `1px solid var(--bl-border)` (#D6DEFC). Shadow is `shadow-sm` or
  none. Brieflee cards are flatter than typical SaaS — they trust whitespace
  to do the framing.
- **Pills / badges**: `rounded-full` always. `px-4 py-1.5`.
- **Inputs**: `rounded-lg` (8-10px). `1.5px` border, `border-input` (greyish
  periwinkle) → `border-primary` on focus.
- **Buttons (primary)**: `rounded-lg`, periwinkle bg, white text, no border.
  Optional right-arrow icon. Subtle `shadow-sm` lift.
- **Modals / drop zones**: `rounded-2xl`, `border-2 border-dashed` on empty
  states.

### Layout rules

- **Generous whitespace.** Brieflee leans into breathing room — minimum 24px
  gutters between major sections, 64-96px between hero blocks. Container
  width caps at ~1200px on marketing, ~1280px in app.
- **Step indicator** is centered horizontally above multi-step flows.
- **Sticky topbar + left rail sidebar** in the app (40-56px wide rail with
  icon-only nav).
- **Tables** are full-width inside a `rounded-xl border` wrapper with a
  `bg-muted/60` header row.
- **Tweak** color usage: keep periwinkle as the *only* loud color; lean on
  navy for gravitas and grey-borders for everything else.

### Transparency, blur, gradient

- Hero gradient: `linear-gradient(180deg, #ECF0FF 0%, #879CF7 100%)`.
- Subtle alpha-tints for hover (`primary/5`, `primary/10`) and ring
  (`ring-primary/20`).
- Backdrop-blur is **not** part of the brand — Brieflee is solid surfaces
  not glassmorphism.
- Alpha-overlay on imagery: never. Photos used (in ads) are unfiltered.

---

## ICONOGRAPHY

Brieflee uses **lucide-react** as its in-product icon system (loaded from CDN
in this design system as `https://unpkg.com/lucide@latest/dist/umd/lucide.js`
or per-icon SVGs). All UI affordances — chevrons, checks, X, dropdown, file,
video — are lucide. Stroke 1.5-2, 16-24px, currentColor.

Beyond lucide, Brieflee has **two parallel custom illustration systems** —
see VISUAL FOUNDATIONS above. Both are real PNGs in `assets/`, never inline
SVG. Picking which to use:

- **Inline UI icon, accent on a button or row** → lucide.
- **Hero feature affordance, "look at this thing"** → flat sticker
  (`assets/illustrations/`, `assets/icons/*.png`).
- **Editorial / blog / marketing spot** → engraving
  (`assets/engravings/`).
- **Logo / app icon** → `assets/logos/`.

**Emoji**: not used in product UI. Used sparingly on social and ad copy
(e.g. "🚀" on a launch post). Do not introduce emoji into in-app strings.

**Unicode characters as icons**: not used. Brieflee has enough custom
imagery that it never falls back to ↗ → ✓ etc.

The made-with-brieflee badge (`assets/logos/made-with-brieflee.svg`) and the
"Powered by Brieflee" lockup are available for partner / agency contexts.

---

## File index

Root manifest of this design system:

- `README.md` — this document
- `SKILL.md` — invoke this folder as a Claude Code Skill
- `colors_and_type.css` — drop-in CSS variables + semantic type classes
- `assets/` — logos, icons, sticker illustrations, engravings, hero GIF, screenshots
- `preview/` — token + component specimens that populate the Design System tab
- `ui_kits/marketing/` — React recreation of brieflee.co (Nav, Hero, FeatureGrid, FeatureRow, Stats, CTA, Footer)
- `ui_kits/app/` — React recreation of the Brieflee app (Sidebar, TopBar, ReviewTable, ScoreCell, BriefCard, Dropzone)
