# Brieflee Beta — Database Schema Snapshot

**Snapshot date:** 2026-04-28  
**Database:** `brieflee beta`  
**Database ID:** `066e6e54-3814-40e8-a510-825ac70bd20d`  
**Tables:** 13  
**Total fields:** 577

> This is a baseline snapshot taken before any onboarding/payment changes. Compare against future snapshots to track schema drift.

## Table summary

| Table | ID | Field count |
|---|---|---|
| `users` | `brpbVf8sL2xqxV` | 50 |
| `accounts` | `TpAIptRey40yDj` | 74 |
| `members` | `J8TKhfRL2rxNvA` | 24 |
| `projects` | `hne0kugPrigIMs` | 28 |
| `briefs` | `RpoBGPxrsEOnmj` | 82 |
| `submissions` | `YdF2bMFS5LkUR1` | 74 |
| `reviews` | `jRIJ8k8SOkaicy` | 90 |
| `review_report` | `PyLcZSiB1d9sAH` | 18 |
| `notifications` | `CCoX2TFkOLk89I` | 34 |
| `pricing` | `gGyTkXrUpW697X` | 29 |
| `billing` | `sQP8T9IIlaJgho` | 41 |
| `usage` | `dw2IeLOtYJLulR` | 28 |
| `PDF` | `jmhK0ijOUpnBpe` | 5 |

---

## `users`

**Table ID:** `brpbVf8sL2xqxV`  
**Primary field:** `id`  
**Fields:** 50

- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`full_name`** — `SINGLE_LINE_TEXT`
- **`email`** — `SINGLE_LINE_TEXT`
- **`first_name`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(FIND(" ", {full_name}) = 0, {full_name}, LEFT({full_name}, FIND(" ", {full…` _readonly_
- **`last_name`** — `FORMULA` [SINGLE_LINE_TEXT] `RIGHT({full_name}, LEN({full_name}) - FIND(" ", {full_name}))` _readonly_
- **`avatar`** — `ATTACHMENT` _multi_
- **`role`** — `SELECT` [Owner, Admin, Member]
- **`status`** — `SELECT` [Active, Inactive, Pending]
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`created_at`** — `CREATED_AT` _readonly_
- **`last_seen`** — `DATETIME`
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`id (accounts)`** — `LOOKUP` (via `accounts` → accounts.`id` [FORMULA]) _readonly, multi_
- **`status (accounts)`** — `LOOKUP` (via `accounts` → accounts.`status` [SELECT]) _readonly, multi_
- **`ai_mode (accounts)`** — `LOOKUP` (via `accounts` → accounts.`ai_mode` [SELECT]) _readonly, multi_
- **`plan (accounts)`** — `LOOKUP` (via `accounts` → accounts.`plan` [LOOKUP]) _readonly, multi_
- **`workspaces_remaining`** — `LOOKUP` (via `accounts` → accounts.`workspaces_remaining (usage)` [LOOKUP]) _readonly, multi_
- **`storage_remaining`** — `LOOKUP` (via `accounts` → accounts.`storage_remaining (usage)` [LOOKUP]) _readonly, multi_
- **`videos_remaining`** — `LOOKUP` (via `accounts` → accounts.`videos_remaining (usage)` [LOOKUP]) _readonly, multi_
- **`members_remaining`** — `LOOKUP` (via `accounts` → accounts.`members_remaining (usage)` [LOOKUP]) _readonly, multi_
- **`name (accounts)`** — `LOOKUP` (via `accounts` → accounts.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`notifications`** — `LINKED_RECORD` → **notifications** _multi_
- **`total_workspaces`** — `ROLLUP` (? via `accounts` → accounts.`id`) _readonly_
- **`accounts owner`** — `LINKED_RECORD` → **accounts** _multi_
- **`owner`** — `LOOKUP` (via `accounts owner` → accounts.`owner_name` [LOOKUP]) _readonly, multi_
- **`billing`** — `LINKED_RECORD` → **billing** _multi_
- **`total_amount (billing)`** — `LOOKUP` (via `billing` → billing.`total_amount` [NUMBER]) _readonly, multi_
- **`payment_status (billing)`** — `LOOKUP` (via `billing` → billing.`payment_status` [SELECT]) _readonly, multi_
- **`trial_status`** — `LOOKUP` (via `billing` → billing.`trial_status` [FORMULA]) _readonly, multi_
- **`stripe_customer_id (billing)`** — `LOOKUP` (via `billing` → billing.`stripe_customer_id` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`members`** — `LINKED_RECORD` → **members** _multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`reviews (submissions)`** — `LOOKUP` (via `submissions` → submissions.`reviews` [LINKED_RECORD]) _readonly, multi_
- **`creator_monthly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/7sY5kE4iXePu67PaSJcAo0c?locked_prefilled_email=" & SU…` _readonly_
- **`creator_yearly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/8x2bJ22aPaze7bT7GxcAo0b?locked_prefilled_email=" & SU…` _readonly_
- **`crew_monthly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/aFa3cw2aP4aQdAhe4VcAo09?locked_prefilled_email=" & SU…` _readonly_
- **`crew_yearly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/aFfZidTxfTygMt2mdcAo0a?locked_prefilled_email=" & SUB…` _readonly_
- **`studio_monthly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/7sY9AUdTxgXC1RzbWNcAo07?locked_prefilled_email=" & SU…` _readonly_
- **`studio_yearly`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/6oU00kdTx5eUeEl9OFcAo08?locked_prefilled_email=" & SU…` _readonly_
- **`creator_monthly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/7sI9Et7yk3fCeVGbII?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`creator_yearly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/cN25odcSE4jG8xi8wx?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`crew_monthly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/cN24k97yk5nK14QeUX?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`crew_yearly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/7sI6sh9Gs7vS6pa3ce?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`studio_monthly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/00gdUJ2e07vS9BmaEJ?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`studio_yearly_trial`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://buy.stripe.com/fZe9Et19W4jG28U6os?locked_prefilled_email=" & SUBSTIT…` _readonly_
- **`owner_name`** — `SINGLE_LINE_TEXT`
- **`brieflee_logo`** — `URL`
- **`PDF`** — `LINKED_RECORD` → **PDF** _multi_

---

## `accounts`

**Table ID:** `TpAIptRey40yDj`  
**Primary field:** `name`  
**Fields:** 74

- **`name`** — `SINGLE_LINE_TEXT`
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`users`** — `LINKED_RECORD` → **users** _multi_
- **`owner`** — `LINKED_RECORD` → **users** _multi_
- **`payment_status`** — `LOOKUP` (via `owner` → users.`payment_status (billing)` [LOOKUP]) _readonly, multi_
- **`owner_name`** — `LOOKUP` (via `owner` → users.`full_name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`reviews`** — `LINKED_RECORD` → **reviews** _multi_
- **`billing`** — `LINKED_RECORD` → **billing**
- **`tier`** — `LOOKUP` (via `billing` → billing.`product_name (pricing)` [LOOKUP]) _readonly, multi_
- **`one_off_products`** — `LINKED_RECORD` → **billing** _multi_
- **`product_name`** — `LOOKUP` (via `one_off_products` → billing.`product_name (pricing)` [LOOKUP]) _readonly, multi_
- **`created_at (billing)`** — `LOOKUP` (via `billing` → billing.`created_at` [CREATED_AT]) _readonly_
- **`usage`** — `LINKED_RECORD` → **usage** _multi_
- **`workspaces_remaining (usage)`** — `LOOKUP` (via `usage` → usage.`workspaces_remaining` [FORMULA]) _readonly, multi_
- **`plan`** — `LOOKUP` (via `usage` → usage.`plan` [FORMULA]) _readonly, multi_
- **`videos_remaining (usage)`** — `LOOKUP` (via `usage` → usage.`videos_remaining` [FORMULA]) _readonly, multi_
- **`storage_remaining (usage)`** — `LOOKUP` (via `usage` → usage.`storage_remaining` [FORMULA]) _readonly, multi_
- **`members_remaining (usage)`** — `LOOKUP` (via `usage` → usage.`members_remaining` [FORMULA]) _readonly, multi_
- **`notifications`** — `LINKED_RECORD` → **notifications** _multi_
- **`status`** — `SELECT` [active, inactive, trial, suspended, cancelled]
- **`logo`** — `ATTACHMENT` _multi_
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`ai_mode`** — `SELECT` [Autonomous, Hybrid, Manual]
- **`product_screen_time_threshold`** — `SELECT` [40%, 50%, 60%, 70%, 80%, 90%, 100%, None]
- **`hook_speed_threshold`** — `SELECT` [1 second, 2 seconds, 3 seconds, 5 seconds, None]
- **`visual_hook_threshold`** — `SELECT` [60%, 65%, 70%, 75%, 80%, 85%, 90%, None]
- **`cta_placement_threshold`** — `SELECT` [Last 3 seconds, Last 5 seconds, Last 7 seconds, Last 10 seconds, None]
- **`face_time_threshold`** — `SELECT` [20%, 30%, 40%, 50%, 60%, 70%, None]
- **`text_legibility_threshold`** — `SELECT` [70%, 80%, 90%, 100%, None]
- **`audio_clarity_threshold`** — `SELECT` [70%, 80%, 90%, 100%, None]
- **`engagement_pacing_threshold`** — `SELECT` [Every 2 seconds, Every 3 seconds, Every 4 seconds, Every 5 seconds, None]
- **`brand_mention_count_threshold`** — `SELECT` [1, 2, 3, 4+, 0]
- **`total_workspaces`** — `LOOKUP` (via `owner` → users.`total_workspaces` [ROLLUP]) _readonly, multi_
- **`total_storage_gb`** — `ROLLUP` (? via `submissions` → submissions.`file_size_mb`) _readonly_
- **`total_videos`** — `ROLLUP` (? via `submissions` → submissions.`id`) _readonly_
- **`billing_created`** — `FORMULA` [DATETIME] `DATE({created_at (billing)})` _readonly_
- **`active_months`** — `FORMULA` [SINGLE_LINE_TEXT] `DATETIME_DIFF(TODAY(), {billing_created}, 'months')` _readonly, multi_
- **`cycle_start`** — `FORMULA` [SINGLE_LINE_TEXT] `DATEADD({billing_created}, {active_months}, 'months')` _readonly, multi_
- **`cycle_end`** — `FORMULA` [SINGLE_LINE_TEXT] `DATEADD({billing_created}, {active_months} + 1, 'months')` _readonly, multi_
- **`current_billing_cycle`** — `FORMULA` [SINGLE_LINE_TEXT] `AND({billing_created} >= {cycle_start}, {billing_created} < {cycle_end})` _readonly, multi_
- **`alert_frequency`** — `SELECT` [Instant, Daily digest, Off]
- **`alert_on_failures`** — `CHECKBOX`
- **`alert_on_flagged`** — `CHECKBOX`
- **`alert_on_submissions`** — `CHECKBOX`
- **`alert_on_completions`** — `CHECKBOX`
- **`total users`** — `ROLLUP` (? via `users` → users.`id`) _readonly_
- **`blueprint_status`** — `SELECT` [Pending, Complete, Failed]
- **`brand_bio`** — `LONG_TEXT`
- **`brand_voice`** — `LONG_TEXT`
- **`brand_cta`** — `LONG_TEXT`
- **`target_audience`** — `LONG_TEXT`
- **`audience_pain_points`** — `LONG_TEXT`
- **`audience_objectives`** — `LONG_TEXT`
- **`niche`** — `LONG_TEXT`
- **`website`** — `URL`
- **`use_case`** — `SELECT` [Review UGC creator submissions, Review Influencer submissions, Build content example library, Agency managing multiple brands, Other] _multi_
- **`description`** — `LONG_TEXT`
- **`team_email1`** — `EMAIL`
- **`team_email2`** — `EMAIL`
- **`team_email3`** — `EMAIL`
- **`Ready`** — `SELECT` [Yes, let's begin, How does it work, What does Brieflee do?]
- **`web`** — `SELECT` [Yes, I have a website, No website yet]
- **`video`** — `ATTACHMENT` _multi_
- **`video_url`** — `URL`
- **`brief`** — `ATTACHMENT` _multi_
- **`submission_notes`** — `LONG_TEXT`
- **`submission_type`** — `SELECT` [Remix, Review]
- **`add_content`** — `SELECT` [From URL, File]
- **`qa_checklist`** — `SELECT` [26 choices: Product visibility, Product usage, Hook quality, Visual hook, Audio clarity…] _multi_
- **`Show`** — `CHECKBOX`

---

## `members`

**Table ID:** `J8TKhfRL2rxNvA`  
**Primary field:** `full_name`  
**Fields:** 24

- **`full_name`** — `SINGLE_LINE_TEXT`
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`first_name`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(ISERROR(FIND(" ", {full_name})), {full_name}, LEFT({full_name}, FIND(" ", …` _readonly_
- **`last_name`** — `FORMULA` [SINGLE_LINE_TEXT] `RIGHT({full_name}, LEN({full_name}) - FIND(" ", {full_name}))` _readonly_
- **`email`** — `EMAIL`
- **`Invitation_message`** — `SINGLE_LINE_TEXT`
- **`access_level`** — `SELECT` [Full access, View only, Comment only, Submit only]
- **`status`** — `SELECT` [Inactive, Invited, Active]
- **`invited_by`** — `LOOKUP` (via `users` → users.`full_name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`invited_at`** — `DATETIME`
- **`last_active`** — `DATETIME`
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`name (projects)`** — `LOOKUP` (via `projects` → projects.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`live_link (projects)`** — `LOOKUP` (via `projects` → projects.`live_link` [FORMULA]) _readonly, multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`name (briefs)`** — `LOOKUP` (via `briefs` → briefs.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`live_link_(briefs)`** — `LOOKUP` (via `briefs` → briefs.`live_link` [FORMULA]) _readonly, multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`live_link (submissions)`** — `LOOKUP` (via `submissions` → submissions.`live_link` [FORMULA]) _readonly, multi_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`users`** — `LINKED_RECORD` → **users** _multi_
- **`full_name (users)`** — `LOOKUP` (via `users` → users.`full_name` [SINGLE_LINE_TEXT]) _readonly, multi_

---

## `projects`

**Table ID:** `hne0kugPrigIMs`  
**Primary field:** `name`  
**Fields:** 28

- **`name`** — `SINGLE_LINE_TEXT`
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`reviews`** — `LINKED_RECORD` → **reviews** _multi_
- **`users`** — `LINKED_RECORD` → **users** _multi_
- **`logo (accounts)`** — `LOOKUP` (via `accounts` → accounts.`logo` [ATTACHMENT]) _readonly, multi_
- **`description`** — `LONG_TEXT`
- **`status`** — `SELECT` [Draft, Active, Closed, Archive]
- **`open_date`** — `DATETIME`
- **`close_date`** — `DATETIME`
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`total_briefs`** — `ROLLUP` (? via `briefs` → briefs.`id`) _readonly_
- **`total_submissions`** — `ROLLUP` (? via `briefs` → briefs.`submissions`) _readonly_
- **`total_reviews`** — `ROLLUP` (? via `briefs` → briefs.`reviews`) _readonly_
- **`pending_reviews`** — `ROLLUP` (? via `reviews` → reviews.`overall_status`) _readonly_
- **`internal_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/project/details/?recordId=", {id}, "")` _readonly_
- **`private_mode`** — `CHECKBOX`
- **`visibility`** — `FORMULA` [SINGLE_LINE_TEXT] `IF({private_mode}, 'Private', 'Public')` _readonly_
- **`visibility_toggle`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-switch size="small" ' & IF({private_mode}, 'checked', '') & '></sl-switch>'` _readonly_
- **`public_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/project/details/live?recordId=", {id}, "")` _readonly_
- **`privacy`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {private_mode},
  '<i class="fa-solid fa-lock"></i> Private',
  '<i cla…` _readonly_
- **`thumbnail`** — `ATTACHMENT` _multi_
- **`live_link`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://brieflee.co/project/details/live?recordId=" & {id}` _readonly_
- **`live_link_button`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-copy-button value="' & {live_link} & '" copy-label="Click to copy" succe…` _readonly_
- **`PDF`** — `LINKED_RECORD` → **PDF** _multi_

---

## `briefs`

**Table ID:** `RpoBGPxrsEOnmj`  
**Primary field:** `name`  
**Fields:** 82

- **`name`** — `SINGLE_LINE_TEXT`
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`description`** — `LONG_TEXT`
- **`attachment`** — `ATTACHMENT` _multi_
- **`example_1_video`** — `LOOKUP` (via `example` → reviews.`embed_code` [FORMULA]) _readonly_
- **`company_name`** — `LOOKUP` (via `accounts` → accounts.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`platform`** — `SELECT` [TikTok, Instagram, YouTube, Facebook, Twitter/X, LinkedIn, Other] _multi_
- **`platform_icons`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {platform},
  CONCATENATE(
    IF(
      FIND("TikTok", {platform}),
  …` _readonly_
- **`duration`** — `SELECT` [15 seconds, 30 seconds, 60 seconds, 90 seconds, 120 seconds, 45 seconds]
- **`duration_threshold`** — `SELECT` [min, max]
- **`duration_formated`** — `FORMULA` [SINGLE_LINE_TEXT] `{duration} & " (" & {duration_threshold} & ")"` _readonly_
- **`aspect_ratio`** — `SELECT` [9:16 (Vertical), 1:1 (Square), 16:9 (Horizontal)] _multi_
- **`content_type`** — `SELECT` [Educational, Direct sales, Testimonial, Behind the scenes, Product demo, Unboxing, Tutorial, Lifestyle] _multi_
- **`status`** — `SELECT` [Draft, Active, Closed, Archive]
- **`visibility`** — `FORMULA` [SINGLE_LINE_TEXT] `IF({private_mode}, 'Private', 'Public')` _readonly_
- **`ai_mode`** — `SELECT` [Autonomous, Hybrid, Manual]
- **`product_screen_time_threshold`** — `SELECT` [40%, 50%, 60%, 70%, 80%, 90%, 100%, None]
- **`hook_speed_threshold`** — `SELECT` [1 second, 2 seconds, 3 seconds, 4 seconds, 5 seconds, None, 1 seconds]
- **`visual_hook_threshold`** — `SELECT` [60%, 65%, 70%, 75%, 80%, 85%, 90%, None]
- **`cta_placement_threshold`** — `SELECT` [First 5 seconds, First 10 seconds, Last 3 seconds, Last 5 seconds, Last 7 seconds, Last 10 seconds, Throughout video (multiple CTAs), None (no CTA required)]
- **`face_time_threshold`** — `SELECT` [9 choices: 20%, 30%, 40%, 50%, 60%…]
- **`text_legibility_threshold`** — `SELECT` [70%, 80%, 90%, 100%, None]
- **`audio_clarity_threshold`** — `SELECT` [70%, 80%, 90%, 100%, None]
- **`engagement_pacing_threshold`** — `SELECT` [Every 2 seconds, Every 3 seconds, Every 4 seconds, Every 5 seconds, None]
- **`brand_mention_count_threshold`** — `SELECT` [1, 2, 3, 4+, 0]
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`thumbnail (projects)`** — `LOOKUP` (via `projects` → projects.`thumbnail` [ATTACHMENT]) _readonly, multi_
- **`public_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/brief/details/live?recordId=", {id}, "")` _readonly_
- **`internal_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/brief/details?recordId=", {id}, "")` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`users`** — `LINKED_RECORD` → **users** _multi_
- **`briefs (users)`** — `LOOKUP` (via `users` → users.`briefs` [LINKED_RECORD]) _readonly, multi_
- **`accounts (users)`** — `LOOKUP` (via `users` → users.`accounts` [LINKED_RECORD]) _readonly, multi_
- **`first_name (users)`** — `LOOKUP` (via `users` → users.`first_name` [FORMULA]) _readonly, multi_
- **`email (users)`** — `LOOKUP` (via `users` → users.`email` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`logo (accounts)`** — `LOOKUP` (via `accounts` → accounts.`logo` [ATTACHMENT]) _readonly, multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`reviews`** — `LINKED_RECORD` → **reviews** _multi_
- **`thumbnail (reviews)`** — `LOOKUP` (via `reviews` → reviews.`thumbnail` [URL]) _readonly, multi_
- **`notifications`** — `LINKED_RECORD` → **notifications** _multi_
- **`thumbnial`** — `ATTACHMENT` _multi_
- **`private_mode`** — `CHECKBOX`
- **`visibility_toggle`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-switch size="small" ' & IF({private_mode}, 'checked', '') & '></sl-switch>'` _readonly_
- **`privacy`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {private_mode},
  '<i class="fa-solid fa-lock"></i> Private',
  '<i cla…` _readonly_
- **`live_link`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://brieflee.co/brief/details/live?recordId=" & {id}` _readonly_
- **`user_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("https://brieflee.co", {internal_link})` _readonly_
- **`live_link_button`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-copy-button value="' & {live_link} & '" copy-label="Click to copy" succe…` _readonly_
- **`closed`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(AND({submission_close_date}, {submission_close_date} <= NOW()), 'true', 'f…` _readonly_
- **`closing_soon`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  AND(
    {submission_close_date},
    DATETIME_DIFF({submission_close_d…` _readonly_
- **`timeline`** — `SINGLE_LINE_TEXT`
- **`timeline_sub_title`** — `SINGLE_LINE_TEXT`
- **`creator_requirements`** — `SINGLE_LINE_TEXT`
- **`c-r_sub_title`** — `SINGLE_LINE_TEXT`
- **`quality_standards`** — `SINGLE_LINE_TEXT`
- **`q-s_sub_title_int`** — `SINGLE_LINE_TEXT`
- **`q-s_sub_title_ext`** — `SINGLE_LINE_TEXT`
- **`content_delivery`** — `SELECT` [Raw, Edited] _multi_
- **`title`** — `SINGLE_LINE_TEXT`
- **`attached`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(attachment, TRUE(), FALSE())` _readonly_
- **`creator_name`** — `SINGLE_LINE_TEXT`
- **`creator_email`** — `EMAIL`
- **`submission_open_date`** — `DATETIME`
- **`submission_close_date`** — `DATETIME`
- **`brief_document_URL`** — `URL`
- **`example`** — `LINKED_RECORD` → **reviews**
- **`example_analysis_1`** — `LOOKUP` (via `example` → reviews.`analysis` [FORMULA]) _readonly_
- **`example 2`** — `LINKED_RECORD` → **reviews**
- **`example_2_video`** — `LOOKUP` (via `example 2` → reviews.`embed_code` [FORMULA]) _readonly_
- **`example analysis_2`** — `LOOKUP` (via `example 2` → reviews.`analysis` [FORMULA]) _readonly_
- **`example 3`** — `LINKED_RECORD` → **reviews**
- **`example_3_video`** — `LOOKUP` (via `example 3` → reviews.`embed_code` [FORMULA]) _readonly_
- **`example analysis_3`** — `LOOKUP` (via `example 3` → reviews.`analysis` [FORMULA]) _readonly_
- **`example_video_1`** — `URL`
- **`example_video_3`** — `URL`
- **`qa_checklist`** — `SELECT` [26 choices: Product visibility, Product usage, Hook quality, Visual hook, Audio clarity…] _multi_
- **`example_video_2`** — `URL`
- **`PDF`** — `LINKED_RECORD` → **PDF** _multi_
- **`File (PDF)`** — `LOOKUP` (via `PDF` → PDF.`File` [ATTACHMENT]) _readonly, multi_
- **`pdf_url`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {attachment} != "",
  {attachment},
  {File (PDF)}
)
` _readonly_
- **`Show`** — `CHECKBOX`

---

## `submissions`

**Table ID:** `YdF2bMFS5LkUR1`  
**Primary field:** `name`  
**Fields:** 74

- **`name`** — `SINGLE_LINE_TEXT`
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`creator_name`** — `SINGLE_LINE_TEXT`
- **`creator_first_name`** — `FORMULA` [SINGLE_LINE_TEXT] `LEFT({creator_name}, FIND(" ", {creator_name}) - 1)` _readonly_
- **`email (users)`** — `LOOKUP` (via `users` → users.`email` [SINGLE_LINE_TEXT]) _readonly_
- **`creator_email`** — `EMAIL`
- **`account_id`** — `LOOKUP` (via `users` → users.`id (accounts)` [LOOKUP]) _readonly, multi_
- **`created_at`** — `CREATED_AT` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts**
- **`videos_remaining (usage) (accounts)`** — `LOOKUP` (via `accounts` → accounts.`videos_remaining (usage)` [LOOKUP]) _readonly, multi_
- **`reviews`** — `LINKED_RECORD` → **reviews** _multi_
- **`request_changes (reviews)`** — `LOOKUP` (via `reviews` → reviews.`request_changes` [FORMULA]) _readonly, multi_
- **`overall_status (reviews)`** — `LOOKUP` (via `reviews` → reviews.`overall_status` [SELECT]) _readonly, multi_
- **`video_file`** — `ATTACHMENT` _multi_
- **`video_url`** — `URL`
- **`submission_type`** — `SELECT` [Content Review, Brief, Example/Swipe File, Revision]
- **`status`** — `SELECT` [Pending, Reviewed, Split]
- **`brief_attachment`** — `ATTACHMENT` _multi_
- **`submission_notes`** — `LONG_TEXT`
- **`duration`** — `SINGLE_LINE_TEXT`
- **`resolution`** — `SINGLE_LINE_TEXT`
- **`aspect_ratio`** — `SINGLE_LINE_TEXT`
- **`file_size_mb`** — `SINGLE_LINE_TEXT`
- **`format`** — `SINGLE_LINE_TEXT`
- **`frames_per_second`** — `NUMBER` (precision 0)
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`users`** — `LINKED_RECORD` → **users**
- **`accounts (users)`** — `LOOKUP` (via `users` → users.`accounts` [LINKED_RECORD]) _readonly, multi_
- **`briefs (users)`** — `LOOKUP` (via `users` → users.`briefs` [LINKED_RECORD]) _readonly, multi_
- **`users_status`** — `LOOKUP` (via `users` → users.`status` [SELECT]) _readonly_
- **`users_videos_remaining`** — `LOOKUP` (via `users` → users.`videos_remaining` [LOOKUP]) _readonly, multi_
- **`users_payment_status`** — `LOOKUP` (via `users` → users.`payment_status (billing)` [LOOKUP]) _readonly, multi_
- **`created_at (billing)`** — `LOOKUP` (via `accounts` → accounts.`created_at (billing)` [LOOKUP]) _readonly_
- **`billing_created`** — `FORMULA` [SINGLE_LINE_TEXT] `{created_at (billing)}` _readonly_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`name (briefs)`** — `LOOKUP` (via `briefs` → briefs.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`id (reviews)`** — `LOOKUP` (via `reviews` → reviews.`id` [FORMULA]) _readonly, multi_
- **`embed_code`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  AND({status} = "Pending", {display_url} = ""),
  {loading_code},
  IF(
…` _readonly_
- **`display_url`** — `LOOKUP` (via `reviews` → reviews.`display_url` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`revisions_required`** — `LOOKUP` (via `reviews` → reviews.`revisions_required` [CHECKBOX]) _readonly, multi_
- **`thumbnail (reviews)`** — `LOOKUP` (via `reviews` → reviews.`thumbnail` [URL]) _readonly, multi_
- **`notifications`** — `LINKED_RECORD` → **notifications** _multi_
- **`message (notifications)`** — `LOOKUP` (via `notifications` → notifications.`message` [FORMULA]) _readonly, multi_
- **`title (notifications)`** — `LOOKUP` (via `notifications` → notifications.`title` [FORMULA]) _readonly, multi_
- **`active_month`** — `FORMULA` [NUMBER] `DATETIME_DIFF(TODAY(), {billing_created}, 'months')` _readonly_
- **`cycle_start`** — `FORMULA` [DATETIME] `DATEADD({billing_created}, {active_month}, 'months')` _readonly_
- **`cycle_end`** — `FORMULA` [DATETIME] `DATEADD({billing_created}, {active_month} + 1, 'months')` _readonly_
- **`current_billing_cycle`** — `FORMULA` [CHECKBOX] `AND({billing_created} >= {cycle_start}, {billing_created} < {cycle_end})` _readonly_
- **`public_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/live/submissions?recordId=", {id}, "")` _readonly_
- **`internal_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("/submissions/details?recordId=", {id}, "")` _readonly_
- **`user_link`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("https://brieflee.co", {internal_link})` _readonly_
- **`live_link`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://brieflee.co/live/submissions?recordId=" & {id}` _readonly_
- **`creator_link`** — `FORMULA` [SINGLE_LINE_TEXT] `"https://brieflee.co/live/submissions?recordId=" & {id} & "&name=" & {creator…` _readonly_
- **`live_link_button`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-copy-button value="' & {live_link} & '" copy-label="Click to copy" succe…` _readonly_
- **`revision_number`** — `SELECT` [11 choices: 0, 1, 2, 3, 4…]
- **`parent_submission_id`** — `SINGLE_LINE_TEXT`
- **`version`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {revision_number} = 0,
  "Original",
  IF(
    OR({revision_number} = "…` _readonly_
- **`platform_name`** — `SELECT` [Upload, Instagram, TikTok, YouTube]
- **`platform_icon`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {platform_name} = BLANK(),
  BLANK(),
  IF(
    LOWER({platform_name}) …` _readonly_
- **`platform_logo_url`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {platform_name} = "",
  "https://res.cloudinary.com/dspv9nm1n/image/upl…` _readonly_
- **`platform_full_name`** — `SINGLE_LINE_TEXT`
- **`platform_username`** — `SINGLE_LINE_TEXT`
- **`profile_image_url`** — `URL`
- **`loading_code`** — `LONG_TEXT`
- **`archive`** — `CHECKBOX`
- **`original_review_id`** — `SINGLE_LINE_TEXT`
- **`parent_submission`** — `LINKED_RECORD` → **submissions** _multi_
- **`is_bulk`** — `CHECKBOX`
- **`logic`** — `SELECT` [<i class="fa-solid fa-cloud-arrow-up"></i> Upload a file, <i class="fa-solid fa-link"></i> Paste a link, <i class="fa-solid fa-file-pdf"></i> Attach a brief, <i class="fa-regular fa-note-sticky"></i> Add notes, <i class="fa-regular fa-face-smile-beam"></i> Brieflee brief, <i class="fa-solid fa-upload"></i> Bulk upload] _multi_
- **`first`** — `CHECKBOX`
- **`user_validation`** — `SELECT` [proceed, stop]
- **`qa_checklist`** — `SELECT` [26 choices: Product visibility, Product usage, Hook quality, Visual hook, Audio clarity…] _multi_
- **`bulk_video_url`** — `LONG_TEXT`

---

## `reviews`

**Table ID:** `jRIJ8k8SOkaicy`  
**Primary field:** `name`  
**Fields:** 90

- **`name`** — `FORMULA` [SINGLE_LINE_TEXT] `{name (submissions)}` _readonly_
- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`name (submissions)`** — `LOOKUP` (via `submissions` → submissions.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`overall_rating`** — `RATING`
- **`transcript`** — `LONG_TEXT`
- **`transcript_button`** — `FORMULA` [SINGLE_LINE_TEXT] `'<sl-copy-button value="' & {transcript} & '" copy-label="Click to copy" succ…` _readonly_
- **`adapted_script`** — `LONG_TEXT`
- **`clean_adapted_script`** — `FORMULA` [SINGLE_LINE_TEXT] `SUBSTITUTE(
  REGEX_REPLACE({adapted_script}, "[\\*\\(\\)\\[\\]•]", ""),
  "n…` _readonly_
- **`script_button`** — `FORMULA` [SINGLE_LINE_TEXT] `IF({clean_adapted_script}, 
  CONCATENATE('<sl-copy-button value="', {clean_a…` _readonly_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`submission_notes (submissions)`** — `LOOKUP` (via `submissions` → submissions.`submission_notes` [LONG_TEXT]) _readonly, multi_
- **`creator_first_name (submissions)`** — `LOOKUP` (via `submissions` → submissions.`creator_first_name` [FORMULA]) _readonly, multi_
- **`live_link (submissions)`** — `LOOKUP` (via `submissions` → submissions.`live_link` [FORMULA]) _readonly, multi_
- **`duration (submissions)`** — `LOOKUP` (via `submissions` → submissions.`duration` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`submission_type (submissions)`** — `LOOKUP` (via `submissions` → submissions.`submission_type` [SELECT]) _readonly, multi_
- **`overall_status`** — `SELECT` [PASS, FAIL, FLAGGED, APPROVED, REVIEW, REJECTED]
- **`overall_comment`** — `SINGLE_LINE_TEXT`
- **`decision_reasoning`** — `SINGLE_LINE_TEXT`
- **`recommended_action`** — `SINGLE_LINE_TEXT`
- **`thumbnail`** — `URL`
- **`human_decision`** — `SELECT` [Approve, Reject, Changes Requested, Pending]
- **`ai_decision`** — `SELECT` [APPROVED, FLAGGED, REJECTED, REVIEW]
- **`ai_mode`** — `SELECT` [Autonomous, Hybrid, Manual]
- **`threshold_source`** — `SELECT` [Account, Brief]
- **`product_screen_time_score`** — `NUMBER` (precision 0)
- **`product_screen_time_status`** — `SELECT` [PASS, FAIL]
- **`product_screen_time_screenshot_url`** — `URL`
- **`hook_speed_screenshot_url`** — `URL`
- **`product_screen_time_comment`** — `SINGLE_LINE_TEXT`
- **`hook_speed_score`** — `NUMBER` (precision 0)
- **`hook_speed_status`** — `SELECT` [PASS, FAIL]
- **`hook_speed_comment`** — `SINGLE_LINE_TEXT`
- **`visual_hook_score`** — `NUMBER` (precision 0)
- **`visual_hook_status`** — `SELECT` [PASS, FAIL]
- **`visual_hook_comment`** — `SINGLE_LINE_TEXT`
- **`visual_hook_screenshot_url`** — `URL`
- **`cta_placement_score`** — `SINGLE_LINE_TEXT`
- **`cta_placement_status`** — `SELECT` [PASS, FAIL]
- **`cta_placement_screenshot_url`** — `URL`
- **`cta_placement_comment`** — `SINGLE_LINE_TEXT`
- **`face_time_score`** — `NUMBER` (precision 0)
- **`face_time_status`** — `SELECT` [PASS, FAIL]
- **`face_time_screenshot_url`** — `URL`
- **`face_time_comment`** — `SINGLE_LINE_TEXT`
- **`text_legibility_score`** — `NUMBER` (precision 0)
- **`text_legibility_status`** — `SELECT` [PASS, FAIL]
- **`text_legibility_screenshot_url`** — `URL`
- **`text_legibility_comment`** — `SINGLE_LINE_TEXT`
- **`audio_clarity_score`** — `NUMBER` (precision 0)
- **`audio_clarity_status`** — `SELECT` [PASS, FAIL]
- **`audio_clarity_screenshot_url`** — `URL`
- **`audio_clarity_comment`** — `SINGLE_LINE_TEXT`
- **`engagement_pacing_score`** — `NUMBER` (precision 0)
- **`engagement_pacing_status`** — `SELECT` [PASS, FAIL]
- **`engagement_pacing_screenshot_url`** — `URL`
- **`engagement_pacing_comment`** — `SINGLE_LINE_TEXT`
- **`brand_mention_count_score`** — `NUMBER` (precision 0)
- **`brand_mention_count_status`** — `SELECT` [PASS, FAIL]
- **`brand_mention_count_screenshot_url`** — `URL`
- **`brand_mention_count_comment`** — `SINGLE_LINE_TEXT`
- **`copyright_status`** — `SELECT` [PASS, FAIL, 0, 80, 85, 50, 20]
- **`copyright_details`** — `SINGLE_LINE_TEXT`
- **`copyright_screenshot_url`** — `URL`
- **`content_moderation_status`** — `SELECT` [PASS, FAIL]
- **`content_moderation_details`** — `SINGLE_LINE_TEXT`
- **`content_moderation_screenshot_url`** — `URL`
- **`brand/brief_alignment_status`** — `SELECT` [ALIGNED, NEEDS ADJUSTMENT, MISALIGNED, PASS, FAIL]
- **`brand/brief_alignment_details`** — `SINGLE_LINE_TEXT`
- **`off-brand_elements`** — `SINGLE_LINE_TEXT`
- **`brand/brief_alignment_url`** — `URL`
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`creator_email (submissions)`** — `LOOKUP` (via `submissions` → submissions.`creator_email` [EMAIL]) _readonly, multi_
- **`creator_name (submissions)`** — `LOOKUP` (via `submissions` → submissions.`creator_name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`video_file (submissions)`** — `LOOKUP` (via `submissions` → submissions.`video_file` [ATTACHMENT]) _readonly, multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`name (briefs)`** — `LOOKUP` (via `briefs` → briefs.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`notifications`** — `LINKED_RECORD` → **notifications** _multi_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`failed_thresholds_list`** — `FORMULA` [SINGLE_LINE_TEXT] `LEFT(
  TRIM(
    IF({product_screen_time_status} = "FAIL", "Product Screen T…` _readonly_
- **`display_url`** — `SINGLE_LINE_TEXT`
- **`embed_code`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {display_url} != "",
  "<iframe width='315' height='560' src='" & SUBST…` _readonly_
- **`request_message`** — `LONG_TEXT`
- **`request_changes`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {submission_type (submissions)} = "Example/Swipe File",
  "This is an e…` _readonly_
- **`review_board`** — `LINKED_RECORD` → **review_report** _multi_
- **`revisions_required`** — `CHECKBOX`
- **`analysis`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  CONCATENATE(
    IF({transcript}, CONCATENATE("Transcript: ", {transcri…` _readonly_
- **`briefs 2`** — `LINKED_RECORD` → **briefs** _multi_
- **`briefs 3`** — `LINKED_RECORD` → **briefs** _multi_

---

## `review_report`

**Table ID:** `PyLcZSiB1d9sAH`  
**Primary field:** `threshold`  
**Fields:** 18

- **`threshold`** — `SINGLE_LINE_TEXT`
- **`score`** — `SINGLE_LINE_TEXT`
- **`threshold_value`** — `SINGLE_LINE_TEXT`
- **`rating`** — `RATING`
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`review`** — `LINKED_RECORD` → **reviews** _multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`severity`** — `SELECT` [Major, Critical, Minor, Info, WARNING]
- **`status`** — `SELECT` [PASS, FAIL, NEEDS ADJUSTMENT, ALIGNED, MISALIGNED]
- **`comment`** — `SINGLE_LINE_TEXT`
- **`screenshot_url`** — `URL`
- **`embed_code (reviews)`** — `LOOKUP` (via `review` → reviews.`embed_code` [FORMULA]) _readonly, multi_
- **`id (reviews)`** — `LOOKUP` (via `review` → reviews.`id` [FORMULA]) _readonly, multi_
- **`key_moment_timestamp`** — `SELECT` [66 choices: 0, 33, 12, 1, 2…] _multi_

---

## `notifications`

**Table ID:** `CCoX2TFkOLk89I`  
**Primary field:** `id`  
**Fields:** 34

- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`created_at`** — `CREATED_AT` _readonly_
- **`logo`** — `SINGLE_LINE_TEXT`
- **`notification_type`** — `SELECT` [11 choices: Welcome, Submission received, Review completed, Content approved, Content rejected…]
- **`title`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {notification_type} = "System update",
  {system_update_title},
  SWITC…` _readonly_
- **`message`** — `FORMULA` [SINGLE_LINE_TEXT] `IF({notification_type} = "System update", {system_update_message}, 
  SWITCH(…` _readonly_
- **`first_name (users)`** — `LOOKUP` (via `users` → users.`first_name` [FORMULA]) _readonly, multi_
- **`system_update_message`** — `SINGLE_LINE_TEXT`
- **`system_update_title`** — `SINGLE_LINE_TEXT`
- **`is_read`** — `CHECKBOX`
- **`status`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {is_read} = 'true',
  "🟢",
  "🔴"
)` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`friendly_time`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  DATETIME_DIFF(NOW(), {created_at}, 'minutes') < 1,
    'just now',
  IF…` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`name (accounts)`** — `LOOKUP` (via `accounts` → accounts.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`users`** — `LINKED_RECORD` → **users** _multi_
- **`email (users)`** — `LOOKUP` (via `users` → users.`email` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`projects`** — `LINKED_RECORD` → **projects** _multi_
- **`briefs`** — `LINKED_RECORD` → **briefs** _multi_
- **`name (briefs)`** — `LOOKUP` (via `briefs` → briefs.`name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`submissions`** — `LINKED_RECORD` → **submissions** _multi_
- **`user_link (submissions)`** — `LOOKUP` (via `submissions` → submissions.`user_link` [FORMULA]) _readonly, multi_
- **`live_link (submissions)`** — `LOOKUP` (via `submissions` → submissions.`live_link` [FORMULA]) _readonly, multi_
- **`creator_email (submissions)`** — `LOOKUP` (via `submissions` → submissions.`creator_email` [EMAIL]) _readonly, multi_
- **`status (submissions)`** — `LOOKUP` (via `submissions` → submissions.`status` [SELECT]) _readonly, multi_
- **`creator_name (submissions)`** — `LOOKUP` (via `submissions` → submissions.`creator_name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`creator_first_name`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(ISERROR(FIND(" ", {creator_name (submissions)})), {creator_name (submissio…` _readonly_
- **`reviews`** — `LINKED_RECORD` → **reviews** _multi_
- **`request_changes (reviews)`** — `LOOKUP` (via `reviews` → reviews.`request_changes` [FORMULA]) _readonly, multi_
- **`ai_mode (reviews)`** — `LOOKUP` (via `reviews` → reviews.`ai_mode` [SELECT]) _readonly, multi_
- **`failed_thresholds_list (reviews)`** — `LOOKUP` (via `reviews` → reviews.`failed_thresholds_list` [FORMULA]) _readonly, multi_
- **`overall_status (reviews)`** — `LOOKUP` (via `reviews` → reviews.`overall_status` [SELECT]) _readonly, multi_
- **`overall_rating (reviews)`** — `LOOKUP` (via `reviews` → review_report.`rating` [RATING]) _readonly, multi_
- **`ai_decision (reviews)`** — `LOOKUP` (via `reviews` → reviews.`ai_decision` [SELECT]) _readonly, multi_

---

## `pricing`

**Table ID:** `gGyTkXrUpW697X`  
**Primary field:** `id`  
**Fields:** 29

- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`product_name`** — `SINGLE_LINE_TEXT`
- **`rate`** — `NUMBER` (precision 2)
- **`price`** — `NUMBER` (precision 2)
- **`tier`** — `SELECT` [Crew, Creator, Studio]
- **`interval`** — `SELECT` [Monthly, Yearly, -]
- **`payment_link`** — `URL`
- **`trial_payment_link`** — `URL`
- **`stripe_product_id`** — `SINGLE_LINE_TEXT`
- **`stripe_price_id`** — `SINGLE_LINE_TEXT`
- **`scheme`** — `SELECT` [recurring, one-off]
- **`max_workspaces`** — `NUMBER` (precision 0)
- **`max_users`** — `NUMBER` (precision 0)
- **`max_videos`** — `NUMBER` (precision 0)
- **`max_storage_gb`** — `NUMBER` (precision 0)
- **`max_storage_formatted`** — `NUMBER` (precision 0)
- **`value_time_saved`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE(
    "Save ",
  ROUND({max_videos} / 3, 1),
  " hours/month"
)` _readonly_
- **`money_saved`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE(
  "Save $",
  ROUND(
    ({max_videos} / 3 * 25) - {rate},
    0…` _readonly_
- **`currency`** — `SINGLE_LINE_TEXT`
- **`trial_days`** — `NUMBER` (precision 0)
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`billing`** — `LINKED_RECORD` → **billing** _multi_
- **`internal_link`** — `SINGLE_LINE_TEXT`
- **`sandbox_trial_payment_link`** — `URL`
- **`image`** — `URL`
- **`sandbox_payment_link`** — `URL`
- **`sandbox_product_id`** — `SINGLE_LINE_TEXT`
- **`sandbox_price_id`** — `SINGLE_LINE_TEXT`

---

## `billing`

**Table ID:** `sQP8T9IIlaJgho`  
**Primary field:** `id`  
**Fields:** 41

- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`customer_email`** — `EMAIL`
- **`customer_name`** — `SINGLE_LINE_TEXT`
- **`customer_phone`** — `PHONE`
- **`stripe_customer_id`** — `SINGLE_LINE_TEXT`
- **`subscription_id`** — `SINGLE_LINE_TEXT`
- **`event`** — `SINGLE_LINE_TEXT`
- **`price_id`** — `SINGLE_LINE_TEXT`
- **`product_id`** — `SINGLE_LINE_TEXT`
- **`type`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  OR(
    {product_id} = 'prod_S7fPzdwc1WpZDu',
    {product_id} = 'prod_…` _readonly_
- **`net_amount`** — `NUMBER` (precision 2)
- **`tax`** — `NUMBER` (precision 2)
- **`total_amount`** — `NUMBER` (precision 2)
- **`payment_status`** — `SELECT` [paid, overdue, unpaid, cancelled, trial, incomplete, expired, ended]
- **`description`** — `SINGLE_LINE_TEXT`
- **`trial_period_days`** — `SINGLE_LINE_TEXT`
- **`trial_status`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {stripe_created} = BLANK(),
  'no_trial',
  IF(
    TODAY() <= DATEADD(…` _readonly_
- **`invoice_url`** — `URL`
- **`invoice_id`** — `SINGLE_LINE_TEXT`
- **`invoice`** — `URL`
- **`stripe_created`** — `DATETIME`
- **`stripe_cancelled`** — `DATETIME`
- **`failed_date`** — `DATETIME`
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`active_months`** — `FORMULA` [NUMBER] `DATETIME_DIFF(TODAY(), {stripe_created}, 'months')` _readonly_
- **`cycle_start`** — `FORMULA` [DATETIME] `DATEADD({stripe_created}, {active_months}, 'month')` _readonly_
- **`cycle_end`** — `FORMULA` [SINGLE_LINE_TEXT] `IF(
  {type} = 'one-off',
  DATEADD({stripe_created}, 1, 'month'),
  DATEADD(…` _readonly_
- **`days_to renewal`** — `FORMULA` [NUMBER] `DATETIME_DIFF({cycle_end}, TODAY(), 'days')` _readonly_
- **`current_billing_cycle`** — `FORMULA` [CHECKBOX] `AND(
  DATE(NOW()) >= DATE({cycle_start}),
  DATE(NOW()) <= DATE({cycle_end})
)` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`user`** — `LINKED_RECORD` → **users**
- **`usage`** — `LINKED_RECORD` → **usage** _multi_
- **`pricing`** — `LINKED_RECORD` → **pricing** _multi_
- **`interval (pricing)`** — `LOOKUP` (via `pricing` → pricing.`interval` [SELECT]) _readonly, multi_
- **`max_storage_formatted (pricing)`** — `LOOKUP` (via `pricing` → pricing.`max_storage_formatted` [NUMBER]) _readonly, multi_
- **`product_name (pricing)`** — `LOOKUP` (via `pricing` → pricing.`product_name` [SINGLE_LINE_TEXT]) _readonly, multi_
- **`max_users`** — `LOOKUP` (via `pricing` → pricing.`max_users` [NUMBER]) _readonly, multi_
- **`max_workspaces`** — `LOOKUP` (via `pricing` → pricing.`max_workspaces` [NUMBER]) _readonly, multi_
- **`max_storage_gb`** — `LOOKUP` (via `pricing` → pricing.`max_storage_gb` [NUMBER]) _readonly, multi_
- **`max_videos`** — `LOOKUP` (via `pricing` → pricing.`max_videos` [NUMBER]) _readonly, multi_

---

## `usage`

**Table ID:** `dw2IeLOtYJLulR`  
**Primary field:** `id`  
**Fields:** 28

- **`id`** — `FORMULA` [SINGLE_LINE_TEXT] `RECORD_ID()` _readonly_
- **`accounts`** — `LINKED_RECORD` → **accounts** _multi_
- **`total_videos`** — `LOOKUP` (via `accounts` → accounts.`total_videos` [ROLLUP]) _readonly, multi_
- **`total_storage_gb`** — `LOOKUP` (via `accounts` → accounts.`total_storage_gb` [ROLLUP]) _readonly, multi_
- **`total_members`** — `LOOKUP` (via `accounts` → accounts.`total users` [ROLLUP]) _readonly, multi_
- **`total_workspaces`** — `LOOKUP` (via `accounts` → accounts.`total_workspaces` [LOOKUP]) _readonly, multi_
- **`billing`** — `LINKED_RECORD` → **billing**
- **`tier`** — `LOOKUP` (via `billing` → billing.`product_name (pricing)` [LOOKUP]) _readonly, multi_
- **`interval (pricing) (billing)`** — `LOOKUP` (via `billing` → billing.`interval (pricing)` [LOOKUP]) _readonly_
- **`plan`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE({tier}, " ", {interval (pricing) (billing)})` _readonly_
- **`cycle_start`** — `LOOKUP` (via `billing` → billing.`cycle_start` [FORMULA]) _readonly_
- **`cycle_end`** — `LOOKUP` (via `billing` → billing.`cycle_end` [FORMULA]) _readonly_
- **`renewal_date`** — `FORMULA` [DATETIME] `DATE({cycle_end})` _readonly_
- **`max_workspaces`** — `FORMULA` [SINGLE_LINE_TEXT] `SWITCH(
  {tier},
  "Creator", 1,
  "Crew", 5,
  "Studio", 10,
  0
)` _readonly_
- **`max_storage_gb`** — `FORMULA` [SINGLE_LINE_TEXT] `SWITCH(
  {tier},
  "Creator", 10000,
  "Crew", 50000,
  "Studio", 100000,
  0
)` _readonly_
- **`max_videos (billing)`** — `LOOKUP` (via `billing` → billing.`max_videos` [LOOKUP]) _readonly, multi_
- **`max_members`** — `FORMULA` [SINGLE_LINE_TEXT] `SWITCH(
  {tier},
  "Creator", 1,
  "Crew", 5,
  "Studio", 10,
  0
)` _readonly_
- **`max_videos`** — `FORMULA` [SINGLE_LINE_TEXT] `{max_videos (billing)}` _readonly_
- **`created_at`** — `CREATED_AT` _readonly_
- **`updated_at`** — `UPDATED_AT` _readonly_
- **`workspaces_remaining`** — `FORMULA` [NUMBER] `{max_workspaces}-{total_workspaces}` _readonly_
- **`members_remaining`** — `FORMULA` [NUMBER] `{max_members}-{total_members}` _readonly_
- **`storage_remaining`** — `FORMULA` [NUMBER] `{max_storage_gb}-{total_storage_gb}` _readonly_
- **`videos_remaining`** — `FORMULA` [NUMBER] `{max_videos}-{total_videos}` _readonly_
- **`members_remaining_bar`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("<sl-progress-bar value='", IF({max_members} > 0, ROUND((({total_…` _readonly_
- **`workspaces_remaining_bar`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("<sl-progress-bar value='", IF({max_workspaces} > 0, ROUND((({tot…` _readonly_
- **`storage_remaining_bar`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("<sl-progress-bar value='", IF({max_storage_gb} > 0, ROUND((({tot…` _readonly_
- **`videos_remaining_bar`** — `FORMULA` [SINGLE_LINE_TEXT] `CONCATENATE("<sl-progress-bar value='", IF({max_videos} > 0, ROUND((({total_v…` _readonly_

---

## `PDF`

**Table ID:** `jmhK0ijOUpnBpe`  
**Primary field:** `Name`  
**Fields:** 5

- **`Name`** — `FORMULA` [SINGLE_LINE_TEXT] `RIGHT(
  {File},
  LEN({File}) - FIND(
    "/",
    {File},
    FIND(
      "…` _readonly_
- **`File`** — `ATTACHMENT` _multi_
- **`Status`** — `SELECT` [Todo, In progress, Done]
- **`User`** — `LINKED_RECORD` → **users** _multi_
- **`Briefs`** — `LINKED_RECORD` → **briefs** _multi_
