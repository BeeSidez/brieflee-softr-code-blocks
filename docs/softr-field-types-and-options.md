# Softr Database API: Field Types and Options Reference

**Created:** 2026-05-06
**Updated:** 2026-05-06

**Canonical copy:** `Docs/softr-field-types-and-options.md`. Identical copies live in `Brieflee/brieflee-softr-code-blocks/docs/` and `Creator Scans/Softr Vibe Code Blocks/docs/`. Change the canonical one and copy it across in the same session.

> Not reviewed since 2026-05-06. Verify against the live tool before relying on it.

Complete reference for all field types, their value formats, configuration options, and AI auto-fill settings.

---

## Table of Contents

1. Editable Field Types
2. Read-Only Field Types
3. Field Options by Type
4. AI Options Configuration
5. Field Properties
6. Database Schema Object
7. Table Schema Object
8. Record Schema Object
9. Search Filter Operators (Full Reference)
10. Relative Date Tokens

---

## 1. Editable Field Types

These fields can be set when creating or updating records.

| Type | Value Format | Description |
|------|-------------|-------------|
| `SINGLE_LINE_TEXT` | `string` | Short text |
| `LONG_TEXT` | `string` | Multi-line text |
| `EMAIL` | `string` | Email address |
| `PHONE` | `string` | Phone number |
| `URL` | `string` | Web URL |
| `NUMBER` | `number` | Numeric value |
| `CURRENCY` | `number` | Monetary amount |
| `PERCENT` | `number` | Percentage (0-100) |
| `RATING` | `number` | Star rating |
| `DURATION` | `number` | Duration |
| `CHECKBOX` | `boolean` | True/false |
| `SELECT` | `string` or `array` | Single or multi-select from predefined choices |
| `USER` | `object` or `array` | User reference |
| `LINKED_RECORD` | `string` or `array` | Link to record(s) in another table |
| `ATTACHMENT` | `object` or `array` | File attachment |
| `DATE` | `string` | Date (ISO 8601, e.g. `"2025-05-21"`) |
| `DATETIME` | `string` | Date and time (ISO 8601, e.g. `"2025-05-21T20:00:00.000Z"`) |

---

## 2. Read-Only Field Types

These are computed or system-managed. They cannot be set when creating or updating records.

| Type | Description |
|------|-------------|
| `LOOKUP` | Value from a linked record's field |
| `ROLLUP` | Aggregation over linked records |
| `FORMULA` | Calculated from a formula expression |
| `CREATED_AT` | Record creation timestamp |
| `UPDATED_AT` | Record last modified timestamp |
| `CREATED_BY` | User who created the record |
| `UPDATED_BY` | User who last modified the record |
| `AUTONUMBER` | Auto-incrementing number |
| `RECORD_ID` | System record identifier |

---

## 3. Field Options by Type

Type-specific configuration passed in the `options` object when creating or updating fields via the API.

### SELECT

```json
{
  "choices": [
    { "id": "choice-1", "label": "Option A", "color": "#FF0000" },
    { "id": "choice-2", "label": "Option B", "color": "#00FF00" }
  ],
  "allowToAddNewChoice": true,
  "sorting": "CUSTOM",
  "enforceOrder": false
}
```

`sorting` values: `CUSTOM`, `ALPHA_ASC`, `ALPHA_DESC`

### NUMBER

```json
{
  "precision": 2,
  "min": 0,
  "max": 1000000,
  "showThousandSeparator": true,
  "thousandSeparatorLocale": "en-US",
  "largeNumberAbbreviation": "NONE",
  "prefix": null,
  "suffix": null
}
```

`largeNumberAbbreviation` values: `NONE`, `K`, `M`, `B`, `T`

### CURRENCY

```json
{
  "precision": 2,
  "min": null,
  "max": null,
  "isoCode": "USD",
  "customSymbol": null,
  "showAs": "SYMBOL",
  "showThousandSeparator": true,
  "thousandSeparatorLocale": "en-US",
  "largeNumberAbbreviation": "NONE",
  "symbolOrCodePosition": "BEFORE"
}
```

- `showAs`: `SYMBOL` or `CODE`
- `symbolOrCodePosition`: `BEFORE` or `AFTER`

