---
name: softr-vibe-code-block
description: Write code for Softr Vibe Coding blocks - React/JSX components (or HTML for simple visuals) that go inside the Vibe Coding block's Content > Code tab. Use this skill whenever asked to write, fix, improve, or extend a Softr Vibe Coding block, build a React component for Softr, write JSX for a Softr block, work with @/lib/datasource hooks (useRecordCreate, useLinkedRecords, useUpload, q.select), use shadcn UI components inside Softr (Button, Badge, Select, Input, Textarea, etc.), build a custom dashboard or tool in Softr that connects to the Softr Database, or improve a vibe-generated block that's been saved to GitHub. Trigger on phrases like "write a vibe code block," "build me a vibe block for Softr," "improve this vibe block," "fix my Softr React component," "save credits and write the vibe code yourself," "this vibe block is broken," "make this vibe block look better," or any mention of @/components/ui, useRecordCreate, useLinkedRecords, q.select, or a Softr Vibe Coding block. This skill is for Vibe Coding blocks specifically (React/JSX) - for raw HTML/CSS/JS Custom Code blocks, use the softr-custom-code-block skill instead.
---

# Softr Vibe Coding Block Skill

**Created:** 2026-05-06
**Updated:** 2026-08-23, verified against docs.softr.io/vibe-coding-developer-guide and the live Softr MCP tool contracts.

**Canonical copy:** `Docs/softr-vibe-code-block.md`. Identical copies live in `Brieflee/brieflee-softr-code-blocks/docs/` and `Creator Scans/Softr Vibe Code Blocks/docs/`. Change the canonical one and copy it across in the same session.

**Maintenance rule:** Softr ships Vibe changes fast (REST API sources 2026-04-21, multi-source 2026-06-16). Before asserting the block CANNOT do something, check docs.softr.io/vibe-coding-developer-guide and softr.io/whats-new. When a session learns a new capability, update THIS file (and the Creator Scans copy at `Creator Scans/Softr Vibe Code Blocks/docs/softr-vibe-code-block`) in the same session, with a date on the change.

## What this skill covers

Writing or editing the code that goes inside a Softr Vibe Coding block's **Content > Code** tab. This is React/JSX in most cases, sometimes plain HTML/CSS/JS for simple visual blocks with no data.

**For Custom Code blocks (raw HTML/CSS/JS, not React), use the `softr-custom-code-block` skill instead.**

---

## The build loop: how blocks get changed now

Claude edits Softr directly through the **Softr MCP**. Bev does not paste code, and does not wire sources by hand for the types listed below. The loop, in order:

1. **`get_vibe_coding_docs`** first, every session, before touching a block. Hook signatures change and guessing costs round trips.
2. **`get_page`** to find the block, then **`get_vibe_coding_block_code`** to read the whole source plus its `settings`, `dataSources` and `actions`.
3. **`connect_vibe_coding_block_data_source`** if a source is missing.
4. Edit: **`update_vibe_coding_block_code_search_replace`** for small, localised changes, **`update_vibe_coding_block_code`** for a rewrite.
5. **`preview_app`** with the `pageId`, which returns a `previewUrl`.
6. **Test it yourself in the browser before Bev sees it.** Open the preview, drive the real flow, read the console, take a screenshot.
7. Give Bev the preview link. `publish_app` only when she says so.

### What the MCP can wire, and what it cannot

| Source type | Who connects it |
|---|---|
| Softr Tables, Airtable, Google Sheets, Notion, Supabase | **Claude**, via `connect_vibe_coding_block_data_source` |
| REST API (EmailIt, OpenRouter, anything external) | **Bev**, in Studio: Data sources → REST API, then the block's Source tab |
| PostgreSQL, MySQL, SQL Server, Snowflake, HubSpot, Salesforce | **Bev**, in Studio |

**Record filters and sort on a connected source are Claude's job now** as well: `set_vibe_coding_block_data_source_record_filters` and `set_vibe_coding_block_data_source_sort`. These write the same setting as the Source tab's "Record filters", so the old "tell Bev to set it in the Source tab" answer only applies to source types the MCP cannot connect.

### Traps in the loop

- **A recompile resets Actions visibility.** Every code save deletes and recreates the block's Actions with new IDs and default permissions. Before saving, record any action with `isDefaultVisibility: false` and re-apply it afterwards with `set_vibe_coding_block_action_visibility`.
- **The validator rejects unused declarations.** Removing a feature means removing its constants and imports too, or the save fails with a validation error.
- **Compiling is not running.** The compiler cannot see the block's datasource wiring, so code calling `useRecords` or `useProxyFetch` saves fine and throws in the browser when no source is connected. Read `dataSources` from `get_vibe_coding_block_code` before writing any hook.
- **Preview links are credentials.** They sign in whoever opens them and last about 24 hours. Give one to Bev only, and build a fresh one rather than resending an old link, because rebuilding is the only way to show the latest change.
- **Published is not previewed.** The live site serves the last published bundle. Check `www.brieflee.co` before claiming anything about live behaviour.

### Testing a preview yourself

Softr renders the app in an iframe and each Vibe block inside a **shadow root**, so pixel clicks usually miss. Drive it with `javascript_tool` instead: walk the shadow roots to find the element, set inputs with the native value setter plus `dispatchEvent(new Event("input", { bubbles: true }))`, then click. To avoid real side effects while testing a form, stub `window.fetch` for the calls that write.

---

## What a Vibe Coding block is

A Softr block where the code is generated by Softr's AI from a prompt. The output is a React component that lives in the Content > Code tab. Bev maintains these blocks in two ways:

1. **Write from scratch** — Bev wants Claude Code to write the complete vibe block code so she doesn't burn Softr AI credits. She then pastes the output into a fresh Vibe Coding block in Softr.
2. **Edit existing** — Softr generated something, Bev saved it to GitHub, now Claude Code edits the file in the repo to make it look better, add features, fix bugs, or fix broken vibe-generated code.

