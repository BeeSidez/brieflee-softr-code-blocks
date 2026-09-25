# Destination sweep

Every link on 52 pages checked by **where it points**, not what it says.
Targets: `/sign-up`, `/sign-up1`, `/signup`, `/book-call`, `/trial`.

Run against the **builder**, so it reflects what will publish, not what is
live today.

## Method note

Raw string matches are misleading here. Vibe block source is embedded in the
page config, so a path inside a code comment matches just as loudly as a real
`href`. Every hit below was opened and classified as CODE or COMMENT before
being reported.

Four hits looked like defects and turned out to be comments only:

| Page | Block | Verdict |
|---|---|---|
| `/` | hero | 3 mentions of `/signup` in comments. Real constant is `SIGNUP_URL = ".../sign-up"`, correct. |
| `/pricing` | ai3 | 2 comments. No code. |
| `/book-a-demo` | vibe-coding1 | 1 comment referencing the A/B against `/book-call`. |
| `/free-tool-video-breakdown` | ai2 | 1 comment. |

`/payment-success` uses `SIGN_UP_PATH = "/sign-up"` deliberately, to send a
paid customer to create their login. Correct, left alone.

---

## 1. Vibe blocks, fixable by push

**One.**

### `/free-tool-tiktok-video-analyser`, block `ea0833d1-78e6-4f52-b3dc-e4435bb746c6`

```
 66: const BOOK_CALL_URL  = "https://www.brieflee.co/book-call";
 67: const BOOK_DEMO_URL  = "https://www.brieflee.co/book-a-demo";
 73: const BOOK_CALL_PATH = "/book-call";
 74: const BOOK_DEMO_PATH = "/book-a-demo";
527: <a href={BOOK_CALL_URL} onClick={openModal(BOOK_CALL_PATH)} ...>
```

The `BOOK_DEMO_*` pair already exists, so this migration was started and one
anchor was left behind. Line 527 is the only use site. Fixing it makes the
`BOOK_CALL_*` pair unused, so both should come out in the same push.

---

## 2. Native blocks, Studio only

### The footer, on 29 pages

`footer1` carries a **Sign Up** link to `/sign-up1`. It is a shared Softr
footer, so this is **one edit that fixes 29 pages**.

Pages: `/`, `/pricing`, `/demo`, `/faq`, `/blogs`, `/blog`, all 8 audience
pages, `/brieflee-vs-frame-io`, and all 14 free tool and calculator pages.

`/ai-video-ad-briefs-` uses a **second footer**, `home-footer1`, with the same
link. That needs its own edit.

### The header, on 3 pages

`header1` carries a **Sign Up** link to `/sign-up1` on `/article`, `/tour` and
`/help`. Other pages use header variants without it, so the site is running
more than one header. Worth deciding whether that is intentional.

The header also has a **"Book Call"** item. Its destination is already
`/book-a-demo`, so only the label is off convention.

### `/demo`

Native `hero8` block links to `/sign-up1`. The vibe `final-cta` on that page
is already fixed.

### `/ai-video-ad-briefs-`

Native `hero2` opens a modal at **`/trial`**, a page for a product that has no
trial. A replacement Hero vibe block is already built for this page.

### The 8 audience pages

Still showing their native blocks until those are disabled: `hero3`,
`feature-grid5` (6 buttons), `feature2`, `cta5`, all to `/sign-up1`. All
covered in HANDOVER.md, all superseded by the single page block.

---

## What this changes about the earlier sweep

The trial word-search missed these because none of them say "trial":

- the footer Sign Up, on 29 pages
- the header Sign Up
- the audience page `feature2` "Get started"
- the TikTok analyser's Book Call

The footer alone is the single highest-reach wrong destination on the site.
