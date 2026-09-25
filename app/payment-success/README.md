# /payment-success

App `5c5521fd-af6f-4488-9edf-1add48539912` · page `e332919c-b0c5-4a6c-ac20-31fe96faa761` · block `4104b067-e3d0-466d-a494-b1d1e956bb4e`
Rebuilt 5 September. **Not published.**

## What changed

- **The onboarding calendar is now in the page.** It used to send the customer to tidycal.com. It now opens in an iframe below the card, using the same embed pattern as `/book-a-demo` and `/book-call`: `?embed=1`, name and email prefilled from `useCurrentUser`, and a `bookingComplete` listener on both `window` and `window.top`.
- **Booking flips the page to a confirmation state**, and the primary button becomes Go to your dashboard.
- **The agenda paragraph is gone**, per Bev on 31 August: "just say book an onboarding call, you don't need the agenda anywhere, the agenda can change."
- The secondary path is now **Skip for now**, deliberately quieter than the previous "Go to your dashboard".
- `BookingEmbed` is declared at module scope. Inside `Block()` it would be a new component type on every render, remounting the iframe and destroying a half-finished booking.

## Unchanged on purpose

The logged-out redirect to `/sign-up?session_id=…`, the `IDENTITY_GRACE_MS` wait, the lazy `useState` read of `session_id`, and the single write of `checkout_session_id` (`8Tl1R`). The Google Ads tag is in Page Settings → Custom Code → Header, not in this block, and nothing here touches it.

## Conversion build, 6 September

Post-payment page, so it uses none of the pressure tactics that suit a page winning a sale. The money is taken and a 30-day unconditional refund window is open; manufactured urgency here pushes toward a refund, not a booking.

- **Calendar open on arrival.** It was behind a click. Biggest single change.
- **Endowed progress.** Paid / Book onboarding / Get set up, with step 1 already ticked because they paid.
- **The booked state does work.** It collects the two prep answers the playbook needs and only the customer can give: a product URL and who films. Post-booking, not pre, so there is zero friction on the thing we actually want. Stored on `users`: `prep_product_url` (`tXFzt`), `prep_who_films` (`DnuKh`).
- **`onboarding_booked_at` (`MJ5fW`)** is stamped on `bookingComplete`. Its absence is what `bl-onb-nb-3d` and `bl-onb-nb-7d` key off, so those chasers stop chasing people who booked.
- **Loss framing.** 500 shown as an object, "are yours", not "you earn".
- **Real scarcity only.** The calendar genuinely opens 5 days ahead, and that is stated. No invented slot counts, no countdown: both would be contradicted by the live calendar two inches below.
- **7-day bonus deadline** added on request. This is the one claim that needs Bev to actually enforce it.
- **Skip held back 6 seconds** and sits under a full calendar. Kept rather than removed: the card is right that a paid user should not be hard-blocked, and removing it would not force booking anyway since `/new` is two clicks away in the nav.

## Open

- **TidyCal shows what the page deliberately does not.** The embedded booking type renders a `45 minutes` badge and its own description, which is an agenda: "We'll walk through your workspace, create your first brief, invite a creator or upload a real video…". So the copy above the calendar omits both and the calendar states both, four lines apart. The description is editable on the booking type; the duration badge is not hideable, it just reflects `duration_minutes`.
- **TidyCal settings, all Studio-side.** There is no update endpoint for a booking type in TidyCal's API (18 operations, create and read only), so none of this can be done from here. On `brieflee-onboarding`: duration is 45 while the playbook says 30 and its sections sum to ~43; the description still carries the agenda and renders inside the embed; hours need setting. **Padding is 60 minutes, which costs more availability than the hours do.** At 45 + 60 padding, noon to 5pm yields 3 starts a day, 11am to 6pm yields 4. Dropping padding to 30 would roughly double either.
- **The 7-day bonus rule only works if enforced.** It means telling someone who books on day 8 that they have lost 500 reviews, days after paying up to $4,788. The natural version needs no policing: the reviews start the day of the call, so booking late just means starting late.
- **`/set-up` vs `/new`.** The card specifies `/new` twice. The live block has used `/set-up` since 20 August, which is where onboarding v6 lives. Kept `/set-up` rather than silently changing where paying customers land. One word to flip.
- **The logged-out branch was not re-tested**, because preview signs you in. That path is unchanged from the version that was already live.
