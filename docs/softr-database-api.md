**Created:** 2026-05-06
**Updated:** 2026-05-06

**Canonical copy:** `Docs/softr-database-api.md`. Identical copies live in `Brieflee/brieflee-softr-code-blocks/docs/` and `Creator Scans/Softr Vibe Code Blocks/docs/`. Change the canonical one and copy it across in the same session.

> Not reviewed since 2026-05-06. Verify against the live tool before relying on it.

---
name: softr-database-api
description: Interact with the Softr Database API to read, write, search, and manage data in Softr Database tables. Use this skill whenever asked to call the Softr API, query Softr Database records, create or update records via API, build n8n workflows that talk to Softr Database, write scripts that interact with Softr data, search or filter Softr records programmatically, manage Softr tables or fields via API, or integrate external systems with Softr Database. Also trigger when the user mentions Softr API, Softr Database API, tables-api.softr.io, Softr-Api-Key, Softr records, Softr PAT token, or says things like "pull records from Softr," "push data to Softr," "search the Softr table," "create a record in Softr," "update the Softr database," "filter Softr records," or "sync with Softr." Even if the user just says "hit the Softr API" or "query the database" and the context is clearly Softr, use this skill.
---

# Softr Database API Skill

## What this skill covers

The complete Softr Database REST API: authentication, CRUD operations on databases, tables, fields, and records, plus search/filtering, pagination, field types, and error handling.

---

## Base URL and Authentication

**Base URL:** `https://tables-api.softr.io/api/v1`

**Auth header:** Pass a Personal Access Token (PAT) in every request:
```
Softr-Api-Key: <your-token>
```

Tokens are scoped to one or more workspaces. You can only access databases within your authorized workspaces. The token inherits the access rights of the user who created it.

Generate tokens at: Settings > API Setup and Endpoints in Softr.

---

## Data Model

Four core resources, all identified by UUIDs:

- **Database** — top-level container belonging to a workspace, holds tables
- **Table** — structured collection of records with fields and views
- **Field** — column definition with a type (e.g. `SINGLE_LINE_TEXT`, `NUMBER`, `SELECT`) and optional config
- **Record** — single row of data, values stored in a `fields` object keyed by field ID (or field name with `?fieldNames=true`)

---

## Endpoint Quick Reference

### Databases
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/databases` | List all databases |
| `GET` | `/databases/{databaseId}` | Get single database |
| `POST` | `/databases` | Create database (requires `workspaceId`, `name`) |
| `PUT` | `/databases/{databaseId}` | Update database (`name`, `description`) |
| `DELETE` | `/databases/{databaseId}?force=false` | Delete database (must be empty unless `force=true`) |

### Tables
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/databases/{databaseId}/tables` | List all tables |
| `GET` | `/databases/{databaseId}/tables/{tableId}` | Get single table (includes fields) |
| `GET` | `/databases/{databaseId}/tables/{tableId}/views` | List table views |
| `POST` | `/databases/{databaseId}/tables` | Create table (`name`, `primaryFieldName`, `fields[]`) |
| `PUT` | `/databases/{databaseId}/tables/{tableId}` | Update table (`name`, `description`) |
| `DELETE` | `/databases/{databaseId}/tables/{tableId}?force=false` | Delete table (must be empty unless `force=true`) |

### Table Fields
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `.../{tableId}/fields` | Add field (`name`, `type`, `options`) |
| `PUT` | `.../{tableId}/fields/{fieldId}` | Update field |
| `DELETE` | `.../{tableId}/fields/{fieldId}` | Delete field |

### Records
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `.../{tableId}/records` | List records (paginated) |
| `GET` | `.../{tableId}/records/{recordId}` | Get single record |
| `POST` | `.../{tableId}/records` | Create record |
| `PATCH` | `.../{tableId}/records/{recordId}` | Update record (partial) |
| `DELETE` | `.../{tableId}/records/{recordId}` | Delete record |
| `POST` | `.../{tableId}/records/search` | Search records (filter, sort, paginate) |

All record endpoints accept `?fieldNames=true` to use human-readable field names instead of field IDs.

---

## Using Field Names

By default, the `fields` object uses field IDs (UUIDs) as keys. Add `?fieldNames=true` to any record endpoint to use human-readable names instead:

```
# Default (field IDs)
GET .../records
→ { "fields": { "fld_abc123": "Jane Doe" } }

# With field names
GET .../records?fieldNames=true
→ { "fields": { "Full Name": "Jane Doe" } }
```

This works on GET, POST, PATCH, and search endpoints.

---

## Pagination

All list endpoints use offset-based pagination:

