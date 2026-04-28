# Brieflee Brand Guidelines

## Colour Palette

### Primary Blues (shared with Creator Scans)
| Name | Hex | Usage |
|---|---|---|
| Brieflee Blue (Primary) | `#294ff6` | Primary CTAs, headings, active states, key accents |
| Blue 2 | `#4466f8` | Secondary buttons, hover states, chart fills |
| Blue 3 | `#5e7bf6` | Tertiary accents, icon tints, progress bars |
| Blue 4 | `#7a93ff` | Lighter accents, subheadings, secondary links |
| Blue 5 | `#879cf7` | Lightest blue accent, subtle highlights, hero circle background |

### Dark Navy
| Name | Hex | Usage |
|---|---|---|
| Navy | `#000f4d` | Dark CTAs ("Try Free For 7 Days"), heading text, bold values |
| Navy 2 | `#001364` | Secondary dark backgrounds |
| Navy 3 | `#152237` | Darkest backgrounds, footer |

### Light Backgrounds
| Name | Hex | Usage |
|---|---|---|
| Ice Blue | `#ccedff` | Lightest tint, subtle card backgrounds, notification badges |
| Light 1 | `#f8fbff` | Page background tint, card fills |
| Lavender | `#d8d8ff` | Accent backgrounds, tag fills, section dividers |
| Light 2 | `#eef4fd` | Chart tracks, empty state fills, input backgrounds |
| Periwinkle | `#d9e0ff` | Pill badges, section labels, soft accent backgrounds |

## CSS Variable Reference

```css
--bl-blue: #294ff6;
--bl-blue-2: #4466f8;
--bl-blue-3: #5e7bf6;
--bl-blue-4: #7a93ff;
--bl-blue-5: #879cf7;
--bl-navy: #000f4d;
--bl-navy-2: #001364;
--bl-navy-3: #152237;
--bl-ice: #ccedff;
--bl-light-1: #f8fbff;
--bl-lavender: #d8d8ff;
--bl-light-2: #eef4fd;
--bl-periwinkle: #d9e0ff;
```

## JS Constant (for Softr code blocks)

```javascript
const BL = {
  blue: "#294ff6",
  blue2: "#4466f8",
  blue3: "#5e7bf6",
  blue4: "#7a93ff",
  blue5: "#879cf7",
  navy: "#000f4d",
  navy2: "#001364",
  navy3: "#152237",
  ice: "#ccedff",
  light1: "#f8fbff",
  lavender: "#d8d8ff",
  light2: "#eef4fd",
  periwinkle: "#d9e0ff",
};
```

## Typography

- Headings: bold, colour `#000f4d` (navy) on light backgrounds, white on dark
- Subheadings/accent text: `#294ff6` (Brieflee blue) or `#7a93ff` (blue 4)
- Body text: dark grey/default foreground
- Muted/secondary: `text-muted-foreground` (Tailwind)
- Metric values: bold, colour `#294ff6` or `#000f4d`

## Component Patterns

### Primary CTA Button
- Background: `#294ff6`
- Text: white
- Border radius: rounded-lg
- Hover: slight shadow or darken
- Arrow icon on right (optional)

### Secondary CTA Button (Nav)
- Background: `#000f4d` (navy)
- Text: white
- Border radius: rounded-lg

### Ghost/Text Button
- No background
- Text: `#000f4d`
- Play icon circle: border `#294ff6`, icon `#294ff6`

### Cards
- Background: white or `#f8fbff`
- Border: none (`border-0`) or subtle `#eef4fd`
- Shadow: `shadow-sm`
- Border radius: `rounded-xl`

### Section Badges / Pills
- Background: `#d9e0ff` (periwinkle) or `#eef4fd`
- Text: `#294ff6`
- Border radius: `rounded-full`
- Padding: `px-4 py-1.5`
- Font size: `text-sm font-medium`
- Optional diamond/gem icon before text

### Hero Circle
- Large circle behind hero image
- Background: `#879cf7` at ~20% opacity, or `#d9e0ff`
- Gives a soft lavender glow behind content

### Status Badges
- Approved/Success: green background, white text
- High Quality: `#294ff6` background, white text
- Reviewed: `#4466f8` background, white text
- Pending: `#d9e0ff` background, `#294ff6` text

### Before/After Sections
- "Before" label: `#294ff6` text
- "After Brieflee" label: `#000f4d` text, bold
- Clean two-column layout with centered text below each visual

### Charts (CSS-based)
- Donut tracks: `#eef4fd`
- Bar tracks: `#eef4fd`
- Fills: gradient through blue palette (lightest to darkest)
- Score percentages: `#294ff6` bold

## Brand Voice in UI

- Clean, minimal, professional
- White space is intentional and generous
- Softer and more polished than Creator Scans (Brieflee is B2B SaaS, CS is creator-facing)
- Short, punchy copy: "Grammarly for short form video content"
- Action-oriented CTAs: "Try it for free", "Watch Demo", "Upload Content"

## Difference from Creator Scans

Both brands share the same blue palette. The key differences:
- Brieflee uses more white space and a cleaner, more minimal aesthetic (SaaS feel)
- Brieflee has `#ccedff` (ice blue) and `#d9e0ff` (periwinkle) which CS does not
- Brieflee does NOT use the TikTok red accent (`#fe2c55`) — that is CS only
- Brieflee uses pill badges (`rounded-full`) more than CS
- Brieflee cards tend to be white with subtle borders; CS cards use `#f8fbff` fills

## Do / Don't

- DO use generous white space — Brieflee feels clean and premium
- DO use pill badges for section labels and status indicators
- DO use the blue palette for data visualisation and progress
- DO use navy for headings and authoritative text
- DON'T use red accents — that is Creator Scans only
- DON'T use dark header cards like CS — Brieflee stays light
- DON'T use borders on cards unless very subtle (`#eef4fd`)
- DON'T use em dashes in any copy or AI-generated text
- DON'T overcrowd layouts — let elements breathe
