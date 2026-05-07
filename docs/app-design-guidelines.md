# App Design Guidelines

Canonical structural rules for Softr Vibe Code blocks across **Brieflee** and **Creator Scans**. Covers widths, font sizes, button sizing, spacing, modal patterns, and common pitfalls.

For the full color palette and brand voice see `brand-guidelines.md` (each repo has its own). This file covers the structural rules that brand guides don't.

The reference implementation is **Creator Scans** — its widths and button defaults are the source of truth. Brieflee adopts the same shape; only color tokens and font differ.

---

## Container

Every settings/dashboard block uses the same outer wrapper:

```jsx
<div className="content mx-auto py-4" style={{ maxWidth: 1140 }}>
  ...
</div>
```

- **`maxWidth: 1140`** as an inline style (not Tailwind — `max-w-4xl` is 896px and is wrong for app blocks).
- `mx-auto` to center.
- `py-4` (16px vertical) for breathing room.

Past mistake: Brieflee `app/settings/*` blocks were set to `max-w-4xl` (896px). The Creator Scans equivalents are 1140. Standardize on 1140.

## Typography

| Use | Tailwind class | Inline alternative | Color |
|---|---|---|---|
| Page header (h2) | `text-2xl font-bold` | 24px / 700 | NAVY |
| Card title (h3) | `text-base font-semibold` | 16px / 600 | NAVY |
| Section pill / label | `text-xs font-semibold uppercase tracking-wider` | 12px / 600 | PERIWINKLE |
| Body | `text-sm` | 14px / 400 | NAVY |
| Helper / muted | `text-sm` (or `text-xs`) | 14px or 12px | MUTED |
| Caption | `text-xs` | 12px | MUTED |
| Big stat / number | inline `style={{ fontSize: 24, lineHeight: 1 }}` + `font-extrabold` | 24-28px / 800 | NAVY |
| Field label | `text-xs font-semibold` | 12px / 600 | NAVY |

**Font:**
- **Brieflee** — `League Spartan` (import via Google Fonts at the top of every block):
  ```css
  @import url('https://fonts.googleapis.com/css2?family=League+Spartan:wght@300;400;500;600;700&display=swap');
  .your-block-class * { font-family: 'League Spartan', sans-serif; }
  ```
  Always scope to a block-level class so the import doesn't leak outside the block.
- **Creator Scans** — Softr theme default (no font import).

## Buttons

### Default — shadcn `<Button>`

This is what almost every button should be. Don't write a custom `<button>` unless you specifically need a pill shape.

```jsx
<Button
  onClick={...}
  className="font-semibold gap-2"
  style={{ backgroundColor: PERIWINKLE, color: '#fff' }}
>
  <Icon className="h-4 w-4" />
  Label
</Button>
```

