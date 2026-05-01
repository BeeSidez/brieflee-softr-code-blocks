# Email assets — URLs & images

Fill-in tables for every CTA URL and image asset referenced across Brieflee email templates. Edit the **URL/Cloudinary URL** column with real values, then reference these as Mustache variables in EmailIt templates (e.g. `{{cta_dashboard}}`, `{{img_day01_welcome}}`).

---

## CTA URLs — Mustache variables in templates

| Placeholder | What it does | Suggested URL | Used in templates |
|---|---|---|---|
| `cta_dashboard` | Sends user to their dashboard home | `https://www.brieflee.co/new` | bl-features-day-01-welcome, bl-tx-payment-success |
| `cta_brand_bio` | Edit brand bio / blueprint settings | `https://www.brieflee.co/settings#tab1` | bl-features-day-02-account, bl-trial-create-account, bl-trial-create-account-day6 |
| `cta_thresholds` | Quality thresholds settings page | `https://www.brieflee.co/settings#tab4` | bl-features-day-04-quality-settings, bl-trial-set-quality-settings |
| `cta_review_mode` | AI review mode picker (Auto/Hybrid/Manual) | `https://www.brieflee.co/settings#tab1` | bl-features-day-05-review-content, bl-trial-pick-review-mode |
| `cta_swipe_files` | Swipe files library | `https://www.brieflee.co/videos` | bl-features-day-03-swipe-videos |
| `cta_quick_review` | Start a quick review / submission | `https://www.brieflee.co/videos?modal=%2Freview&modalSize=undefined&modalPlacement=end` | bl-trial-first-review |
| `cta_briefs` | Briefs list | `https://www.brieflee.co/project` | bl-features-day-08-create-brief, bl-features-day-06-remix-content |
| `cta_campaigns` | Campaigns list | `https://www.brieflee.co/project` | bl-features-day-07-create-campaign |
| `cta_team_invite` | Team invite page | `https://www.brieflee.co/settings/settings#tab3` | bl-features-day-09-invite-team |
| `cta_members` | Members management | `https://www.brieflee.co/settings/projects` | bl-features-day-10-invite-members |
| `cta_invite_creators` | Creator invite flow | `https://www.brieflee.co/projects` | bl-features-day-11-invite-creators |
| `cta_bulk_briefs` | Bulk import briefs | `https://www.brieflee.co/briefs` | bl-features-day-12-bulk-upload-briefs |
| `cta_bulk_videos` | Bulk import videos | `https://www.brieflee.co/bulk` | bl-features-day-13-bulk-upload-videos |
| `cta_affiliate` | Affiliate dashboard | `https://www.brieflee.co/settings#tab5` | bl-features-day-14-affiliate |
| `cta_upgrade` | Upgrade plan page (with promo code in query if applicable) | `https://www.brieflee.co/upgrade?promo={{promo_code}}` | bl-trial-reminder-1, bl-trial-reminder-2-48h, bl-trial-reminder-3-24h, bl-trial-ends-today |
| `cta_manage_subscription` | Subscription / billing management | `https://www.brieflee.co/settings/billing` | bl-tx-payment-success |
| `cta_update_payment` | Update payment method (Stripe Customer Portal session URL) | Generated per-user via Stripe API; otherwise `https://www.brieflee.co/settings/billing` | bl-tx-payment-failed |
| `cta_accept_invite` | Accept team invite / first login | `https://www.brieflee.co/login` | bl-tx-team-invite |
| `unsubscribe` | One-click unsubscribe | Auto-handled by EmailIt — don't set manually; EmailIt injects via List-Unsubscribe header | All marketing emails |

**Notes:**
- For `cta_update_payment`, ideally generate a per-user Stripe Customer Portal session URL via the Stripe API in the workflow, then pass as a variable. Static link `/settings/billing` is the fallback.
- For `cta_upgrade`, you can append `?promo={{promo_code}}` so the upgrade page pre-fills the discount code (TRIALUPGRADE / LASTCHANCE / FINALDAY).
- Track click-through with UTM params if you want analytics: `?utm_source=emailit&utm_medium=email&utm_campaign={{template_alias}}`.