| Parameter | Default | Max | Description |
|-----------|---------|-----|-------------|
| `offset` | `0` | — | Records to skip |
| `limit` | `20` | `200` | Records per page |

Response includes `metadata` with `total` count. Iterate like this:
```
GET .../records?offset=0&limit=100    → records 1-100
GET .../records?offset=100&limit=100  → records 101-200
```
Stop when `offset >= metadata.total`.

---

## Search and Filtering

The most powerful endpoint. `POST .../records/search` with a JSON body:

```json
{
  "paging": { "offset": 0, "limit": 50 },
  "sorting": [
    { "sortingField": "field-uuid", "sortType": "ASC" }
  ],
  "filter": {
    "condition": { ... }
  }
}
```

All three top-level fields are optional.

### Filter Condition Types

**Binary** (compare field to value):
```json
{ "operator": "CONTAINS", "leftSide": "field-uuid", "rightSide": "search term" }
```

Key operators: `IS`, `IS_NOT`, `GREATER_THAN`, `GREATER_THAN_OR_EQUALS`, `LESS_THAN`, `LESS_THAN_OR_EQUALS`, `CONTAINS`, `DOES_NOT_CONTAIN`, `STARTS_WITH`, `ENDS_WITH`, `IS_ONE_OF`, `IS_NOT_ONE_OF`, `HAS_ANY_OF`, `HAS_ALL_OF`, `HAS_NONE_OF`

**Unary** (check empty/not empty, no rightSide):
```json
{ "operator": "IS_EMPTY", "leftSide": "field-uuid" }
```

**Ternary** (range checks with bounds):
```json
{ "operator": "IS_BETWEEN", "leftSide": "field-uuid", "lowerBound": 10, "upperBound": 100 }
```

Operators: `IS_BETWEEN`, `IS_NOT_BETWEEN`, `IS_WITHIN`, `IS_NOT_WITHIN`

**Composite** (combine with AND/OR):
```json
{
  "operator": "AND",
  "conditions": [
    { "operator": "CONTAINS", "leftSide": "name-field", "rightSide": "acme" },
    { "operator": "GREATER_THAN", "leftSide": "amount-field", "rightSide": 1000 }
  ]
}
```

Text conditions are case-insensitive.

### Relative Date Values

For date fields, use relative strings instead of fixed dates:

| Format | Examples |
|--------|----------|
| `PREDEFINED:<token>` | `PREDEFINED:TODAY`, `PREDEFINED:YESTERDAY`, `PREDEFINED:TOMORROW`, `PREDEFINED:THIS_WEEK`, `PREDEFINED:LAST_WEEK`, `PREDEFINED:THIS_MONTH`, `PREDEFINED:THIS_YEAR`, `PREDEFINED:NEXT_MONTH`, `PREDEFINED:PAST_MONTH`, `PREDEFINED:7_DAYS_AGO`, `PREDEFINED:30_DAYS_FROM_NOW` |
| `RELATIVE_DATE:<period>:<unit>` | `RELATIVE_DATE:THIS:WEEK`, `RELATIVE_DATE:PAST:MONTH`, `RELATIVE_DATE:NEXT:QUARTER`, `RELATIVE_DATE:PAST:7` |
| ISO 8601 | `"2025-05-21"`, `"2025-05-21T20:00:00.000Z"` |

### Complete Search Example

Find active contacts named "acme" with amount over 1000, created this month:
```json
{
  "paging": { "offset": 0, "limit": 50 },
  "sorting": [
    { "sortingField": "amount-field-uuid", "sortType": "DESC" }
  ],
  "filter": {
    "condition": {
      "operator": "AND",
      "conditions": [
        { "operator": "CONTAINS", "leftSide": "name-field-uuid", "rightSide": "acme" },
        { "operator": "GREATER_THAN", "leftSide": "amount-field-uuid", "rightSide": 1000 },
        { "operator": "IS", "leftSide": "status-field-uuid", "rightSide": "active" },
        { "operator": "IS_WITHIN", "leftSide": "created-at-field-uuid", "lowerBound": "RELATIVE_DATE:THIS:MONTH", "upperBound": "PREDEFINED:TODAY" }
      ]
    }
  }
}
```

---

## Rate Limits

| Operation | Limit |
|-----------|-------|
| Reads (`GET`, `POST /search`) | 40 requests/second per token |
| Writes (`POST`, `PUT`, `PATCH`, `DELETE`) | 30 requests/second per token |

Exceeding returns `429 Too Many Requests`. Back off and retry.

---

## Response Format

**Single item:**
```json
{ "data": { ... }, "metadata": null }
```

**Paginated list:**
```json
{ "data": [ ... ], "metadata": { "offset": 0, "limit": 20, "total": 100 } }
```