Shadcn defaults (don't override):
- **Text size:** 14px (`text-sm`)
- **Height:** 36px (`h-9`)
- **Corner radius:** ~8px (theme `rounded-md`)
- **Padding:** `px-4 py-2`

Common overrides:
- `className="font-semibold gap-2"` — bumps from `font-medium` and adds 8px gap between icon and label.
- Inline `backgroundColor` for primary (PERIWINKLE) or secondary (NAVY).
- For an outline button: `<Button variant="outline" style={{ color: NAVY, borderColor: BORDER }}>`.

Icon size inside a button: `h-4 w-4` (16px).

### Custom HTML button (when shadcn `<Button>` won't work)

Match the shadcn shape: flat, 14px text, ~36px height, 8px radius. **No glow shadows. No hover lift.** Just a background color change on hover.

```css
.your-button {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;       /* 36px height with 14px text */
  background: <PERIWINKLE>;
  color: #FFFFFF;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
}
.your-button:hover {
  background: <PERIWINKLE_HOVER>;
}
.your-button:disabled {
  background: <DISABLED_BG>;
  color: #FFFFFF;
  cursor: not-allowed;
}
```

Reference: `app/settings/new-workspace`, `app/settings/workspace`, `app/settings/quality`, `app/settings/plans-and-billing`.

### Hero CTA (marketing/empty-state)

Only for hero/empty-state contexts (e.g. "Get started" in `no-workspace-empty`). May be pill-shaped (`border-radius: 999px`) and use a soft glow + hover lift to feel inviting. **Do not use this style for in-product action buttons** like Save Changes — those should be flat.

## Cards

```jsx
<Card className="bg-white" style={{ borderColor: BORDER }}>
  <CardContent className="pt-5">
    ...
  </CardContent>
</Card>
```

- White background, soft 1px periwinkle-tinted border.
- Highlight a card by bumping the border: `style={{ borderColor: PERIWINKLE + '55', borderWidth: 2 }}`.
- Standard content padding: `pt-5` (or `pt-5 pb-5` if symmetrical).

## Status pill (header chip)

Used at the top of a section to flag what the block is about. Same shape on both products:

```jsx
<div
  className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wider mb-3"
  style={{
    backgroundColor: 'rgba(<PERIWINKLE_RGB>, 0.10)',
    color: PERIWINKLE,
    border: `1px solid ${PERIWINKLE}40`,
  }}
>
  <span className="rounded-full" style={{ width: 6, height: 6, backgroundColor: PERIWINKLE }} />
  Section name
</div>
```

## Spacing

| Use | Value |
|---|---|
| Container vertical padding | `py-4` (16px) |
| Major section gap | `space-y-5` (20px) |
| Card content top padding | `pt-5` (20px) |
| Inline gap (icon + label) | `gap-2` (8px) |
| Button-row gap | `gap-2` or `gap-3` (8-12px) |
| Stat-card grid gap | `gap-4` (16px) |

## Modals

Match Softr's native modal feel — calm, not bouncy.

- **Backdrop:** `rgba(0, 15, 77, 0.40)`. **No backdrop-blur** (Softr native doesn't blur).
- **Modal radius:** 14px (NOT 20px — too rounded).
- **Modal shadow:** `0 12px 36px rgba(0, 15, 77, 0.18)` — single soft shadow, no inner ring.
- **Animation:** simple fade + 6px lift, `0.18s ease-out`. **No scale, no bounce.**
- **Subtitle / helper text:** MUTED gray. **Not** periwinkle — periwinkle subtitles read as too "designed".
- **Modal header:** title (16px / 600) + optional muted subtitle + close X (28×28, gray, hovers to navy).

Reference: `app/settings/new-workspace`.

## Per-brand color tokens

The actual values used in app block code. For the broader marketing palette see Brieflee's `docs/brand-guidelines.md`.

### Brieflee (use these in `app/` blocks)

```js
const BL_NAVY        = "#000F4D";  // page text, headings
const BL_NAVY_DEEP   = "#001364";  // card titles
const BL_PERIWINKLE  = "#879CF7";  // brand accent, primary CTA bg
const BL_ACCENT_DEEP = "#294FF6";  // primary CTA hover
const BL_BORDER      = "rgba(217, 224, 255, 0.55)";
const BL_MUTED       = "#6B7A99";
const BL_TRACK       = "rgba(217, 224, 255, 0.6)";
```

### Creator Scans

```js
const CS_NAVY       = "#001364";
const CS_PERIWINKLE = "#7a93ff";
const CS_BORDER     = "#eef4fd";
const CS_MUTED      = "#6b7a99";
```

**Don't copy field IDs across the two databases** — they're different Softr tables and IDs don't transfer. Always verify with the Tables API or schema snapshot when porting a block from one product to the other.

## Common mistakes (from past audits)

- ❌ `maxWidth: 896` or `max-w-4xl` for an app block — use **1140**.
- ❌ Heavy gradient shadows on modals — use `0 12px 36px rgba(0,15,77,0.18)`.
- ❌ Backdrop blur on modals — drop it.
- ❌ Bouncy `cubic-bezier(0.34, 1.56, 0.64, 1)` modal entrance — use `ease-out`.
- ❌ Periwinkle for subtitle / muted text — use MUTED gray.
- ❌ Custom HTML `<button>` when shadcn `<Button>` would work.
- ❌ Trigger button at 13px text — match shadcn at **14px**.
- ❌ Pill-shape (`border-radius: 999px`) on Save Changes / settings action buttons — use **8px**. Pill is for hero CTAs only.
- ❌ Periwinkle glow shadow under buttons (`box-shadow: 0 2px ... rgba(135,156,247,...)`) — buttons should be flat.
- ❌ Bouncy hover lift on settings buttons (`transform: translateY(-1px)`) — keep settings buttons stationary, just change bg on hover.
- ❌ Wrong field IDs copy-pasted between Brieflee and Creator Scans (different databases).
- ❌ Single shared `q.select` for both read and write. Softr's analyzer needs **separate** `select` and `updateFields` literals to populate the Actions tab. See `app/settings/quality` or `app/settings/workspace` for the working pattern.
- ❌ `useRecords({ count: 1 })` + `[0]` for "the logged-in user's record" — that grabs row #1 of the table for everyone. Use `useCurrentUser()` + `useRecord({ recordId: user?.id })` instead.
- ❌ Loading-state guard that blocks Studio rendering. Gate Loading on `user?.id && status === 'pending'` so the block renders an empty design state in Studio's editor (where there's no logged-in user).

## Asset hierarchy (Brieflee only)

- **Big hero / feature card slot:** `feature-card`, `hero`, `demo`, `illustration`, `ad` from the Cloudinary library. Never an engraving or sticker.
- **Small quick-link tile / shortcut chip:** engravings + stickers ARE valid here.
- **Inline list / bullet / step marker:** engraving or icon.
- **No emojis in product UI.** Use brand engravings instead.