---

## Image assets — feature icons (14 hero icons, one per drip day)

Bev's existing Cloudinary "Help Icons" set already covers most days. Mapping below uses what exists; only Day 3 (swipe files) and Day 6 (remix) need new icons sourced.

| Day | Variable | Used in template | Cloudinary URL | What the image is (visual) | Why it works for this day |
|---|---|---|---|---|---|
| 01 | `img_day01_welcome` | bl-features-day-01-welcome | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389797/Get_started_tm14vh.png` | Purple rocket launching | Welcome / getting started — rocket = liftoff vibe |
| 02 | `img_day02_account` | bl-features-day-02-account | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389801/Workspace_bkh8wa.png` | Purple checkmark badge / verified seal | Workspace / brand setup completion |
| 03 | `img_day03_swipe_files` | bl-features-day-03-swipe-videos | **NEED NEW ICON** | _(to source — folder with star/heart, or pinboard with cards)_ | Inspo collection — saved-content vibe. Search Iconify for "inspo", "collection", "pinboard". |
| 04 | `img_day04_thresholds` | bl-features-day-04-quality-settings | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389799/Settings_kbq9qn.png` | Purple settings gear / cog | Settings — quality thresholds tuning |
| 05 | `img_day05_ai_review` | bl-features-day-05-review-content | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389801/Videos_x0dynd.png` | Purple video camera / camcorder | Reviewing video content |
| 06 | `img_day06_remix` | bl-features-day-06-remix-content | **NEED NEW ICON** | _(to source — shuffle / two-cards-merging / remix arrows)_ | Remix transformation. Search Iconify for "remix", "shuffle", "transform". |
| 07 | `img_day07_campaigns` | bl-features-day-07-create-campaign | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389798/Notifications_erne2u.png` | Purple megaphone / bullhorn | Campaign launch / announcing |
| 08 | `img_day08_briefs` | bl-features-day-08-create-brief | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389797/Brief_Projects_cwpmda.png` | Purple folder with document | Briefs as documents in a folder |
| 09 | `img_day09_team` | bl-features-day-09-invite-team | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389800/Team_csjyjb.png` | Purple ID card / badge with person silhouette | Team members / collaborators |
| 10 | `img_day10_members` | bl-features-day-10-invite-members | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389798/Members_nqt3dq.png` | Purple person silhouette with notification badge "1" | Single member added — person + indicator |
| 11 | `img_day11_creators` | bl-features-day-11-invite-creators | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389801/Videos_x0dynd.png` (reuse) | Purple video camera (same as day 5) | Creators make videos. Reuse OK or source a film-slate icon for distinction. |
| 12 | `img_day12_bulk_briefs` | bl-features-day-12-bulk-upload-briefs | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389797/Brief_Projects_cwpmda.png` (reuse) | Purple folder with document (same as day 8) | Briefs in bulk — same folder. Stack-of-documents icon would be better if you find one. |
| 13 | `img_day13_bulk_videos` | bl-features-day-13-bulk-upload-videos | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389801/Videos_x0dynd.png` (reuse) | Purple video camera (same as day 5) | Videos in bulk — reuse camera or source a film-reel icon. |
| 14 | `img_day14_affiliate` | bl-features-day-14-affiliate | `https://res.cloudinary.com/dchroynzv/image/upload/v1765389797/Affilate_nzaac2.png` | Purple trophy on a base | Affiliate / referral rewards / earning |

**Status:** 12 of 14 covered by existing assets. Only Days 3 and 6 need new icons sourced.