**Error:**
```json
{ "message": "Human-readable message", "errorCode": "MACHINE_READABLE_CODE", "details": { "traceId": "abc-123" } }
```

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `BAD_REQUEST` | 400 | Invalid request format or data |
| `VALIDATION_ERROR` | 400 | Field validation failed |
| `UNKNOWN_FIELD` | 400 | Unrecognized field in request |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `QUOTA_EXCEEDED` | 402 | Plan quota limit reached |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `RESOURCE_NOT_FOUND` | 404 | Resource does not exist |
| `CONSTRAINT_VIOLATION` | 409 | Data constraint violation (e.g. duplicate unique value) |
| `PAYLOAD_TOO_LARGE` | 413 | Request body exceeds 64 MB |
| `TOO_MANY_REQUESTS` | 429 | Rate limit exceeded |
| `SERVICE_UNAVAILABLE` | 503 | Service temporarily unavailable |

---

## Field Types Quick Reference

### Editable fields
`SINGLE_LINE_TEXT` (string), `LONG_TEXT` (string), `EMAIL` (string), `PHONE` (string), `URL` (string), `NUMBER` (number), `CURRENCY` (number), `PERCENT` (number), `RATING` (number), `DURATION` (number), `CHECKBOX` (boolean), `SELECT` (string or array), `USER` (object or array), `LINKED_RECORD` (string or array), `ATTACHMENT` (object or array), `DATE` (ISO string), `DATETIME` (ISO string)

### Read-only fields (cannot set on create/update)
`LOOKUP`, `ROLLUP`, `FORMULA`, `CREATED_AT`, `UPDATED_AT`, `CREATED_BY`, `UPDATED_BY`, `AUTONUMBER`, `RECORD_ID`

For detailed field options (SELECT choices, CURRENCY config, LINKED_RECORD setup, FORMULA syntax, ROLLUP functions, ATTACHMENT config, AI options), see `references/field-types-and-options.md`.

---

## Common Patterns

### Fetch all records (paginate through everything)
```javascript
async function fetchAllRecords(databaseId, tableId, apiKey) {
  const baseUrl = `https://tables-api.softr.io/api/v1/databases/${databaseId}/tables/${tableId}/records`;
  let allRecords = [];
  let offset = 0;
  const limit = 200;

  while (true) {
    const res = await fetch(`${baseUrl}?offset=${offset}&limit=${limit}&fieldNames=true`, {
      headers: { 'Softr-Api-Key': apiKey }
    });
    const json = await res.json();
    allRecords = allRecords.concat(json.data);
    if (offset + limit >= json.metadata.total) break;
    offset += limit;
  }
  return allRecords;
}
```

### Create a record with field names
```bash
curl -X POST 'https://tables-api.softr.io/api/v1/databases/{dbId}/tables/{tableId}/records?fieldNames=true' \
  -H 'Softr-Api-Key: <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "fields": { "Name": "Jane Doe", "Email": "jane@example.com", "Status": "Active" } }'
```

### Partial update (only changed fields)
```bash
curl -X PATCH 'https://tables-api.softr.io/api/v1/databases/{dbId}/tables/{tableId}/records/{recordId}?fieldNames=true' \
  -H 'Softr-Api-Key: <token>' \
  -H 'Content-Type: application/json' \
  -d '{ "fields": { "Status": "Completed" } }'
```

### Search with nested AND/OR
```json
{
  "filter": {
    "condition": {
      "operator": "AND",
      "conditions": [
        { "operator": "IS", "leftSide": "status-field-id", "rightSide": "Active" },
        {
          "operator": "OR",
          "conditions": [
            { "operator": "CONTAINS", "leftSide": "name-field-id", "rightSide": "pro" },
            { "operator": "GREATER_THAN", "leftSide": "score-field-id", "rightSide": 80 }
          ]
        }
      ]
    }
  }
}
```

### Filter by view
```bash
GET .../records?viewId={viewId}&limit=100&fieldNames=true
```

---

## Checklist before writing Softr API calls

1. **Auth header?** Every request needs `Softr-Api-Key: <token>`
2. **Field names or IDs?** Add `?fieldNames=true` if using human-readable names
3. **Pagination?** Default limit is 20, max is 200. Loop with offset for large tables.
4. **Read-only fields?** Don't try to set LOOKUP, ROLLUP, FORMULA, CREATED_AT, etc. on create/update
5. **Search vs GET?** Use `POST .../records/search` for filtering. Use `GET .../records` for simple listing.
6. **Rate limits?** 40 reads/sec, 30 writes/sec. Add backoff logic for bulk operations.
7. **Force delete?** Databases and tables must be empty to delete unless `?force=true`
