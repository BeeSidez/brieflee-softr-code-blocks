# Unsubscribe — build spec

**Status:** blocks written to Bev's tick-box design, powered by the Emailit REST source + useProxyFetch — NO workflow needed
**Created:** 2026-07-28 · **Simplified:** 2026-07-29 · **Tick-box design:** 2026-07-29 · **REST-source transport:** 2026-07-29

---

## Why this exists

Every marketing email from both brands shipped with a dead unsubscribe link. `{{unsubscribe}}` (Brieflee) and `{{unsubscribe_url}}` (Creator Scans) were assumed to be auto-injected by EmailIt. They are not — EmailIt renders unknown Mustache variables as an empty string, so the delivered HTML read `<a href="">Unsubscribe</a>`. Confirmed from the raw MIME of a real send.

All 85 marketing templates now hardcode a URL to a self-hosted page. This is what sits behind that page.

---

## The design

The page pre-fills the email from `?e=`, shows tick boxes for that brand's email types (all ticked by default), and unsubscribes **per audience** for whatever stays ticked. Untick a group to keep it.

Per-audience is the mechanism because EmailIt contacts are **workspace-level, shared between Brieflee and Creator Scans**. The contact-level `unsubscribed: true` flag (verified working 2026-07-29) is all-or-nothing across both brands, which kills the tick-box choice and cross-brand isolation. So the flag is never used; each ticked audience is removed individually. Transactional mail is unaffected either way — it sends via `to:`, not audiences.

**Never call `/v2/suppressions`.** That list is workspace-wide *and* blocks transactional. It is for bounces, not opt-outs.

### The two API shapes (verified against the live API 2026-07-29)

```
GET https://api.emailit.com/v2/contacts/{email}
```
Returns the contact with every audience membership AND its subscriber id:
```json
{ "email": "…", "unsubscribed": false,
  "audiences": [ { "id": "aud_…", "name": "BL | Leads · brief-generator",
                   "subscriber": { "id": "sub_…", "subscribed": true } } ] }
```
So there is no separate lookup call — one GET yields the `sub_…` id for any audience.

```
DELETE https://api.emailit.com/v2/audiences/{audience_id}/subscribers/{subscriber_id}
```
Removes that one membership. Gotcha: EmailIt requires a body on DELETE when `Content-Type: application/json` is set — send `{}`.

---

## Transport: the Emailit REST source + useProxyFetch (no workflow)

Vibe blocks support REST API data sources (Softr feature 2026-04-21; see `docs/softr-vibe-code-block.md`, "REST API sources and useProxyFetch"). Both blocks call EmailIt through `useProxyFetch`: Softr proxies each call server-side and attaches the source's `Authorization: Bearer <key>` header itself, so the key never ships to the browser and there is nothing else to build.

Per submit the block does, entirely in code:
1. `GET /v2/contacts/{email}` through the proxy → every membership with its `sub_…` id
2. one `DELETE /v2/audiences/{aud}/subscribers/{sub}` (body `{}`) per ticked audience the contact is actually on

**Setup per app:** Data sources → REST API → "Rest API - Emailit" with the Bearer header, then add it on the unsubscribe block's **Sources tab**. That's it.

**Public-page caveat, accepted 2026-07-29:** the proxy authenticates whatever the page requests and responses reach the browser, so a technical visitor could query the contacts GET for a guessed address from the console (exposing that address's audience membership). Revisit if EmailIt ships scoped keys.

<details>
<summary>Fallback: the 4-step shared workflow (only if the REST source route ever breaks)</summary>

`BL+CS | EmailIt Unsubscribe`, webhook trigger receiving `{email, audience_id}`:
1. Call API GET `https://api.emailit.com/v2/contacts/{{email}}` (saved `Emailit` credential, continue on error ON)
2. Run custom code: parse response, find `audiences[].id === audience_id`, return `{subscriber_id, found}`
3. Filter: `found` = true
4. Call API DELETE `https://api.emailit.com/v2/audiences/{{audience_id}}/subscribers/{{subscriber_id}}` with body `{}`

The block would then POST one call per ticked audience to the webhook instead of using proxyFetch.
</details>

### Audience map (ids pulled live 2026-07-29)

| Brand | Page tick | Audiences |
|---|---|---|
| BL | Free tool email series | 7 × `Leads · *` (hook-generator, ugc-video-examples, ugc-qa-checklist, storyboard-builder, brief-generator, meta-andromeda, video-analyser) |
| BL | Getting-started emails | Onboarding |
| BL | News, offers and product updates | Re-engagement, Lapsed, Subscribers, Team Members |
| CS | Getting-started emails | Onboarding |
| CS | News and programme updates | Subscribers, Re-engagement Warm |

Exact ids live in each block's `GROUPS` constant. A new audience created later must be added to the right group or it keeps sending — note it in the audience's name when created.

---

## Softr UI checklist

- [ ] Brieflee app: Data sources → REST API → "Rest API - Emailit" (Bearer header) — done 2026-07-29 per Bev's screenshot
- [ ] Public page `/unsubscribe` on brieflee.co — paste `website/unsubscribe/unsubscribe.jsx`, Visibility = public, Sources tab = Rest API - Emailit
- [ ] Creator Scans app: same REST source, same block setup with the CS file
- [ ] Publish both pages
- [ ] Test with a throwaway contact on one audience: submit, then confirm with `GET /v2/contacts/{email}` that the audience membership is gone and `unsubscribed` stays `false`

**Until both pages are published the links 404.** Better than a dead `href=""`, but not finished.

---

## Known limitation: no `List-Unsubscribe` header

EmailIt's send API accepts a `headers` field, but audience automations send by template and expose no header hook, so the one-click header cannot be set on automation sends. Gmail and Yahoo only mandate `List-Unsubscribe` above roughly 5,000 messages/day; below that a working visible link satisfies the requirement. Worth raising with EmailIt support.

---

## Optional upgrade: true one-click

The page asks the recipient to confirm their address because there is no evidence EmailIt interpolates any per-recipient field into an automation-sent template. To test, send yourself one email from a scratch template containing labelled candidates:

```
{{email}} · {{subscriber_email}} · {{custom_fields.unsub}} · {{unsub}}
```

then read it back with `GET /v2/emails/{id}/raw` and see which resolved. If one does, append it to the footer URL (`/unsubscribe?e={{email}}`) — both blocks already read `?e=` and pre-fill.
