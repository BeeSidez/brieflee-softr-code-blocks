# /pricing and /plan, as they run live

Pulled 2026-08-26. **The pricing surface is already migrated.** All four
blocks run the annual-only model with the 30-day money-back guarantee. No
monthly toggle, no 7-day trial, anywhere in this code.

## /pricing (public)

| hrid | id | What it is |
| --- | --- | --- |
| vibe-coding1 | `96353646` | Referly affiliate tracker |
| ai3 | `9aff9d38` | PLAN block v2, annual-only rebuild |
| testimonials | `e6c1b07a` | not yet pulled |
| ai4 | `fe58afaf` | FAQ, rewritten for annual-only |

`ai3`'s header refers to a v1 `marketing.jsx` that "stays live until launch
day". That v1 block is **not** on /pricing, so this page renders one plan
section. Worth confirming where v1 still sits, and retiring it.

## /plan (in-app)

| hrid | id | Shown to |
| --- | --- | --- |
| trial-plans | `8e98d3ac` | **No Stripe ID** group, i.e. has not bought |
| change-plan | `52239992` | **Stripe ID** + Videos Available |

`change-plan` matches the current plan on TIER, not on pricing-row id,
because the 2026 annual repricing moved the live Studio row from
`KHrjkggVIoUOze` to `eCF6Gzxy6Bv59G`.

## One thing to confirm in Stripe

The same three Payment Links are documented with two different redirect
destinations:

- `/plan` blocks say they redirect to `/payment-success?session_id=`
- `/pricing` v2 says they redirect to `/sign-up?session_id={CHECKOUT_SESSION_ID}`

A Payment Link has one redirect, set in Stripe, so one of these comments is
stale. Which it is decides where a logged-out buyer lands.

```
Creator https://buy.stripe.com/fZueVe02H4aQeEl6CtcAo0N
Crew    https://buy.stripe.com/7sY7sM3eTdLq53L9OFcAo0L
Studio  https://buy.stripe.com/28E14og1F4aQ8fXgd3cAo0M
```

## Numbers the blocks hardcode

Creator $588/yr, Crew $2,268/yr, Studio $4,788/yr.
Video credits 150 / 750 / 2,000 a month. Brief credits 20 / 60 / 180.
Users 1 / 5 / 10. Brand profiles 1 / 5 / 10.
An AI-written brief costs 5 brief credits; writing one yourself is free.
Per-video: $0.33 Creator, $0.25 Crew, $0.20 Studio.
Extra users $12/mo each, extra brand profiles $49/mo each.
Above 2,000 reviews a month goes to /book-a-demo.
Live pricing rows: Creator `VgmYoJPDykqSGB`, Crew `0dy1TIY6dUVNnF`,
Studio `eCF6Gzxy6Bv59G`.