For GBP: set `"isoCode": "GBP"`, `"showAs": "SYMBOL"`, `"symbolOrCodePosition": "BEFORE"`

### LINKED_RECORD

```json
{
  "linkedTableId": "table-uuid",
  "inverseLinkFieldId": "field-uuid",
  "viewId": null,
  "sorting": [],
  "filter": null,
  "enforceOrder": false
}
```

### LOOKUP

```json
{
  "linkedRecordFieldId": "field-uuid",
  "lookupFieldId": "field-uuid",
  "isValid": true
}
```

### ROLLUP

```json
{
  "linkedRecordFieldId": "field-uuid",
  "rollupFieldId": "field-uuid",
  "function": "SUM",
  "filter": null
}
```

Available functions: `SUM`, `MIN`, `MAX`, `COUNT`, `AVERAGE`, `ARRAYCOMPACT`, `ARRAYJOIN`, `ARRAYUNIQUE`, `ARRAYFLATTEN`, `CONCATENATE`, `COUNTALL`, `COUNTA`, `OR`, `AND`

### ATTACHMENT

```json
{
  "showAs": "PREVIEW",
  "inferredFileType": "OTHER",
  "enableFileLinkExpiration": true,
  "fileLinkExpirationValue": 2,
  "fileLinkExpirationUnit": "HOURS"
}
```

- `showAs`: `PREVIEW`, `LIST`, or `BADGE`
- `inferredFileType`: `IMAGE`, `VIDEO`, `PDF`, `AUDIO`, or `OTHER`
- `fileLinkExpirationUnit`: `HOURS` or `MINUTES`

### FORMULA

```json
{
  "formula": "IF({Status} = 'Active', {Amount} * 1.1, {Amount})",
  "isValid": true,
  "referencedFieldIds": ["field-uuid-1", "field-uuid-2"]
}
```

Formulas reference other fields using `{FieldName}` syntax.

---

## 4. AI Options Configuration

Fields can include an `aiOptions` object for AI-powered auto-fill. Returned in field definitions and settable when creating/updating fields.

```json
{
  "aiFillable": true,
  "aiOnly": false,
  "allowWebSearch": true,
  "aiModel": "GPT_4_1",
  "prompt": "Summarize the customer's request based on {Description}",
  "canBeTriggeredManually": true,
  "runWhenRecordIsCreated": true,
  "runWhenRecordIsUpdated": false
}
```

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `aiFillable` | boolean | `false` | Whether AI can fill this field |
| `aiOnly` | boolean | `true` | If true, only AI can write to this field |
| `allowWebSearch` | boolean | `false` | Allow AI to use web search when filling |
| `aiModel` | string | `"GPT_4_1"` | AI model to use |
| `prompt` | string | `""` | Prompt template (reference other fields with `{FieldName}`) |
| `canBeTriggeredManually` | boolean | `true` | Whether users can trigger AI fill manually |
| `runWhenRecordIsCreated` | boolean | `true` | Auto-run when record is created |
| `runWhenRecordIsUpdated` | boolean | `true` | Auto-run when record is updated |

Fields without AI configuration return `"aiOptions": null`.

---

## 5. Field Properties

Every field object returned by the API includes these properties:

| Property | Type | Description |
|----------|------|-------------|
| `id` | string | UUID |
| `name` | string | Human-readable field name |
| `description` | string or null | Optional description |
| `type` | string | Field type enum |
| `options` | object | Type-specific configuration |
| `allowMultipleEntries` | boolean | Whether multiple values are allowed |
| `readonly` | boolean | Whether the field is read-only |
| `required` | boolean | Whether the field is required |
| `locked` | boolean | Whether the field is locked from editing |
| `defaultValue` | string or null | Default value for new records |
| `aiOptions` | object or null | AI auto-fill configuration |
| `createdAt` | datetime | Field creation timestamp |
| `updatedAt` | datetime | Field last modified timestamp |

---

## 6. Database Schema Object

