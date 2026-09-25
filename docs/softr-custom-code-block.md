**Created:** 2026-05-06
**Updated:** 2026-05-06

**Canonical copy:** `Docs/softr-custom-code-block.md`. Identical copies live in `Brieflee/brieflee-softr-code-blocks/docs/` and `Creator Scans/Softr Vibe Code Blocks/docs/`. Change the canonical one and copy it across in the same session.

> Not reviewed since 2026-05-06. Verify against the live tool before relying on it.

---
name: softr-custom-code-block
description: Write code for Softr Custom Code blocks - raw HTML, CSS, and JavaScript that goes inside the Custom Code block (Blocks > Static > Custom Code). Use this skill whenever asked to write, fix, style, or extend a Softr Custom Code block, add JavaScript or CSS to a Softr page, embed a third-party widget in Softr (Calendly, Typeform, etc.), style an existing Softr block, add event listeners to Softr blocks, manipulate Softr DOM elements, hook into Softr events (block-loaded, get-records, update-records, submit-form, etc.), or use Softr-specific JavaScript APIs like window.SOFTR_PAGE, window.logged_in_user, or openSwModal. Trigger on phrases like "add custom code to Softr," "add a script to my Softr page," "style this Softr block," "Softr custom code block," "embed X in Softr," or any mention of Softr block hrids (list1, table1, form1, kanban1, chart1, etc.) in a custom code context. This skill is for the Custom Code block specifically (raw HTML/CSS/JS), NOT for Vibe Coding blocks (React/JSX) - if the user mentions vibe code, vibe block, or React components, use the softr-vibe-code-block skill instead.
---

# Softr Custom Code Block Skill

## What this skill covers

Writing raw HTML, CSS, and JavaScript for Softr Custom Code blocks. Includes Softr's global APIs, custom events, CSS selectors, and SPA-mode rules.

**For Vibe Coding blocks (React/JSX), use the `softr-vibe-code-block` skill instead.** This skill is only for Custom Code blocks.

---

## What a Custom Code block is

- Available on Basic plan and above
- Added via Blocks > Static > Custom Code
- Accepts raw HTML, CSS, and JavaScript
- Code is inserted inside the `<body>` element where the block sits
- Used for: embedding third-party widgets, custom styling, event listeners, DOM manipulation, conditional visibility, integrations
- For code in `<head>` or before `</body>`: use Settings > Custom Code or Page Settings, **not** a Custom Code block

---

## SPA mode rules (critical)

Softr runs in SPA (Single Page Application) mode. This changes how custom code behaves. **Follow these rules for all page-level custom code:**

### 1. Keep page-specific code out of app-level custom code
App header/footer scripts execute only once on first page load. They do NOT re-execute on navigation. Put page-specific code in Custom Code blocks on the page or in page-level custom code.

### 2. Use `<script type="module">` to avoid global name conflicts
Always wrap JS in module scripts to prevent variable collisions across pages.

### 3. Never use DOMContentLoaded in page-level code
It fires once on app load and never again during navigation. Instead, use:
```javascript
window.SOFTR_PAGE.waitFor(
  () => document.getElementById("some-element-id")
).then(() => {
  const element = document.getElementById("some-element-id");
  // element is visible, do your thing
});
```

### 4. Clean up on page navigation
Dynamically injected DOM nodes outside the custom code block's scope persist across navigations. Clean them up:
```javascript
window.SOFTR_PAGE.beforeUnload(() => {
  dynamicElement.remove();
});
```
Elements inserted inside the custom code block's own DOM scope are automatically removed.

### 5. Clean up timers and observers
```javascript
const interval = setInterval(() => { /* ... */ }, 1000);
window.SOFTR_PAGE.beforeUnload(() => {
  clearInterval(interval);
});
```

---

## Global variables and objects

- `window.logged_in_user` — available if user is logged in, with `softr_user_email`, `softr_user_full_name`, and any synced data source fields
- `window[hrid]` — block-specific data keyed by block hrid (e.g. `window['table1']`)
  - List, List details, Kanban, Chart, Calendar, Map blocks: has `baseId` and `tableName`
  - Form blocks: has `airtableBaseUrl`
  - Map blocks: has `google_map_api_key`
- `openSwModal(url)` — opens a URL in a Softr modal
- `data-appid` and `data-pageid` attributes on a `<div>` at the top of `<body>`

---

## Event listener pattern for React-rendered elements

Softr uses React internally. Adding event listeners directly to React elements is unreliable because React may re-render and destroy your listener. **Always delegate to a parent that doesn't re-render:**

```javascript
document.body.addEventListener('click', (e) => {
  if (e.target.closest('#table1 .ag-row')) {
    // handle click on table row
  }
});
```

---

## Key events reference

Read `references/events-and-selectors.md` for the full list. Here's a quick summary of the most-used events:

### Block lifecycle
- `block-loaded-{hrid}` — block mounted to DOM (use instead of DOMContentLoaded)

### Data events
- `get-record-{hrid}` — single record received (list-details blocks)
- `get-records-{hrid}` — record set received (list, table, kanban, etc.)
- `get-records-{hrid}:before` — fires before data request (catches filter/search changes)
- `update-records-{hrid}` — dispatch to modify/replace rendered data

### Action events
- `add-record-{hrid}`, `add-record-success-{hrid}`, `add-record-failure-{hrid}`
- `update-record-success-{hrid}`, `update-record-failure-{hrid}`
- `call-api-success-{hrid}`, `call-api-failure-{hrid}`