Either way, the output Claude Code writes must be **drop-in ready for the Content > Code tab**.

---

## The Vibe Coding block has five tabs

It's important to understand which tab does what, because **Claude Code only writes the Content tab**. Other tabs are configured by Bev in the Softr UI.

| Tab | What it does | Who handles it |
|-----|-------------|----------------|
| **Chat** | Softr's AI prompt interface | Bev (when she uses Softr's AI) |
| **Source** | Connects the block to one or more sources: Softr Database tables AND 15+ external types including REST API, Airtable, Google Sheets, Notion, HubSpot, SQL (REST API support since 2026-04-21; multiple sources per block since 2026-06-16, each with its own filter and sort). Sets conditional filters (workspace/user filters), restricts which records the block sees | **Bev (UI only, NOT in code)** |
| **Content** | The actual JSX/HTML code for the block | **Claude Code** |
| **Actions** | Declares which fields the block uses for CRUD operations (Add Record, Update, Delete) and configures permissions | **Bev (UI), but the field aliases must match what's in code** |
| **Visibility** | Controls which user groups can see the block | Bev (UI only) |

---

## Constraint: user-scoped filters are a source setting, not code

**Updated 2026-08-23:** the setting itself is now reachable from the MCP with `set_vibe_coding_block_data_source_record_filters`, so Claude sets it directly on any source the MCP can connect. What has not changed is that it is a *source* setting: it is still not something `useLinkedRecords` can do in code.

**`useLinkedRecords` does not support filtering by user relationships.** There is **no way** to write code that restricts dropdowns or lists to records belonging to the logged-in user.

If Bev needs the block to only show "this user's projects" or "this account's briefs," that filtering happens in the **Source tab > Conditional Filters** in the Softr UI. Claude Code must not try to write filter logic for user-scoped data.

**What Claude Code CAN do:**
- Use `useLinkedRecords` to fetch related records (it'll respect whatever filters Bev set in the Source tab)
- Filter the returned data client-side (e.g. by name, by date) after fetching

**What Claude Code CANNOT do:**
- Write code that filters `useLinkedRecords` by user ID, account ID, or any user relationship
- Bypass the Source tab filters in code
- Make `useLinkedRecords` accept a filter parameter for user relationships

If Bev asks for user-scoped filtering and the Source tab can't handle it, the right answer is: "this needs to be set in the Source tab in Softr; here's what I'd suggest you set there" — not invent code that won't work.

### Scoping a dropdown to the logged-in user

When the picker lives in a data-entry form, the simplest scoping is a Softr native conditional form: native forms filter linked-record pickers to the logged-in user with built-in conditions, so each picker shows only that user's own records, with no code. Reach for this first when a native form fits the flow.

Inside a Vibe code block, scope it in code instead. `useLinkedRecords` returns the whole linked table, so it cannot scope a picker to the current user. The working pattern is to read the user's OWN record by id and pull its linked field:

```jsx
const userScopedSelect = q.select({ accounts: "Nz6VX" }); // users.accounts linked field
const userScoped = useRecord({ recordId: user?.id, select: userScopedSelect, enabled: !!user?.id });
const accounts = (userScoped?.data?.fields?.accounts ?? [])
  .map((a) => ({ id: a?.id, title: unwrap(a) }))
  .filter((x) => x.id);
```

This returns only the user's own accounts (same idea for briefs and other linked fields), with no Source-tab filter needed. References: `app/projects/index`, `app/projects-invite`, `app/briefs/create-brief`. The USERS table must be a source on the block. Known users-table field id: `accounts` = `Nz6VX`.

---

## Multiple data sources (new: connect more than one table)

Since 2026-06-16 a single Vibe Coding block can connect to more than one data source (table). Each connected table can have its own filter and sort, all configured in the **Source tab** (Bev, UI). This lifts the old one-source-per-block limit.

**When to use it:** any block that needs to read from or write to two or more tables. Examples: a dashboard listing `submissions` next to their parent `briefs`, or a view that combines data that isn't joined by a linked-record field. Prefer connecting both tables natively over the older workarounds (binding the block to one source, then passing the other table's context through URL params or lookups).

**Connecting the sources:** Claude adds each table with `connect_vibe_coding_block_data_source` and sets its filter and sort with the matching MCP calls. Bev only does this in Studio for REST API sources and the SQL vendors the MCP cannot connect. User-scoped filtering still belongs in the Source tab, not in code (same rule as the section above).

