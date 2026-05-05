# Softr Events and Selectors Reference

Full reference for all custom events, global variables, CSS selectors, and code patterns available in Softr custom code.

---

## Table of Contents

1. Global Variables
2. Block Lifecycle Events
3. Data Events (get-record, get-records, update-records)
4. Action Button Events
5. Form Events
6. Chart Events
7. Header and Navigation Events
8. Tab Container Events
9. Block Reload Events
10. CSS Selectors (Stable)
11. CSS Selectors (Navigation)
12. Data Attribute Selectors
13. Action Button Selectors
14. Dialog Selectors
15. Styling Patterns and Examples

---

## 1. Global Variables

### window.logged_in_user
Available when a user is logged in. Properties:
- `softr_user_email`
- `softr_user_full_name`
- Any additional properties from a synced users table

### window[hrid]
Block-specific data stored on the window object, keyed by block hrid.
- List, List details, Kanban, Chart, Org chart, Calendar, Twitter, Map: `baseId`, `tableName`
- Form: `airtableBaseUrl`
- Map: `google_map_api_key`

### openSwModal(url)
Opens a given URL in a Softr modal overlay.
```javascript
openSwModal('https://example.com/');
```

### Page metadata
A `<div>` at the top of `<body>` exposes `data-appid` and `data-pageid` attributes.

---

## 2. Block Lifecycle Events

### block-loaded-{hrid}
Fires when React mounts the block into the DOM. Use instead of DOMContentLoaded.

```javascript
window.addEventListener('block-loaded-table1', () => {
  console.log('Block loaded');
});
```

---

## 3. Data Events

### get-record-{hrid}
Fires on every single data response. Used on list-details blocks. The record data is in `e.detail`.

```javascript
window.addEventListener('get-record-list-details1', (e) => {
  console.log(e.detail);
  // { id: '***', fields: {...} }
});
```

Wait for rendering to complete:
```javascript
window.addEventListener('get-record-list-details1', (e) => {
  setTimeout(() => {
    // Block has finished rendering
  }, 50);
});
```

Hide block if no record found:
```javascript
window.addEventListener('get-record-list-details1', (e) => {
  if (!e.detail.id) {
    document.getElementById('list-details1').classList.add('d-none');
  }
});
```

### get-records-{hrid}
Fires on every data response for multi-record blocks. Data is an array in `e.detail`.

```javascript
window.addEventListener('get-records-table1', (e) => {
  console.log(e.detail);
  // [{ id: '***', fields: {...} }]
});
```

### get-records-{hrid}:before
Fires before the data request is sent. Catches inline filter or search changes.

```javascript
window.addEventListener('get-records-table1:before', (e) => {
  console.log(e.detail);
  // { search: '', filter: [{ field: 'size', value: 'M' }] }
});
```

### update-records-{hrid}
Dispatch this event to modify, add, or remove data before rendering. Use with get-records to intercept and transform data.

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

---

## 4. Action Button Events

### add-record-{hrid}
Fires when form submission in the add-record modal is triggered.

### add-record-success-{hrid}
Fires on successful submission.

### add-record-failure-{hrid}
Fires on failed submission.

```javascript
window.addEventListener("block-loaded-list1", () => {
  window.addEventListener("add-record-list1", (e) => {
    console.log("adding the record -> ", e);
  });
  window.addEventListener("add-record-success-list1", (e) => {
    console.log("success -> ", e);
  });
  window.addEventListener("add-record-failure-list1", (e) => {
    console.log("failure -> ", e);
  });
});
```

### update-record-success-{hrid}
Fires after successful record update. `e.detail` contains field values.

### update-record-failure-{hrid}
Fires after failed record update. `e.detail` contains error message.

```javascript
window.addEventListener('update-record-failure-list1', (e) => {
  console.log('update record failure', e.detail);
});

window.addEventListener('update-record-success-list1', () => {
  window.location.reload();
});
```

### upvote-record-success-{hrid} / upvote-record-failure-{hrid}

```javascript
window.addEventListener('upvote-record-success-BLOCKNAME', (e) => {
  console.log('upvote-record detail ', e.detail);
});
```

### call-api-success-{hrid} / call-api-failure-{hrid}
For webhook trigger actions.

```javascript
window.addEventListener('call-api-success-BLOCKNAME', (e) => {
  console.log('call-api-success', e.detail);
});
```

---

## 5. Form Events

### update-fields-{hrid}
Dispatch to programmatically set form input values. Works with Form and User Account blocks (Formik-based).

```javascript
window.addEventListener('block-loaded-form1', () => {
  const updateFields = new CustomEvent('update-fields-form1', {
    detail: {
      'Full Name': 'Softr',
      'Email': 'info@softr.io'
    }
  });
  window.dispatchEvent(updateFields);
});
```

### submit-form-{hrid}
Fires before sending submission request. `e.detail` has field names and values.

### submit-form-success-{hrid}
Fires on success. `e.detail` contains `{ payload: {...}, response: { headers, data, status } }`.