### Form events
- `update-fields-{hrid}` — dispatch to programmatically set form values
- `submit-form-{hrid}`, `submit-form-success-{hrid}`, `submit-form-failure-{hrid}`

### Block reload
- `reload-block-{hrid}` — dispatch to refresh a block's data

### Chart events
- `chart-loaded-{hrid}` — chart rendered, access chart instance via `event.detail`
- `invalidate-chart-cache-{hrid}` — clear cached chart data
- `reload-{hrid}` — reload chart

### Navigation
- `user-sign-out` — fires before logout (300ms window for custom actions)
- `tab-selected-{hrid}` — tab container tab changed

---

## CSS selectors and styling

### Stable selectors (safe to use)
- `.softr-grid-container` — grid card container (adjust gap)
- `.softr-list-container` — list block container
- `.softr-fields-container` — field container in list/detail blocks
- `.softr-field-label` — field labels
- `[data-softr-field-id='your-field-id']` — target specific fields
- `[data-softr-dialog-type]` — dialog containers (e.g. `[data-softr-dialog-type='ADD_RECORD']`)
- `[data-action-button-id^="list1-visible-btn-"]` — action buttons
- `.tag-item[data-content="Value"]` — tags by content
- `[data-rating="1"]` — rating elements by value

### Navigation selectors
- `.softr-topbar` — top navigation bar
- `.softr-sidebar` — sidebar navigation
- `.softr-nav-logo` — logo element
- `.softr-nav-link` — navigation links
- `.softr-nav-link[data-active=true]` — active nav link

### Priority tip
Always scope selectors with the block hrid for specificity:
```css
#table1 .MuiInputBase-input {
  border-left: none;
}
```

---

## Common patterns

### Hide empty field rows in list-details
```html
<script>
const blockName = 'list-details1';
const fields = ['Field1', 'Field2'];
window.addEventListener('update-record', (e) => {
  if (e.detail && e.detail.fields) {
    const id = e.detail.id;
    const tmpFields = Object.assign({}, e.detail.fields);
    fields.forEach((field) => e.detail.fields[field] = e.detail.fields[field] || ' ');
    setTimeout(() => {
      if (window.records[id] && window.records[id].record) {
        window.records[id].record.fields = tmpFields;
      }
    }, 1);
  }
});
window.addEventListener('get-record-' + blockName, (e) => {
  if (e.detail) window.dispatchEvent(new CustomEvent('update-record', { detail: e.detail }));
});
</script>
```

### Modify data before rendering
```javascript
window.addEventListener('get-records-table1', (e) => {
  const modifiedRecords = e.detail.map(({fields, ...other}) => ({
    ...other,
    fields: {
      ...fields,
      phone: fields.phone ? fields.phone.replace('+374', '0') : '',
    }
  }));
  const modify = new CustomEvent('update-records-table1', { detail: modifiedRecords });
  setTimeout(() => window.dispatchEvent(modify), 1);
});
```

### Prefill form fields programmatically
```javascript
window.addEventListener('block-loaded-form1', () => {
  const updateFields = new CustomEvent('update-fields-form1', {
    detail: {
      'Full Name': 'Default Name',
      'Email': 'default@example.com'
    }
  });
  window.dispatchEvent(updateFields);
});
```

### Reload a list block after a record update
```javascript
// Same page
window.addEventListener('update-record-success-list-details1', () => {
  window.dispatchEvent(new CustomEvent('reload-block-list1'));
});

// If details page opened in modal
window.addEventListener('update-record-success-list-details1', () => {
  window.parent.dispatchEvent(new CustomEvent('reload-block-list1'));
});
```

### Set chart colours
```html
<script>
window['chart1-colors'] = ['#FE8070', '#DD7E6B', '#EA9999', '#24A37D', '#AEAEB5'];
</script>
```

### Hide form labels
```css
<style>
#user-accounts2 .form-input-label { display: none; }
</style>
```

### Custom validation messages
```html
<script>
window["softr_validation_messages"] = {
  required: "This field is required",
  email: "Please enter a valid email",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL"
};
</script>
```

### Sign out user via custom button
```javascript
window.addEventListener('block-loaded-BLOCKNAME', () => {
  setTimeout(() => {
    const signOutButton = document.querySelector('BUTTON_CLASS_NAME');
    signOutButton.addEventListener('click', () => {
      document.cookie = 'jwtToken=;path=/;expires=Thu, 01 Jan 1970 00:00:00 UTC;SameSite=None;Secure';
      window.location.href = '/';
    });
  }, 1000);
});
```

---

## Checklist before writing Softr custom code

1. **Right block type?** This skill is for Custom Code blocks (HTML/CSS/JS). For Vibe Coding blocks (React/JSX), use `softr-vibe-code-block` instead.
2. **Where does the code go?** Page-level header, Custom Code block on page, or app-level header/footer?
3. **SPA safe?** Using `<script type="module">`? Avoiding DOMContentLoaded? Cleaning up dynamic DOM/timers?
4. **Correct hrid?** Replace placeholder hrids (list1, table1, form1) with the actual block hrid from the user's app.
5. **Event delegation?** Using parent-level listeners for React-rendered elements?
6. **Scoped selectors?** Prefixing CSS with `#hrid` for specificity?
