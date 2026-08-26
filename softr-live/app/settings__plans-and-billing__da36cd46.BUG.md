# Bug: the Video reviews card on the billing tab always shows a max of 0

**Block** `da36cd46` · `/settings` · Plans and Billing tab
**Confidence** high, verified against the live bound schema

The block selects `subscriptionMaxVideos: "rXOcE"`. **`rXOcE` does not exist
on the `usage` table** (`dw2IeLOtYJLulR`), which is the table this block is
bound to. Every other one of the 16 selected field ids resolves.

So `num(f.subscriptionMaxVideos)` returns `null`, `safeMax` falls to `0`, and
the card renders:

- numbers as `<used> / 0`
- the progress bar at 0% width

for every paying customer. Seats and Brand profiles are unaffected because
`UnMPU` (max_members) and `Kejms` (max_workspaces) both exist.

## The fix

Use **`q2HDt`** (`max_videos`, FORMULA). It is the video-side twin of the two
fields that already work, and it includes purchased add-on packs:

```js
subscriptionMaxVideos: "q2HDt", // max_videos (FORMULA, plan + add-ons)
```

`f4h8a` (`plan_max_videos`) would also resolve, but it is the plan allowance
only, so anyone who has bought a video pack would see a max below what they
actually hold.