### submit-form-failure-{hrid}
Fires on failure. `e.detail` contains error message.

```javascript
window.addEventListener('submit-form-form1', (e) => {
  console.log('form submit', e.detail);
});

window.addEventListener('submit-form-success-form1', (e) => {
  console.log('form submit success', e.detail);
});

window.addEventListener('submit-form-failure-form1', (e) => {
  console.log('form submit failure', e.detail);
});
```

### Custom validation messages

```javascript
window["softr_validation_messages"] = {
  required: "This field is required",
  email: "Please enter a valid email",
  phone: "Please enter a valid phone number",
  url: "Please enter a valid URL"
};
```

---

## 6. Chart Events

### chart-loaded-{hrid}
Fires when chart is rendered. `event.detail` is the ECharts instance.

```javascript
window.addEventListener('chart-loaded-chart1', (event) => {
  const chartInstance = event.detail;
  let option = chartInstance.getOption();
  // Modify chart options
  chartInstance.setOption(option);
});
```

### Chart colours
Set before chart loads:
```javascript
window['chart1-colors'] = ['#FE8070', '#DD7E6B', '#EA9999', '#F4CCCC', '#24A37D'];
```

### invalidate-chart-cache-{hrid}
Dispatch to clear cached chart data:
```javascript
window.dispatchEvent(new CustomEvent("invalidate-chart-cache-chart1"));
```

### reload-{hrid} (charts)
Dispatch to reload chart:
```javascript
window.dispatchEvent(new CustomEvent("reload-chart1"));
```

### Invalidate and reload together
```javascript
setTimeout(() => {
  window.dispatchEvent(new CustomEvent("invalidate-chart-cache-chart1"));
  window.dispatchEvent(new CustomEvent("reload-chart1"));
}, 5000);
```

### Conditional chart colours by value
```javascript
window.addEventListener('chart-loaded-chart1', (event) => {
  const chartInstance = event.detail;
  let option = chartInstance.getOption();
  const seriesData = option.series[0].data;

  for (let i = 0; i < seriesData.length; i++) {
    let dataItem = seriesData[i];
    if (typeof dataItem === 'number') {
      dataItem = {value: dataItem};
    }
    if (dataItem.value > 100000) {
      dataItem.itemStyle = {color: 'red'};
    } else {
      dataItem.itemStyle = {color: 'green'};
    }
    seriesData[i] = dataItem;
  }

  option.series[0].data = seriesData;
  chartInstance.setOption(option);
});
```

---

## 7. Header and Navigation Events

### set-logo-link-{hrid}
Dispatch to set header logo link:
```javascript
window.addEventListener('block-loaded-header1', () => {
  const detail = { link: 'https://example.com' };
  window.dispatchEvent(new CustomEvent('set-logo-link-header1', { detail }));
});
```

### user-sign-out
Fires before logout. 300ms window for custom actions:
```javascript
window.addEventListener('user-sign-out', (e) => {
  // do actions before logout (300ms)
});
```

### Sign out via custom button
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

## 8. Tab Container Events

### tab-selected-{hrid}
Fires when user selects a different tab. Does not fire if clicking the already-active tab.

```javascript
window.addEventListener('tab-selected-tab-container1', (e) => {
  console.log(e.detail); // selected tab id
});
```

---

## 9. Block Reload Events

### reload-block-{hrid}
Dispatch to reload any block's data.

```javascript
// Calendar
window.addEventListener('block-loaded-calendar1', () => {
  window.dispatchEvent(new CustomEvent('reload-block-calendar1'));
});

// List after record update (same page)
window.addEventListener('update-record-success-list-details1', () => {
  window.dispatchEvent(new CustomEvent('reload-block-BLOCKNAME'));
});

// List after record update (details opened in modal)
window.addEventListener('update-record-success-list-details1', () => {
  window.parent.dispatchEvent(new CustomEvent('reload-block-BLOCKNAME'));
});
```

---

## 10. CSS Selectors (Stable)

These use the `.softr-` prefix and are stable across updates:

| Selector | Description |
|----------|-------------|
| `#hrid .softr-grid-container` | Grid card container (use `gap` property) |
| `#hrid .softr-list-container` | List block container |
| `#hrid .softr-fields-container` | All fields in list/detail blocks |
| `#hrid .softr-field-label` | Field labels |
| `#hrid [data-softr-field-id='field-id']` | Wrapper for a specific field |
| `#hrid [data-softr-dialog-type]` | All dialogs in a block |
| `#hrid [data-softr-dialog-type='UPDATE_RECORD']` | Specific dialog type |
| `#hrid [data-softr-dialog-type='ADD_RECORD']` | Add record dialog |

---

## 11. CSS Selectors (Navigation)

| Selector | Description |
|----------|-------------|
| `.softr-topbar` | Top navigation bar |
| `.softr-sidebar` | Sidebar navigation |
| `.softr-topbar .softr-nav-logo` | Logo in topbar |
| `.softr-topbar .softr-nav-link` | Navigation links |
| `.softr-topbar .softr-nav-link:hover` | Hovered nav link |
| `.softr-topbar .softr-nav-link[data-active=true]` | Active nav link |
| `.softr-sidebar .softr-nav-link` | Sidebar nav links |