**In code (Claude Code's job):** two distinct cases — do not confuse them.

*Case 1 — multiple TABLES in the SAME connected database* (the usual case here: submissions, accounts, briefs, users all live in `brieflee beta`). Read each with a plain `useRecords` / `useRecord`, **no `datasource.define`, no `from`**. Softr routes each call to the table whose fields the `select` maps to. To scope a dropdown to the logged-in user, read the user's OWN record and pull its linked field:

```jsx
import { useRecord, useRecordCreate, q } from "@/lib/datasource";

const userScopedSelect = q.select({ accounts: "Nz6VX", briefs: "3Ww0J" }); // users.accounts / users.briefs
const userScoped = useRecord({ recordId: user?.id, select: userScopedSelect, enabled: !!user?.id });
const accounts = (userScoped?.data?.fields?.accounts ?? []).map((a) => ({ id: a?.id, title: unwrap(a) }));
const createRecord = useRecordCreate({ fields: submissionFields }); // writes submissions
```

Proven in this repo: `app/projects/index` (projects + accounts + users), `app/discover/formats-row.jsx` (two tables). The block's Source tab must be bound to the database; if reads come back empty or a hook errors "this block does not have a datasource configured", the Source tab has lost its datasource binding.

*Case 2 — separate DATA SOURCES* (a different database, or a REST API, alongside the first). ONLY then alias them with `datasource.define` and pass `from` on every record/metric hook. The datasource id is the per-source connection id from the Source tab (NOT the table id, not documented; Softr writes the `datasource.define` for you when you connect the second source). `from` does NOT apply to `useUpload` / `useCurrentRecordId`. Reference: docs.softr.io/vibe-coding-developer-guide, `app/bulk-import-videos.jsx`.

**Filtering in code** (single or multi source) uses `where` with the `q` builder, up to 2 levels of nesting:

```jsx
useRecords({ select, where: q.and(
  q.text("name").contains("Alice"),
  q.number("age").gte(18),
  q.or(q.boolean("isActive").is(true), q.text("notes").isNotEmpty()),
)});
```

Builders: `q.text` (is, isNot, contains, startsWith, endsWith, isOneOf, isNoneOf, hasAllOf, isEmpty, isNotEmpty), `q.number` (is, isNot, gt, gte, lt, lte, between, isEmpty, isNotEmpty), `q.boolean` (is, isNot, isEmpty, isNotEmpty), `q.date` (is, isNot, gt, gte, lt, lte, between, isNotBetween, isEmpty, isNotEmpty), `q.array` (is, isOneOf, isNoneOf, hasAllOf, isEmpty, isNotEmpty), plus `q.and` / `q.or`. Note: `where` filters by field VALUES; scoping a dropdown to the logged-in user is still done with a Source-tab filter on that source.

**Scope note:** multi-source binding helps with reading and writing across tables in one block. It does not by itself remove the native-form auto-fill limit (a Softr form still auto-populates only the current user id plus one linked record) or the Form-Then-Edit create pattern. Re-test those against a real multi-source block before assuming they have changed.

---

## REST API sources and useProxyFetch (Softr feature 2026-04-21; section added 2026-07-29)

A Vibe block CAN have a **REST API** as a source. Bev configures it under **Data sources → REST API** (base URL + auth header, e.g. `Authorization: Bearer <key>`), then adds it on the block's **Sources tab** like any table. In code, calls go through `useProxyFetch`:

```jsx
import { useProxyFetch } from "@/lib/datasource";

const proxyFetch = useProxyFetch(); // single source on the block: no argument

const res = await proxyFetch("https://api.emailit.com/v2/contacts/someone@example.com");
const json = await res.json();

// Writes work too — proxyFetch is fetch-shaped:
await proxyFetch("https://api.example.com/things/123", {
  method: "DELETE",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({}),
});
```

Key facts:
- **Softr proxies the call server-side and attaches the source's auth automatically.** Never put a token in block code, never send auth headers manually.
- With multiple data sources on the block, pass the alias: `useProxyFetch(ds.store)` (see `datasource.define` above).
- It pairs with plain `@tanstack/react-query` `useQuery` for reads if caching/loading states are wanted.
- **Public-page caveat:** the proxy authenticates whatever the page requests, and responses reach the browser. On a public block, assume a technical visitor can call the proxied API's GET endpoints from the console. Keep public REST-source blocks to endpoints whose exposure is acceptable, or move sensitive reads behind a workflow.
- Live references in the repos: the `/unsubscribe` blocks (EmailIt REST source, GET contact + DELETE membership), the CS Recent/Reviews blocks (Ask AI via OpenRouter proxyFetch).

**Full hook list per the official developer guide** (2026-07-29): read — `useRecords`, `useRecord`, `useLinkedRecords`, `useFieldOptions`, `useMetric`, `useChartData`; write — `useRecordCreate`, `useRecordUpdate`, `useRecordDelete`, `useUpload`; REST — `useProxyFetch`.

---

## Two formats: JSX (default) and HTML

### JSX (React) — for anything dynamic or data-connected
This is what Softr's AI generates and what 95% of vibe blocks use. Use this format whenever the block:
- Reads from or writes to the Softr Database
- Has interactive state (forms, multi-step flows, dynamic UI)
- Uses shadcn components
- Needs hooks like `useState`, `useEffect`

### HTML/CSS/JS — for simple visual blocks with no data
For purely decorative or static visual sections (a pricing comparison, a stages diagram, a hero section), a plain HTML/CSS/JS file also works in a vibe block. Use this format when:
- There's no database interaction
- There's no React state needed
- It's visual/structural only (cards, grids, animations)
- Bev specifically asks for HTML

When in doubt, default to JSX.

---

## JSX format: file structure

Every JSX vibe block follows this shape:

```jsx
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useRecordCreate, useLinkedRecords, useUpload, q } from "@/lib/datasource";
import { useCurrentUser } from "@/lib/user";
import { Check, X, ArrowRight } from "lucide-react";

// (optional) Option ID lookups for SELECT / multi-select fields
const STATUS_OPTIONS = [
  { id: "uuid-here", label: "Active" },
  { id: "uuid-here", label: "Paused" },
];

// (required if writing data) Field ID mapping
const createFields = q.select({
  name: "fieldIdHere",
  status: "fieldIdHere",
  // ...
});

// (optional) Helper functions and sub-components
function MyHelper({ ... }) { ... }

// REQUIRED: default-exported Block component is the entry point
export default function Block() {
  // hooks, state, render
  return (
    <div className="container py-10">
      ...
    </div>
  );
}
```

**Non-negotiable rules:**
1. The entry point must be a default-exported component named `Block`
2. Imports use the exact paths shown above (no `react/jsx-runtime`, no relative paths)
3. All styling uses Tailwind utility classes (no inline `style={{}}` for colours)
4. Use Tailwind **semantic tokens** (`text-primary`, `bg-muted`, `border-border`, `text-destructive`) — not raw colour classes (`text-blue-500`, `bg-gray-100`)

---

## Available imports (JSX vibe blocks)

### React
```jsx
import { useState, useRef, useEffect } from "react";
```

### shadcn UI components
```jsx
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
```
(Other shadcn components likely available — Card, Dialog, Tabs, etc. If unsure whether a specific component is available, ask Bev or stick to the ones above which are confirmed.)

### Toasts
```jsx
import { toast } from "sonner";

toast.success("Done!");
toast.error("Failed", { description: "Reason here" });
```

### Softr data layer
```jsx
import { useRecordCreate, useLinkedRecords, useUpload, q } from "@/lib/datasource";
```

### Current user
```jsx
import { useCurrentUser } from "@/lib/user";

const user = useCurrentUser();
// user.id, user.email, user.fullName
```

### Icons
```jsx
import { Check, X, ArrowRight, FileText, AlertCircle, ChevronRight, ChevronDown, ChevronUp, DownloadCloud, Video } from "lucide-react";
```

---

## The data layer: q.select and field IDs

### q.select pattern

When the block reads from or writes to a Softr Database table, every field used must be declared via `q.select({})`. Each entry maps a **readable alias** (left side, used in code) to the **actual Softr field ID** (right side).

```jsx
const createFields = q.select({
  name: "z3lpx",                  // alias "name" maps to field ID "z3lpx"
  description: "FCBU5",
  status: "wm1jM",
  projects: "yrYvH",              // linked record field
  qa_checklist: "OFoS6",          // multi-select field
});
```

### Field IDs MUST come from Bev — never invent them

This is the single most important rule for working with the database. **Claude Code must NEVER guess field IDs.** They are short random strings (5 characters, mixed case) and there's no way to derive them.

**Before writing any database-connected vibe block, Claude Code must have:**
1. The **table name** (e.g. `submissions`, `briefs`)
2. A list of **field aliases** (the readable names) and their **field IDs**
3. For SELECT or multi-select fields: the **option UUIDs** for every choice (full UUID format, e.g. `20c847f5-7a3a-4349-bc9a-d31e3b1fa6b2`)

If any of these are missing, **ask Bev for them before writing the code**. Don't write placeholder field IDs and hope for the best — the block will silently fail to write data.

A good way to ask:

> "Before I write this, I need the field IDs for the [table name] table. Can you share:
> 1. The field IDs for: [list of fields the block needs]
> 2. The option UUIDs for any SELECT or multi-select fields, with their labels
>
> You can grab field IDs from the Softr Database studio by clicking on each field."

If Bev doesn't have them to hand, suggest she gives Claude Code the existing block file from GitHub if there's a similar one — the field IDs and option UUIDs are in the constants at the top.

---

## Reading data with useLinkedRecords

```jsx
const { data: linkedProjectData } = useLinkedRecords({
  select: createFields,
  field: "projects",
  count: 100
});
const linkedProjects = linkedProjectData?.pages.flatMap((p) => p.items) ?? [];
```

- `select` — pass the same `q.select({})` object used elsewhere in the block
- `field` — the alias name of the linked record field
- `count` — how many records to fetch (default is small, set higher for dropdowns)
- The result is a paginated structure; `data.pages.flatMap((p) => p.items)` flattens it into a plain array
- Each item has `id` and `title` (the title is the primary field of the linked record)

**Reminder: any user-scoped filtering on linked records must be set in the Source tab UI, not here.**

---

## Writing data with useRecordCreate

```jsx
const createRecord = useRecordCreate({ fields: createFields });

// Check if writes are available before calling
if (!createRecord.enabled) {
  toast.error("Cannot create records right now");
  return;
}

// Build the fields object, then write
const fields = { name: "Hello", status: "uuid-here" };
try {
  await createRecord.mutateAsync(fields);
  toast.success("Created!");
} catch (e) {
  toast.error("Failed", { description: e.message });
}
```

### ⚠️ Keys MUST be aliases, not field IDs

The single most common reason a save silently 400s. The `fields` object passed to `mutate` / `mutateAsync` must be keyed by the **alias names** declared in `q.select`, NOT the underlying Softr field IDs. Softr's data layer maps alias → field ID internally; if you send field IDs as keys, every key gets stripped as unrecognised, the payload is empty, and the API returns:

```json
{ "message": "Record data cannot be empty" }
```

The Softr fetch wrapper throws away the response body, so the only error your block sees is `Failed to update record: 400` — completely invisible until you intercept `window.fetch` (see "Debugging save failures" below).

**Right** — keys are aliases:

```jsx
const select = q.select({
  memberships: "PxOWN",
  pronouns: "W933n",
});

updateRecord.mutate({
  recordId: user.id,
  fields: {
    memberships: [{ id: "rec_xyz" }],
    pronouns: { id: "uuid", label: "She" },
  },
});
```

**Wrong** — keys are field IDs (silently fails):

```jsx
updateRecord.mutate({
  recordId: user.id,
  fields: {
    PxOWN: [{ id: "rec_xyz" }],   // ❌ field ID, not alias
    W933n: { id: "uuid", label: "She" },
  },
});
```

### Field value formats

| Field type | Format | Example |
|------------|--------|---------|
| Text, long text, email, URL, phone | string | `"Hello"` |
| Number, currency, percent, rating | number | `42` |
| Checkbox | boolean | `true` |
| Date / datetime | ISO string `"YYYY-MM-DD"` | `"2026-04-13"` |
| Select (single) | `{ id, label }` object | `{ id: "20c847f5-...", label: "Beauty" }` |
| Multi-select | array of option UUIDs | `["uuid1", "uuid2"]` |
| Linked record | array of `{ id }` objects | `[{ id: "rec_abc" }]` |
| User | `user.id` from `useCurrentUser()` | `user.id` |
| Attachment | object or array of objects from `useUpload` | (see upload section) |

Note on single-selects: an earlier version of this doc said the format was a plain UUID string. That's wrong in practice — Softr expects the full `{ id, label }` object. The `bulk-import-briefs-v10.jsx` working block sends multi-selects as plain UUID arrays but single-selects need the object form.

### Debugging save failures

Softr's internal fetch wrapper around the data hooks calls `fetch`, checks `response.ok`, and throws `new Error("Failed to update record: " + response.status)` without ever calling `.text()` or `.json()` on the response body. So when you get a 400, the actual API error message is invisible to your block code.

To capture it, monkey-patch `window.fetch` while the block is mounted:

```jsx
useEffect(() => {
  const original = window.fetch;
  window.fetch = async function (...args) {
    const response = await original.apply(this, args);
    try {
      const url = typeof args[0] === "string" ? args[0] : args[0]?.url || "";
      if (url.includes("records-trigger") && !response.ok) {
        const body = await response.clone().text();
        console.error(
          "=== Softr error",
          response.status,
          response.statusText,
          "\nURL:", url,
          "\nBody:", body,
        );
      }
    } catch (e) {
      console.error("=== fetch interceptor failed:", e);
    }
    return response;
  };
  return () => { window.fetch = original; };
}, []);
```

Common error bodies and what they mean:

| Response body | Cause |
|---|---|
| `{ "message": "Record data cannot be empty" }` | You sent field IDs as keys. Switch to alias names. |
| `{ "message": "Invalid value for field 'X'" }` | Field-format mismatch. Check the type table above. |
| `{ "message": "..." }` referencing a specific UUID | Option UUID is wrong, or the option was deleted from the source table. |

Once the bug is fixed, remove the interceptor — leaving it in production wraps every fetch on the page, which is fine but unnecessary noise.

### Actions tab is auto-populated, not editable

The **Actions tab > Edit > FIELDS USED** list is generated from the aliases in `q.select`. There is no UI to add, remove, or rename fields there. The "Edit" button on that panel only controls visibility/permissions for the edit action (which user groups can perform writes), not the field list. Don't ask Bev to "add a field to the Actions tab" — she literally cannot. If a field shows up in `q.select`, it's in the Actions tab.

### Multi-select label-to-UUID lookup pattern

When mapping user input (e.g. CSV labels) to option UUIDs, build a lookup at the top of the file:

```jsx
const QA_OPTIONS = [
  { id: "20c847f5-7a3a-4349-bc9a-d31e3b1fa6b2", label: "Product visibility" },
  { id: "714e1e9d-7e02-47e5-86c8-c42da09b1ce6", label: "Product usage" },
  // ...
];

const QA_LABEL_TO_ID = {};
QA_OPTIONS.forEach((opt) => {
  QA_LABEL_TO_ID[opt.label.toLowerCase()] = opt.id;
});

// At write time, convert labels to UUIDs
function convertLabelsToIds(labelString, lookup) {
  const labels = labelString.split(";").map((s) => s.trim()).filter(Boolean);
  return labels.map((l) => lookup[l.toLowerCase()]).filter(Boolean);
}
```

### Linked records: send as `[{ id }]`

```jsx
// Match by title (or whatever primary field), then send as array of id objects
const match = linkedProjects.find((o) => o.title.toLowerCase() === inputName.toLowerCase());
if (match) {
  fields.projects = [{ id: match.id }];
}
```

### Hidden user fields

```jsx
const user = useCurrentUser();

// In the fields object:
fields.users = user?.id || null;
// For 'accounts' (or similar account fields), often best to omit and let Softr auto-assign based on logged-in user
```

Always check `user?.id` exists before writing — if it doesn't, the user isn't logged in.

### Date conversion helper

CSVs and user inputs often have non-ISO date formats. Use a helper to normalise to `YYYY-MM-DD`:

```jsx
function convertToISODate(val) {
  if (!val) return val;
  const s = val.trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s;  // already ISO
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  let m = s.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})$/);
  if (m) return m[3] + "-" + m[2].padStart(2, "0") + "-" + m[1].padStart(2, "0");
  // Fallback to JS Date parsing
  const d = new Date(s);
  if (!isNaN(d.getTime())) {
    return d.getFullYear() + "-" +
      String(d.getMonth() + 1).padStart(2, "0") + "-" +
      String(d.getDate()).padStart(2, "0");
  }
  return val;  // let Softr reject it with a clear error
}
```

---

## File uploads with useUpload

```jsx
import { useUpload } from "@/lib/datasource";

// useUpload() returns { uploadAsync, isUploading } — NOT a mutation object.
// Unlike useRecordCreate / useRecordUpdate, there is NO .mutate / .mutateAsync
// here. Calling upload.mutateAsync(file) throws "mutateAsync is not a function".
const { uploadAsync, isUploading } = useUpload();

// uploadAsync takes a File (or an array of Files) and ALWAYS resolves to an
// ARRAY of results: [{ id, file, status: "completed" | "error", url }, ...].
const [result] = await uploadAsync(file);
if (!result || result.status !== "completed" || !result.url) {
  throw new Error("Upload didn't complete.");
}

// Attachment fields expect an array of { filename, url }.
fields.video_file = [{ filename: result.file?.name, url: result.url }];
```

For multiple files, pass the array and map the results:

```jsx
const results = await uploadAsync(fileList); // array in, array out
const attachments = results
  .filter((r) => r.status === "completed" && r.url)
  .map((r) => ({ filename: r.file?.name, url: r.url }));
```

Reference implementation: `app/bulk-import-videos.jsx`.

---

## Actions tab must match the code

The Actions tab in Softr declares which fields the block uses for CRUD operations (e.g. Add Record). The aliases used in `q.select({})` in code must correspond to fields that Bev has registered in the Actions tab.

If Claude Code adds a new field alias to `q.select({})`, it must tell Bev: "I added `field_alias_name` to the code — you'll need to add this field in the Actions tab in Softr."

---

## Styling rules

### Tailwind only, semantic tokens

Use Tailwind utility classes for all styling. Use the **semantic tokens** that adapt to Softr's theme:

| Use this | Not this |
|----------|----------|
| `text-primary` | `text-blue-500` |
| `bg-muted` | `bg-gray-100` |
| `border-border` | `border-gray-200` |
| `text-foreground` | `text-black` |
| `text-muted-foreground` | `text-gray-500` |
| `text-destructive` | `text-red-600` |
| `bg-destructive/10` | `bg-red-50` |
| `bg-card` | `bg-white` |
| `text-primary-foreground` | `text-white` |
| `ring-primary/20` | `ring-blue-200` |

The `/10`, `/20`, `/30` modifiers add transparency (e.g. `bg-primary/10` is primary colour at 10% opacity).

### Typical container

```jsx
<div className="container py-10">
  <div className="content">
    {/* block content */}
  </div>
</div>
```

### Cards, borders, radii

- Use `rounded-xl`, `rounded-2xl`, `rounded-full` for rounded corners
- `border` for default border, `border-2 border-dashed` for dashed
- `shadow-sm`, `shadow-lg`, custom shadows via Tailwind arbitrary values
- `transition-all` plus a duration class for animations

### Responsive

Use Tailwind responsive prefixes (`sm:`, `md:`, `lg:`). Vibe blocks must work on mobile — always test layout with `flex-col md:flex-row` patterns.

### Typography rules (locked)

For any **section heading h2** outside the hero, default to the lead-magnet pattern from `lead-magnets/brief-generator/faq.jsx`:

```jsx
<h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight leading-[1.1] text-foreground">
```

- **Sizes**: `text-3xl md:text-4xl lg:text-5xl` (30 / 36 / 48 px)
- **Weight**: `font-bold` (Tailwind 700). **Never use `font-extrabold` (800) outside the hero.** Even in the hero, prefer 700 unless there's a specific reason for 800.
- **Tracking**: `tracking-tight`
- **Leading**: `leading-[1.1]`
- **Colour**: `text-foreground` (or hardcoded NAVY `#001364` if matching the hero canvas)

Card titles, sub-headers, and any other large body text: **`font-bold` (700) max.** Body copy: `font-medium` (500) or `font-semibold` (600).

The Eyebrow pill is the same in every block — copy the function from `website/new/home/hero.jsx` verbatim:

```jsx
function Eyebrow({ children }) {
  return (
    <div style={{
      display: "inline-flex", alignItems: "center", gap: 10,
      padding: "10px 18px", background: "rgba(135,156,247,0.16)", color: NAVY,
      fontSize: 14, fontWeight: 700, letterSpacing: "0.06em",
      textTransform: "uppercase", borderRadius: 999, width: "fit-content",
    }}>
      <span style={{ width: 8, height: 8, borderRadius: "50%", background: PERI, boxShadow: `0 0 0 3px ${PERI}33` }} />
      {children}
    </div>
  );
}
```

Don't reimplement it in Tailwind — copy the inline-style version so the eyebrows are pixel-identical across every block.

### Section background (locked)

Every marketing section on the homepage uses the same background as the hero so there's no visible seam between blocks:

```js
const HERO_BG =
  "radial-gradient(ellipse 65% 50% at 50% 50%, rgba(135,156,247,0.28) 0%, rgba(180,192,245,0.14) 40%, rgba(180,192,245,0) 75%), #FAFBFF";
```

Apply via inline style on the section root, not Tailwind `bg-white`.

### Font-family (locked)

Set explicitly on the section root so Softr's default font doesn't bleed in:

```jsx
<section style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
```

The hero sets it on the canvas wrapper; every other block must set it on the section.

---

## Adapting design-canvas mockups (1920×1080 fixed-pixel JSX) to Softr blocks

Bev sometimes hands over a JSX/HTML "design canvas" — a mockup file (often called `heroes.jsx`, `hero-v2.html`, etc.) drawn at a fixed 1920×1080 desktop frame, with everything `position: absolute` at exact pixel coordinates and font-sizes like `124px` for headlines. Foreplay/Frame.io style design comps. They look gorgeous in the design preview but they are **not** drop-in Softr blocks. Adapt them — don't paste them as-is.

**When you see a fixed-canvas mockup, automatically apply these adaptations without being asked:**

### 1. Strip the navigation bar

Softr provides the page chrome (logo, nav, login, CTA). Mockup nav bars are decoration only. Delete the entire `<Nav />` (or equivalent) component before porting.

### 2. Don't size the canvas with `aspect-ratio: 16/9`

The mockup is 1920×1080 (16:9). If you wrap it in `aspect-ratio: 16 / 9` and let it fill viewport width, the hero will be **taller than the viewport** on every realistic laptop:

| Viewport | aspect-ratio: 16/9 hero | Available viewport (after Softr nav + browser chrome) | Fits? |
|---|---|---|---|
| 1920×1080 | 1080px tall | ~900–980px | **No, scrolls** |
| 1440×900 | 810px tall | ~780–820px | **Barely** |
| 1280×720 | 720px tall | ~600–680px | **No, scrolls** |

**Use viewport-height sizing instead** so the canvas always fits ONE screen:

```jsx
<div ref={outerRef} style={{
  width: "100%",
  height: "100vh",     // hero fills the viewport vertically
  minHeight: 560,      // floor for very short windows
  maxHeight: 920,      // ceiling so 4K / portrait monitors don't go giant
  position: "relative",
  overflow: "hidden",
}}>
  <div ref={innerRef} style={{ width: 1920, height: 1080, transformOrigin: "top left" }}>
    {/* canvas content */}
  </div>
</div>
```

The JS scaler picks `Math.min(w/1920, h/1080)` so the 1920×1080 canvas fits BOTH dimensions of whatever container you give it. Letterboxes gracefully on extreme aspect ratios.

### 3. Centre absolute-positioned chips/badges with `translate(-50%, -50%)`

Mockups commonly do `position: absolute; left: <x>; top: <y>` to place floating chips around a hero card. The `left/top` values position the chip's **top-left corner**, not its centre. With chips having natural width (~150–180px), this means:

- Left-side chips' RIGHT edges visually overlap the hero card area → they look "close to" the card
- Right-side chips' LEFT edges start AFTER the hero card edge → they look "far from" the card (asymmetric, detached)

**Fix:** wrap each chip in a positioning div that centres it on the offset point:

```jsx
{chips.map((c, i) => (
  // Outer wrapper: centres the chip on (cx, cy) so left/right are symmetric
  <div key={i} style={{
    position: "absolute", left: cx, top: cy,
    transform: "translate(-50%, -50%)",
  }}>
    {/* Inner wrapper holds the float/entry animations so they don't fight the centring transform */}
    <div style={{ animation: `chipIn 0.6s both, chipFloat 4s ease-in-out infinite` }}>
      <div className="bl-glass">{/* chip visual */}</div>
    </div>
  </div>
))}
```

If the chip animations also use `transform`, nest them in an inner div so the outer's centring transform isn't overridden mid-animation.

### 4. Add real responsive tiers — don't rely on the JS scaler alone

The JS scaler keeps the canvas LOOKING right at any viewport, but at narrow widths everything just gets tiny. Real responsive design needs **at least two layouts**:

```jsx
return (
  <>
    {/* Desktop + tablet (md+, ≥768px) — full canvas with floating chips, peek cards, etc. */}
    <div className="hidden md:block">
      <DesktopCanvas {...sharedProps} />
    </div>
    {/* Mobile (<md, <768px) — stacked Tailwind layout, simplified */}
    <div className="md:hidden">
      <MobileStacked {...sharedProps} />
    </div>
  </>
);
```

Lift fetched data + cycle/animation state into the parent so both layouts share state and only one renders at a time. The desktop canvas naturally scales down to tablet (768px) via the JS scaler — keep peek cards + floating chips on tablet, strip them on mobile only.

**Picking the breakpoint:**

- `md:` (768px+) for the canvas if the layout has rich floating elements that survive at half-scale (HeroV1 with peek cards + 4 chips)
- `lg:` (1024px+) if the design is too dense for tablet and needs a tablet-specific simpler version
- Don't use `sm:` — the canvas at <640px renders chips at ~5px font

### 5. Clip rounded cards with `clipPath`, not just `overflow: hidden`

Mockups use `borderRadius: 28; overflow: hidden` on cards. In Softr's render environment (or any browser with a parent CSS transform animating the card), the rounded clip can fail intermittently — corners show as square. Belt-and-braces fix:

```jsx
<div style={{
  borderRadius: 48,
  clipPath: "inset(0 round 48px)",   // ← bulletproof clip; works through transform contexts
  isolation: "isolate",              // ← forces a new stacking context
  overflow: "hidden",
}}>
  <video style={{ position: "absolute", inset: 0, ... }} />
</div>
```

`clipPath: inset(0 round Npx)` is the only one of the three that's reliable when a parent has `transform` (typical for card-entry / cycle animations). Bump the radius up too — at scaled-down sizes a `borderRadius: 28` becomes ~14px on screen and reads as nearly-square.

### 6. Inner-content padding scales with the canvas

Mockup positions like `left: 80` mean **80px on a 1920px canvas**. At a 1024px viewport, the JS scaler renders that as `80 × (1024/1920) = 43px` of physical padding. Tight for big headlines.

Rule of thumb: for content that needs visual breathing room from the screen edge, position at `left: 160` minimum on the canvas. That guarantees ~85px of physical padding even at the smallest desktop viewport (1024px).

### 7. Lead-magnet CTA flow drops in cleanly

If the homepage hero needs the same paste-URL-then-email-capture flow as the lead-magnet pages, port the entire 3-step flow (`hero` → `loading` → `email`) from `/website/lead-magnets/video-breakdown/hero.jsx` and reuse `createFields`, `PLATFORM_BRIEFLEE`, `PAGE_VIDEO_BREAKDOWN`. Don't rebuild it from scratch — the validation, upload, write-to-Tools, and signup-redirect logic is already production-tested.

### 8. Reading from one table while writing to another in the same block

If the block reads from one table (e.g. `Video Formats` for a cycler) and writes to another (e.g. `Tools` for lead capture), declare both selects with explicit field IDs:

```jsx
const readSelect = q.select({ caption: "RLkzt", videoUrl: "e4FOk", ... });   // Video Formats
const createFields = q.select({ email: "65Dkd", page: "o55YI", ... });        // Tools

// useRecords reads from the Source-tab table; field IDs in the select route correctly
const { data } = useRecords({ select: readSelect, count: 200 });
// useRecordCreate writes to whatever table the field IDs belong to
const create = useRecordCreate({ fields: createFields });
```

Set the Source tab to the table you're READING from. The write goes through `useRecordCreate` with explicit field IDs — those IDs identify the target table.

### Summary checklist for a design-canvas adaptation

- [ ] Strip the mockup's nav bar
- [ ] Replace `aspect-ratio` on the canvas wrapper with `height: 100vh` (capped via min/max)
- [ ] Centre all `position: absolute` chips with `transform: translate(-50%, -50%)` on a wrapper div
- [ ] Add at least two responsive tiers (desktop canvas + mobile stacked, lifted state)
- [ ] Use `clipPath: inset(0 round Npx)` + `isolation: isolate` on rounded video/image cards
- [ ] Bump inner-content padding from 80 → 160+ on the canvas so text doesn't hit the screen edge
- [ ] Keep the headline picker / debug-only UI out of the production block (but preserve in the design file)
- [ ] If the design needs lead capture, copy the video-breakdown CTA flow verbatim — don't rebuild

**Why this matters:** Bev has run this exact loop multiple times and each missed step costs an iteration. If a design-canvas mockup hits this skill, **apply all eight rules without waiting to be asked.**

---

## HTML format: when to use, what it looks like

For purely visual blocks with no data, a plain HTML file works in a vibe block. The structure is a complete standalone HTML document:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Section Name</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: transparent; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    .my-container { max-width: 1400px; margin: 0 auto; padding: 20px; }
    /* ... */
  </style>
</head>
<body>
  <div class="my-container">
    <!-- content -->
  </div>
</body>
</html>
```

**Rules for HTML vibe blocks:**
- Always set `body { background: transparent; }` so it inherits the Softr page background
- Self-contained: all CSS in a `<style>` tag, all JS in a `<script>` tag
- No external React or component imports
- Safe to use Font Awesome or other CDN stylesheets via `<link>` in the head
- Animations via CSS keyframes are fine
- Responsive via media queries

When in doubt about which format Bev wants, default to JSX for anything interactive or data-connected, and HTML for pure visual sections.

---

## Common patterns

### Multi-step wizard

```jsx
export default function Block() {
  const [step, setStep] = useState(1);
  const [data, setData] = useState(null);

  return (
    <div className="container py-10">
      <div className="content">
        <h1 className="text-2xl font-bold text-foreground">My Wizard</h1>
        {step === 1 && <Step1 onNext={(d) => { setData(d); setStep(2); }} />}
        {step === 2 && <Step2 data={data} onBack={() => setStep(1)} onNext={() => setStep(3)} />}
        {step === 3 && <Step3 data={data} onBack={() => setStep(2)} />}
      </div>
    </div>
  );
}
```

### Form with validation and submit

```jsx
function MyForm() {
  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const user = useCurrentUser();
  const createRecord = useRecordCreate({ fields: createFields });

  const handleSubmit = async () => {
    if (!name) { toast.error("Name is required"); return; }
    if (!user?.id) { toast.error("Please log in"); return; }
    setSubmitting(true);
    try {
      await createRecord.mutateAsync({ name, users: user.id });
      toast.success("Created!");
      setName("");
    } catch (e) {
      toast.error("Failed", { description: e.message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Name" />
      <Button onClick={handleSubmit} disabled={submitting || !createRecord.enabled}>
        {submitting ? "Saving..." : "Save"}
      </Button>
    </div>
  );
}
```

### Linked record dropdown

```jsx
const { data: projectData } = useLinkedRecords({
  select: createFields,
  field: "projects",
  count: 100
});
const projects = projectData?.pages.flatMap((p) => p.items) ?? [];

// Then in render:
<Select value={selectedId} onValueChange={setSelectedId}>
  <SelectTrigger><SelectValue placeholder="Select a project" /></SelectTrigger>
  <SelectContent>
    {projects.map((p) => (
      <SelectItem key={p.id} value={p.id}>{p.title}</SelectItem>
    ))}
  </SelectContent>
</Select>
```

### Console logging for debugging

When debugging a vibe block, prefix logs with a version marker so they're easy to find in the browser console and easy to diff against earlier versions:

```jsx
console.log("=== v3 fields:", JSON.stringify(fields));
console.log("=== v3 user:", user?.id);
```

---

## Editing an existing block: what to preserve

Whether the source came from the MCP or from a file in the repo, before changing anything:

1. **Read the whole file first** before changing anything. The constants at the top (option UUID arrays, `q.select` mapping, `DESTINATION_FIELDS`) are often the source of truth — don't break them.
2. **Preserve the field ID mapping** in `q.select({})`. Don't rename aliases unless Bev asks for it (renames cascade everywhere and break the Actions tab connection).
3. **Preserve the option UUID arrays** unless Bev says the options have changed. Even if a label looks wrong, the UUID is what Softr uses to write.
4. **Match the existing style**. If the file uses semantic Tailwind tokens, keep using them. If it uses certain helper functions (`buildFieldsFromRow`, `convertToISODate`), reuse them rather than inventing new ones.
5. **Keep the default `Block` export** — don't rename it.
6. **When in doubt about the format the block uses (JSX vs HTML), check the file extension and the imports** — `.jsx` with `import` statements = React vibe block, `.html` or `.txt` with `<!DOCTYPE html>` = plain HTML.
7. **Don't introduce new imports without confirming they exist.** If you want to use a new shadcn component, ask Bev first whether it's available in her Softr environment.

---

## Checklist before writing or editing a vibe code block

1. **Right block type?** This skill is for Vibe Coding blocks (React/JSX or HTML in the Content > Code tab). For raw Custom Code blocks, use `softr-custom-code-block`.
2. **JSX or HTML?** JSX for anything dynamic or data-connected (default). HTML only for static visual sections with no interactivity or data.
3. **Database connection?** If yes, do you have:
   - The table name?
   - All the field IDs?
   - All the option UUIDs for SELECT/multi-select fields?
   - If any are missing, **stop and ask Bev**.
4. **User-scoped filtering needed?** That goes in the Source tab UI, not in code. Tell Bev to set it there.
5. **Default export named `Block`?** It must be `export default function Block()`.
6. **Imports correct?** Using `@/components/ui/*`, `@/lib/datasource`, `@/lib/user`, `lucide-react`, `sonner` — and no others without confirming.
7. **Tailwind semantic tokens?** Using `text-primary`, `bg-muted`, etc. — not raw colours like `text-blue-500`.
8. **Field value formats correct?** Linked records as `[{ id }]`, multi-selects as arrays of UUIDs, dates as ISO strings, hidden user as `user?.id`.
9. **`createRecord.enabled` and `user?.id` checks before writing?**
10. **Error handling on async writes?** Wrap `mutateAsync` in try/catch with toast feedback.
11. **Editing existing file?** Preserved the `q.select` mapping, option UUID arrays, and default export name?
12. **New field aliases added?** Tell Bev to add them in the Actions tab.
