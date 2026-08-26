# Structural findings from the live page pull

Every custom-group gate in this app sits at **block** level. Page-level
permissions are only All users or Logged-in users, so an access audit that
reads pages sees none of this. `get_page` is the call that shows it.

## /settings

The whole tab container (`b7b93bbe`) is gated to the **Stripe ID** group, so
a user who has not bought sees no settings tabs at all. `no-stripe`
(`fb3028dc`) is what they get instead. Nine vibe blocks live here, including
`plans-and-billing` (`da36cd46`).

Tabs gate to: tab1/tab3/tab4 Accounts Created, tab2 Owner, tab5 All users,
tab6 No Account.

## Blocks sitting disabled in Studio

| Page | Block | hrid |
| --- | --- | --- |
| /bulk | `6caa549d` | ai4 |
| /briefs/details | `4e2ff7ca`, plus item-details1 and tab-container1 | ai2 |
| /new-brief | `2d694ecc`, `094b5df6`, `55bee4d2`, `fdddca8c` | four of five |
| /videos | `6b9be687`, `41b2194f`, `3ba586b0` | two switchers and a grid |

`/new-brief` runs on a single live block, `ai1` (`f82a4fb0`), gated to the
Active group. The conditional form and the projects detail block behind it
are both off.

## Duplicate hrids on /videos

Three separate blocks all carry the hrid `table1`: `d39fd89c`, `66a8d072`
and `49369709`. Anything addressing a block by hrid on that page will hit
whichever one resolves first.

## Spelling to fix in Studio

`/project` has a block whose hrid is `multi-worksapce`.
