# Brief Builder — briefs table migration spec

> **EXECUTED 2026-07-10.** All 20 fields created (write-verified, table now 130 fields) and the Notion Field Reference reconciled (IDs written back, statuses → Live, 2 rows added). New field IDs:
> `brand`=FJq4K · `offer`=4g59H · `offer_fee`=wjr87 · `offer_commission`=8GtDO · `offer_gift`=NjTVB · `audience_customer`=uuHYp · `creator_benefits`=KNG6e · `caption_hooks`=8EyqU · `visual_action_hooks`=QBeNt · `voiceover_hooks`=IkSKh · `talking_points`=YEfyw · `script`=YLabB · `props`=nyCdA · `production_notes`=lCSdf · `dos`=CSbqb · `donts`=I5wOP · `usage_rights`=ybqMW · `submission_notes`=gx4hJ · `contact_community`=yoAxA · `extra`=SS0w3
> `creator_type` (N1vCS) options renamed in place (ids preserved): Influencer · UGC · Affiliate (new) · Customer · Employee Ambassador. Founder kept temporarily — 1 brief ("Sunkissed Lip Oil — Launch Brief", PiT2V6sIW4SC41) still uses it; drop after reassignment.
> `content_type` (EO7S4) kept until the builder ships (32 briefs hold data); delete in the cleanup pass.

Source: "Briefs Table — Field Reference" Notion DB (`collection://85418ba7-c8d9-4437-a202-2168b4037193`), full enumeration 2026-07-10 via the unfiltered "All fields (API)" view. Cross-checked against the live briefs table (`RpoBGPxrsEOnmj`, 110 fields, snapshot in scratchpad `briefs-live-schema.txt`).

## NEW — 18 fields to create (no Field ID yet in Notion)

All proposed as LONG_TEXT (section bodies; the builder writes rich text, the description compiler flattens to plain text). Bible section each feeds:

| Field | Bible section |
|---|---|
| `brand` | 1 · Brand |
| `offer` | 2 · The Offer |
| `offer_fee` | 2 · The Offer |
| `offer_commission` | 2 · The Offer |
| `offer_gift` | 2 · The Offer (row had empty Status — treated as New) |
| `audience_customer` | 3 · Audience / Customer |
| `creator_benefits` | 5 · Creator Benefits |
| `caption_hooks` | 7 · Hook |
| `visual_action_hooks` | 7 · Hook (empty Status — treated as New) |
| `voiceover_hooks` | 7 · Hook (empty Status — treated as New) |
| `talking_points` | 8 · Talking Points |
| `script` | 9 · Script |
| `props` | 12 · Props |
| `production_notes` | 13 · Production Notes |
| `dos` | 14 · Guidelines |
| `donts` | 14 · Guidelines |
| `usage_rights` | 15 · Usage Rights |
| `submission_notes` | 16 · Submissions |

## UPDATE — 1 field

| Field | ID | Today | Question |
|---|---|---|---|
| `creator_type` | `N1vCS` | SELECT, 5 options (Influencer · UGC Creator · Founder · Customer · Employee) | Marked Update in Notion. Likely the option set changes to the Bible's creator types (the Offer prompt uses Affiliate · Influencer · UGC · Customer · Employee Ambassador). Confirm the target option list with Bev before touching. |

## DELETE — 1 field (needs Bev's explicit approval)

| Field | ID | What it is |
|---|---|---|
| `content_type` | `EO7S4` | SELECT, 8 options — the old "Content style" (Product demo, Educational, …). Superseded by the `format` LINKED_RECORD → formats table (42). The audit called this out: "three notions of format, pick one canonical." Check for existing data before delete. |

## LIVE — everything else (~108 rows)

Already on the table and mapped. Highlights the builder will read/write:

- **Section-mapped editable inputs:** `description` (FCBU5, becomes the compiled plain-text home), `attachment`, `brief_document_URL`, `product`, `feature`, `feature_url`, `product_feature_description`, `qa_checklist` (OFoS6, 27 opts), all 10 `*_threshold` selects, `duration`, `aspect_ratio`, `platform`, `content_delivery`, `submission_open_date`/`close_date`, `creator_name`, `creator_email`, `creator_type`, `awareness`, `angle`, `channel`, `ai_mode`, `status`, `generated`, `private_mode`
- **Format:** `format` (7Qmlq, LINKED_RECORD multi → formats) + `first_format` (0oeqf, single) + lookups Description/Why it works/Hook type/Hook tactic (formats)
- **Examples:** `example`/`example 2`/`example 3` (reviews links) + `videos`/`videos 2`/`videos 3` (swipe links) + `example_video_1..3` (URLs) + video/analysis lookups
- **Brand via project:** `brand_bio`, `brand_blueprint`, `website`, `logo url`, `logo file`, `company_name`, `accounts`, `thumbnail (projects)` — all lookups through `projects`
- **System/computed:** id, links, SEO/social formulas, `created_at`/`updated_at`

## Gaps spotted (for Bev)

1. **Contact / Community (section 17) has no field.** No New row links to it. Options: pull live from the account (lookup through projects → accounts `social_handles`/`community_links`) or add a `contact_community` LONG_TEXT the builder fills.
2. **Extra (section 19) has no dedicated field** — presumably lives in the compiled `description` only, or needs an `extra` field.