---

## 12. Data Attribute Selectors

| Selector | Use |
|----------|-----|
| `.tag-item[data-content="Value"]` | Tags by exact content |
| `.tag-item[data-content^="Val"]` | Tags starting with value |
| `.tag-item[data-content*="val"]` | Tags containing substring |
| `[data-rating="1"]` | Rating elements by value |

---

## 13. Action Button Selectors

```css
/* All action buttons in a block */
#list1 button[data-action-button-id^="list1-visible-btn-"] {
  margin-left: 50px;
}

/* Specific action button by ID */
#list1 button[data-action-button-id^="list1-visible-btn-_l26zaezue"] {
  margin-left: 50px;
}
```

JavaScript selection:
```javascript
// Single button
const el = document.querySelector('[data-action-button-id="list1-visible-btn-0-rec1yIahkX1mZhLQn"]');

// All buttons matching prefix
const elements = document.querySelectorAll('[data-action-button-id^="list1-visible-btn-"]');
```

---

## 14. Dialog Selectors

Target and style dialogs by type:

```css
/* All dialogs */
#list1 [data-softr-dialog-type] { }

/* Only the Add Record dialog */
#list1 [data-softr-dialog-type="ADD_RECORD"] { }

/* Only the Update Record dialog */
#list1 [data-softr-dialog-type="UPDATE_RECORD"] { }
```

### Styling form inputs inside a dialog

```css
#list1 [data-softr-dialog-type="ADD_RECORD"]
{
  *:has(> input[type="text"]) {
    border: 1px solid lightgray;
    background-color: transparent;
    border-radius: 0px;
    border-top-left-radius: 8px;
    border-bottom-right-radius: 8px;

    input {
      background-color: initial;
    }

    /* Validation error state */
    &:has(> input[aria-invalid="true"]) {
      outline-color: crimson;
      border-color: transparent;
    }

    /* Focused state */
    &:has(> input:focus) {
      outline-color: teal;
      border-color: transparent;
    }
  }
}
```

---

## 15. Styling Patterns and Examples

### Page background gradient
```css
nav, section, footer {
  background: linear-gradient(90deg, rgba(132,127,221,1) 0%, rgba(166,166,255,1) 35%, rgba(0,212,255,1) 100%) !important;
}
```

### Block background image
```css
#map1 section {
  background-image: url(https://example.com/image.jpg);
}
```

### Full-width autoplay video
```css
#BLOCKID .container {
  width: 100vw !important;
  max-width: unset;
  padding: 0;
}
```

### Hide chart refresh message
```css
div[category='Chart'] span[class*='message'] {
  display: none !important;
}
```

### Hide form labels
```css
#user-accounts2 .form-input-label { display: none; }
```

### Hide button when href is empty
```css
a[data-element="button"][href=""] {
  display: none !important;
}
```

### Divider block
```html
<div class="divider"></div>
<style>
.divider {
  height: 1px;
  background-color: #fff;
  margin: 10px 0;
}
</style>
```

### Kanban column background colours
```javascript
window.addEventListener('block-loaded-kanban1', () => {
  const colorMap = {
    '1': { 'background': '#1E8700' },
    '2': { 'background': '#F6CF2D' },
    '3': { 'background': '#EC1212' },
  };

  const lookingForColumns = setInterval(() => {
    const columns = [...document.querySelectorAll('[data-column-name]')];
    if (columns.length) {
      clearInterval(lookingForColumns);
      columns.forEach(col => {
        const columnName = col.getAttribute('data-column-name');
        if (colorMap[columnName]) {
          col.style.background = colorMap[columnName].background;
        }
      });
    }
  }, 300);
});
```

### Translate pricing block text
```javascript
window.addEventListener('block-loaded-pricing1', () => {
  document.querySelectorAll("span").forEach(span => {
    if (span.textContent === 'Yearly') span.textContent = 'Annual';
    if (span.textContent === 'Monthly') span.textContent = 'Per Month';
  });
});
```

### Always-expanded sliding cards
```javascript
window.addEventListener('get-records-list4', () => {
  setTimeout(() => {
    document.querySelectorAll('#list4 .horizontal-list-item').forEach(item => item.click());
  }, 50);
});
```

### Prefilled URL with record ID after login redirect
```html
<script>
try {
  const url = new URL(document.referrer);
  if (url.search && window.location.href.indexOf('?') < 0)
    window.location.href = window.location.href + url.search;
} catch (e) {}
</script>
```

### Return to previous dynamic page preserving record ID
```html
<script>
try {
  const url = new URL(document.referrer);
  const prevRecordId = url.searchParams.get('recordId');
  if (prevRecordId && window.location.href.indexOf('?') < 0)
    window.location.href = window.location.href + '?recordId=' + prevRecordId;
} catch (e) {}
</script>
```
