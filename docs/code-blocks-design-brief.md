# Brieflee App — Design Brief for Code Blocks

## Core principle: this is the *app*, not the marketing site

The Brieflee app UI is deliberately **muted, minimal, and restrained**. The interface chrome stays neutral and quiet so that the *user's content* (video thumbnails, uploads) is the only place vivid color appears. On the Board page, for example, the thumbnails are colorful but every surrounding UI element — filters, labels, cards, icons — is understated. Code blocks should follow this same rule: they are functional UI, so they should recede, not compete. Avoid saturated fills, bold gradients, or decorative flourishes that would read as "marketing landing page."

## Color palette (from the theme)

The palette is a cool, soft, navy-and-periwinkle system on near-white backgrounds:

- **Accent:** `#879CF7` (soft periwinkle blue) — used sparingly for links, small icon badges, active/highlighted words, and primary buttons. It's a low-saturation blue, not a punchy brand blue.
- **Text:** `#001364` (deep navy) — headings and primary text. Note it's navy, not pure black, which keeps things softer.
- **Background:** `#FAFBFF` (barely-there cool off-white)
- **Surface:** `#FFFFFF` (pure white for cards/panels)
- **System colors** (use only for their semantic purpose): Success `#41D33E`, Warning `#F8D313`, Danger `#F73730`.

Body/secondary copy renders as a muted gray, smaller and lighter than headings.

## Typography

- **Font family:** Inter for both headings and body — one consistent typeface.
- **Headings:** Inter, **Bold**, in the navy `#001364`.
- **Body:** Inter, **Normal** weight, muted gray, kept small and understated.

## Shape, depth & borders (the "Styles" settings)

- **Size:** Medium (the middle of S/M/L).
- **Roundness:** soft rounded corners on cards, inputs, and buttons (a medium corner radius — not sharp, not fully pill-shaped by default).
- **Round buttons & inputs:** toggle is **off**, so buttons/inputs are rounded-rectangle, not full pills.
- **Shadow:** **enabled** — but subtle, soft shadows on cards for gentle elevation, not heavy drop shadows.
- **Borders:** set to **Standard** — thin, light borders (visible on the filter dropdowns and inputs on the Board page).

## Navigation styling (for context)

- Top nav: "Soft accent" style. Side nav: "Standard." Consistent with the muted approach.

## Layout & spacing

- **Max content width:** custom **1140px**. Content is centered with generous whitespace around it.
- Lots of breathing room, clear separation between sections, and simple single-column or clean-grid arrangements. The New/home page shows the pattern well: a white card with generous internal padding, small circular accent icon badges next to each action, and muted descriptive text.

## Practical do's and don'ts for the code blocks

**Do:** use white/`#FAFBFF` surfaces, navy headings, gray body text, thin standard borders, soft rounded corners, subtle shadows, and the periwinkle accent only for interactive/emphasis elements. Keep icons small and neutral. Prioritize whitespace.

**Don't:** use bright/saturated colors, heavy gradients or glassy effects on functional UI, pure-black text, thick borders, hard shadows, or dense/cramped layouts. Don't borrow the more expressive marketing-site aesthetic.

If it's helpful, I can also pull exact rendered values (e.g., specific pixel radii, shadow values, or the muted gray hex used for body text) by inspecting the live styles — just let me know and I'll dig into the computed CSS.