**Source ideas for the missing two:**
- [Iconify](https://icon-sets.iconify.design) (free SVG icon library — search by concept)
- [Streamline](https://www.streamlinehq.com) (paid, branded icon sets — match the style of your existing icons)
- [Heroicons](https://heroicons.com) (free, simple line icons)
- AI-generated via Midjourney / DALL-E if you want unique branded style

**Other existing Cloudinary assets** (not yet mapped to drip days but available — described by what the image shows):

| Filename | What the image is (visual) | Could be used for |
|---|---|---|
| `Help_Icons_yds9ui.png` | Purple electric plug | Integrations, connections, "plug into your workflow" |
| `Publish_aj28xb.png` | Purple cursor / arrow pointer | Publishing, "go live", click-to-act emails |
| `Projects_lkzbt2.png` | Purple grid of cards / dashboard | Projects, dashboard overview, "your overview" emails |
| `Core_concepts_s8qktl.png` | Purple target / bullseye with arrow | Goals, focus, "hit your targets", "core principles" |
| `FAQ_qhbyga.png` | Purple eyes peeking | "Take a look", FAQs, "see how this works", curiosity hooks |
| `Billing_vvwno1.png` | Purple wallet with money / cash | `bl-tx-payment-success`, `bl-tx-payment-failed`, upgrade emails, billing-related |
| `Troubleshoot_fenkib.png` | Purple lightning bolt | "We noticed an issue", debug, urgent attention, fast action |
| `Brief_nloqsq.png` | Purple document with a plus icon | "Create your first brief", new doc, get-started CTAs |
| `Add_users_rdm4vy.png` | Purple person silhouette interacting with a screen / monitor | Invite flow, onboarding, "log in" CTAs |
| `Workspaces_irusls.png` | Purple light bulb | Ideas, inspo, "here's a tip", insight emails |

The "What the image is" column lets you scan visually and reuse icons across many emails — the rocket isn't only for getting started; it could anchor any "launch" or "go live" email later.

---

## Other Cloudinary assets

| Asset | Filename suggestion | Variable | Used in |
|---|---|---|---|
| Brieflee logo (header) | `bl/email/logo.png` | `img_logo` | All templates (header) |
| Bev headshot (signature) | `bl/email/bev-headshot.png` | `img_bev` | bl-features-day-01-welcome, bl-tx-payment-success, bl-trial-ends-today, win-back emails — anywhere you want a personal touch |
| AI review feedback panel screenshot | `bl/email/screenshot-ai-review.png` | `img_screenshot_ai_review` | bl-features-day-05-review-content (hero) |
| Threshold settings screenshot (optional) | `bl/email/screenshot-thresholds.png` | `img_screenshot_thresholds` | bl-features-day-04-quality-settings (optional hero) |
| Swipe board screenshot (optional) | `bl/email/screenshot-swipe-board.png` | `img_screenshot_swipe_board` | bl-features-day-03-swipe-videos (optional hero) |
| Footer/social icons | `bl/email/footer-social-icons.png` | `img_footer_social` | All templates (footer) — TikTok, IG, LinkedIn etc. |

---

## Suggested template HTML pattern

```html
<!-- Header with logo -->
<img src="{{img_logo}}" alt="Brieflee" width="120">

<!-- Hero icon for the day -->
<img src="{{img_day05_ai_review}}" alt="AI review" width="64">

<h1>Hi {{first_name}},</h1>

<p>Today's feature: AI review.</p>

<!-- Optional product screenshot -->
<img src="{{img_screenshot_ai_review}}" alt="AI review feedback panel" width="500">

<!-- Primary CTA -->
<a href="{{cta_review_mode}}" class="btn">Pick your review mode</a>

<!-- Signature -->
<img src="{{img_bev}}" alt="Bev" width="80">
<p>— Bev<br><em>Founder, Brieflee</em></p>

<!-- Footer -->
<img src="{{img_footer_social}}" alt="Follow us">
<a href="{{unsubscribe}}">Unsubscribe</a>
```

---

## When you're ready to fill in URLs

1. Replace the **Suggested URL** column above with your actual production URLs
2. In EmailIt's template editor, every `<a href="{{cta_*}}">` becomes a real link via the Mustache substitution
3. When the workflow's Call API step sends the email, include all the variables this template needs in the `variables` object

**All 19 CTAs and 14+5 images can be passed in one `variables` object per send** — that's the simplest pattern. Pre-build a "common variables" payload as a custom code step output and reuse it across template sends.
