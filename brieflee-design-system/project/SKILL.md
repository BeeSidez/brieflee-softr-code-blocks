---
name: brieflee-design
description: Use this skill to generate well-branded interfaces and assets for Brieflee, either for production or throwaway prototypes/mocks/etc. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping.
user-invocable: true
---

Read the README.md file within this skill, and explore the other available files.

If creating visual artifacts (slides, mocks, throwaway prototypes, etc), copy assets out and create static HTML files for the user to view. If working on production code, you can copy assets and read the rules here to become an expert in designing with this brand.

If the user invokes this skill without any other guidance, ask them what they want to build or design, ask some questions, and act as an expert designer who outputs HTML artifacts _or_ production code, depending on the need.

## What's in this folder

- `README.md` — full system reference (voice, visual foundations, iconography, index)
- `colors_and_type.css` — drop-in CSS variables + semantic type classes. Link this from any HTML output.
- `assets/` — logos, app icons, sticker illustrations, engraving illustrations, hero GIF, product screenshots
- `preview/` — small HTML cards specimening every token and component (look here for live examples)
- `ui_kits/marketing/` — React recreation of the brieflee.co marketing site
- `ui_kits/app/` — React recreation of the Brieflee app review dashboard

## Quick rules

- Periwinkle `#879CF7` is the only loud accent. Navy `#001364` carries gravity.
- Hero gradient is `linear-gradient(180deg, #ECF0FF 0%, #879CF7 100%)`.
- Plus Jakarta Sans across the system. Headings 700-800, body 400.
- No em dashes. No exclamation points in CTAs. Sentence case throughout.
- Lucide icons in product UI. No emoji in-app. Engravings for editorial, stickers for product accents.
- Cards `rounded-xl/2xl`, soft shadow, `1px solid #D6DEFC` border or none.
- Two surface motifs: white cards on `#FAFBFF` page, or full-width periwinkle gradient strips.