```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string or null",
  "workspaceId": "string (UUID)",
  "tablesCount": "integer",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 7. Table Schema Object

```json
{
  "id": "string (UUID)",
  "name": "string",
  "description": "string or null",
  "primaryFieldId": "string (UUID)",
  "defaultViewId": "string (UUID)",
  "fields": [{ "...field objects..." }],
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

The `fields` array contains full field definitions when fetching a single table.

Table views have this shape:
```json
{
  "id": "string (UUID)",
  "tableId": "string (UUID)",
  "name": "string",
  "description": "string or null",
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

---

## 8. Record Schema Object

```json
{
  "id": "string (UUID)",
  "tableId": "string (UUID)",
  "fields": {
    "field-id-or-name": "value"
  },
  "createdAt": "datetime",
  "updatedAt": "datetime"
}
```

The `fields` object keys are field IDs by default, or field names when `?fieldNames=true` is passed.

---

## 9. Search Filter Operators (Full Reference)

### Binary Operators (require leftSide + rightSide)

| Operator | Description | rightSide type |
|----------|-------------|----------------|
| `IS` | Equals | single value |
| `IS_NOT` | Not equals | single value |
| `GREATER_THAN` | Greater than | number or date |
| `GREATER_THAN_OR_EQUALS` | Greater than or equal | number or date |
| `LESS_THAN` | Less than | number or date |
| `LESS_THAN_OR_EQUALS` | Less than or equal | number or date |
| `CONTAINS` | String contains (case-insensitive) | string |
| `DOES_NOT_CONTAIN` | String does not contain | string |
| `STARTS_WITH` | String starts with | string |
| `DOES_NOT_START_WITH` | String does not start with | string |
| `ENDS_WITH` | String ends with | string |
| `DOES_NOT_END_WITH` | String does not end with | string |
| `IS_ONE_OF` | Value is one of | array of strings |
| `IS_NOT_ONE_OF` | Value is none of | array of strings |
| `HAS_ANY_OF` | Multi-value field has any of | array of strings |
| `HAS_ALL_OF` | Multi-value field has all of | array of strings |
| `HAS_NONE_OF` | Multi-value field has none of | array of strings |

### Unary Operators (require leftSide only)

| Operator | Description |
|----------|-------------|
| `IS_EMPTY` | Field has no value |
| `IS_NOT_EMPTY` | Field has a value |

### Ternary Operators (require leftSide + lowerBound + upperBound)

| Operator | Description |
|----------|-------------|
| `IS_BETWEEN` | Value is between bounds (inclusive) |
| `IS_NOT_BETWEEN` | Value is outside bounds |
| `IS_WITHIN` | Date is within a relative range |
| `IS_NOT_WITHIN` | Date is outside a relative range |

### Composite Operators (require conditions array)

| Operator | Description |
|----------|-------------|
| `AND` | All conditions must match |
| `OR` | Any condition must match |

Composite conditions can be nested to any depth.

---

## 10. Relative Date Tokens

For date fields in search filters, these relative values can be used instead of fixed ISO 8601 dates.

### PREDEFINED tokens

| Token | Meaning |
|-------|---------|
| `PREDEFINED:TODAY` | Current date |
| `PREDEFINED:YESTERDAY` | Previous day |
| `PREDEFINED:TOMORROW` | Next day |
| `PREDEFINED:THIS_WEEK` | Current week |
| `PREDEFINED:LAST_WEEK` | Previous week |
| `PREDEFINED:THIS_MONTH` | Current month |
| `PREDEFINED:THIS_YEAR` | Current year |
| `PREDEFINED:NEXT_MONTH` | Next month |
| `PREDEFINED:PAST_MONTH` | Previous month |
| `PREDEFINED:7_DAYS_AGO` | 7 days ago |
| `PREDEFINED:30_DAYS_FROM_NOW` | 30 days from now |

### RELATIVE_DATE tokens

Format: `RELATIVE_DATE:<period>:<unit>`

| Period | Description |
|--------|-------------|
| `THIS` | Current period |
| `PAST` | Previous period |
| `NEXT` | Next period |

| Unit | Description |
|------|-------------|
| `WEEK` | Week |
| `MONTH` | Month |
| `QUARTER` | Quarter |
| Number (e.g. `7`) | Number of days |

Examples:
- `RELATIVE_DATE:THIS:WEEK` — this week
- `RELATIVE_DATE:PAST:MONTH` — last month
- `RELATIVE_DATE:NEXT:QUARTER` — next quarter
- `RELATIVE_DATE:PAST:7` — 7 days ago
