# Brieflee — App UI Kit

Recreation of the Brieflee app dashboard, modeled on `app/bulk-import-briefs-v10.jsx` (shadcn-ui style: rounded-xl cards, lucide icons, dashed dropzones, multi-step indicator).

## Components
- `Sidebar.jsx` — left rail with app icon + nav
- `TopBar.jsx` — search, workspace switcher, user
- `StepIndicator.jsx` — 5-step flow ribbon
- `BriefCard.jsx` — single brief tile
- `ReviewTable.jsx` — videos table with score column
- `ScoreCell.jsx` — donut + status pill
- `Dropzone.jsx` — dashed CSV upload zone
- `EmptyState.jsx` — periwinkle illustration + CTA

## index.html
Click "Upload videos" → dropzone activates a fake import → table fills with mock review rows.
