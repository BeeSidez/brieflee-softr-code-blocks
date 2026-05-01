# Brieflee brand colours

Source of truth for hex values across emails, code blocks, landing pages, ads, and any visual surface. Pulled from the live www.brieflee.co site.

## Core palette

| Use | Hex | Visual / notes |
|---|---|---|
| **Page background** | `#FAFBFF` | Very pale lavender / near-white. Use for the outermost canvas. |
| **Container background** | `#ECF0FF` | Light periwinkle. Use for section blocks, cards, roadmap pills, sig strips. |
| **Primary button** | `#879CF7` | Brand periwinkle. Use for CTAs and any "primary action" pill. |
| **Primary text / headings** | `#001364` | Brand navy. Use for H1/H2/H3 and any text on light backgrounds. |
| **Button text** | `#FFFFFF` | White. On the periwinkle button. |
| **Pill ("SPELL CHECK FOR VIDEO" etc.)** | `#879CF7` bg + `#FFFFFF` text | Same periwinkle as the button, ties everything together. |

## Supporting colours (Brieflee email system)

| Use | Hex | Notes |
|---|---|---|
| Card background | `#FFFFFF` | The email card sits inside the page bg. |
| Borders / dividers | `#D6DEFC` | Subtle periwinkle border for card edges + roadmap row separators. |
| Body text | `#333333` | Standard body paragraph colour, comfortable read. |
| Muted text | `#555555` | Captions, footer, less-important info. |
| Footer text | `#BBBBBB` | The very-quiet unsubscribe-row colour. |
| Trial banner bg | `#F0FFF4` | Light green tint — universal "good news" signal. |
| Trial banner border | `#38A169` | Green left-border for the trial banner. |

## Dark mode equivalents (in the email)

| Use | Light hex | Dark hex |
|---|---|---|
| Page bg | `#FAFBFF` | `#0A0F24` |
| Card bg | `#FFFFFF` | `#1A1F3D` |
| Container bg | `#ECF0FF` | `#232852` |
| Hero gradient | `#ECF0FF → #879CF7` | `#7E84F2 → #5A60E8` (deeper periwinkle to maintain contrast) |
| Hero H1 | `#001364` | `#FFFFFF` |
| Headings | `#001364` | `#FFFFFF` |
| Body text | `#333333` | `#D4DCE8` |
| Eyebrow accent | `#879CF7` | `#B8BDF5` |

## Usage rules

- **Don't mix periwinkle shades randomly.** Pick `#879CF7` as the canonical periwinkle and use it consistently for the CTA, eyebrow, and primary pill.
- **Hero gradient uses the soft → strong periwinkle pair**: `#ECF0FF` (light) to `#879CF7` (mid). Don't go darker than `#879CF7` on light surfaces — keeps the brand light and airy (vs Creator Scans' dark-navy).
- **Text on periwinkle backgrounds is always `#001364` navy**, not white. The brand reads light, with the navy text providing contrast.
- **Text on white card is always `#001364` navy** for headings, `#333333` for body. Keep colour usage minimal — the periwinkle is the accent, the navy is the gravity.

## Cross-reference

- Logo asset: `https://res.cloudinary.com/dchroynzv/image/upload/brieflee_logo_brieflee-wordmark-deep-blue-with-periwinkle-lee-and-smile_2025-03.png`
- Asset library: see `~/Claude Code/Docs/emailit-reference.md` and the brieflee-assets skill (`~/Downloads/brieflee-assets.skill`)
- Email matrix: [`08-email-matrix.md`](08-email-matrix.md) · cURL reference: [`07-emailit-curl-reference.md`](07-emailit-curl-reference.md)
