---
id: api-docs
title: "API Documentation Generator"
description: "Generate comprehensive API endpoint documentation following MODO api-documentation-guide"
category: documentation
tags: [api, documentation, rest, openapi]
variables:
  - name: endpoint
    description: "API endpoint path"
    type: string
    required: true
  - name: method
    description: "HTTP method"
    type: string
    required: true
    defaultValue: "GET"
  - name: base_url
    description: "Base URL for the API"
    type: string
    required: false
  - name: request_schema
    description: "Description or shape of the request body/parameters"
    type: string
    required: false
  - name: response_schema
    description: "Description or shape of the successful response"
    type: string
    required: false
---

# API Documentation: {method} {endpoint}

Generate comprehensive API documentation for the MODO platform following the api-documentation-guide conventions. The output should be complete enough for a frontend developer to integrate the endpoint without reading the backend source code.

**Endpoint**: {endpoint}
**Method**: {method}
**Base URL**: {base_url}
**Request Schema**: {request_schema}
**Response Schema**: {response_schema}

---

## Documentation Output

### Endpoint Summary

| Property | Value |
|----------|-------|
| **URL** | `{base_url}{endpoint}` |
| **Method** | `{method}` |
| **Description** | <one sentence describing what this endpoint does> |
| **Authentication** | <Bearer token / API key / None — specify the mechanism> |
| **Rate Limit** | <requests per minute or per second, if applicable> |
| **Idempotent** | Yes / No |
| **Cache** | <cache policy: no-cache, max-age, ETag — if applicable> |

### Authentication

Describe the authentication requirement for this endpoint.

```
Authorization: Bearer <access_token>
```

Specify:
- How the token is obtained (login flow, OAuth, service-to-service)
- Required scopes or permissions
- What happens when the token is missing or expired (401 response)

### Headers

| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| `Authorization` | Yes | `Bearer <token>` | Access token |
| `Content-Type` | Conditional | `application/json` | Required for request bodies |
| `Accept` | No | `application/json` | Response format preference |
| `X-Request-ID` | No | UUID | Correlation ID for tracing |
| <additional headers> | ... | ... | ... |

### Path Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| <param from {endpoint}> | string | Yes | <description> |

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| <param> | <type> | Yes/No | <default or —> | <description> |

If {method} is GET, extract likely query parameters from {request_schema} or propose standard pagination and filtering parameters (`page`, `page_size`, `sort_by`, `sort_order`, `filter`).

### Request Body

Applicable when {method} is POST, PUT, or PATCH.

```json
{
  // Populate based on {request_schema}
  // Include field descriptions as comments
}
```

**TypeScript Interface**:

```typescript
interface RequestBody {
  // Derive from {request_schema}
  // Use strict types — no `any`
  // Mark optional fields with ?
}
```

| Field | Type | Required | Constraints | Description |
|-------|------|----------|-------------|-------------|
| <field> | <type> | Yes/No | <min/max/pattern/enum> | <description> |

### Success Response

**Status**: `200 OK` (or `201 Created` for POST, `204 No Content` for DELETE)

```json
{
  // Populate based on {response_schema}
  // Include realistic example values, not placeholders
}
```

**TypeScript Interface**:

```typescript
interface SuccessResponse {
  // Derive from {response_schema}
  // Use strict types — no `any`
  // Document each field with JSDoc comments
}
```

### Error Responses

Document all expected error responses for this endpoint.

| Status | Code | Message | Cause |
|--------|------|---------|-------|
| `400` | `VALIDATION_ERROR` | "Invalid request parameters" | Malformed request body or missing required fields |
| `401` | `UNAUTHORIZED` | "Authentication required" | Missing or expired access token |
| `403` | `FORBIDDEN` | "Insufficient permissions" | Valid token but lacks required scope |
| `404` | `NOT_FOUND` | "Resource not found" | The requested entity does not exist |
| `409` | `CONFLICT` | "Resource already exists" | Duplicate creation attempt |
| `422` | `UNPROCESSABLE_ENTITY` | "Business rule violation" | Request is valid but violates domain rules |
| `429` | `RATE_LIMITED` | "Too many requests" | Rate limit exceeded — include Retry-After header |
| `500` | `INTERNAL_ERROR` | "Internal server error" | Unexpected server failure |

**Error Response Shape**:

```typescript
interface ErrorResponse {
  status: number;
  code: string;
  message: string;
  details?: Record<string, string[]>; // field-level validation errors
  traceId?: string; // correlation ID for debugging
}
```

### Usage Examples

#### cURL

```bash
curl -X {method} "{base_url}{endpoint}" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '<request body if applicable>'
```

#### TypeScript (fetch)

```typescript
const response = await fetch(`{base_url}{endpoint}`, {
  method: '{method}',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
  // body: JSON.stringify(requestBody), // if applicable
});

if (!response.ok) {
  const error: ErrorResponse = await response.json();
  throw new ApiError(error.code, error.message);
}

const data: SuccessResponse = await response.json();
```

### Rate Limiting

| Limit | Window | Scope | Header |
|-------|--------|-------|--------|
| <requests> | <per second/minute> | Per user / Per IP / Global | `X-RateLimit-Remaining` |

When rate limited, the API returns `429 Too Many Requests` with a `Retry-After` header indicating seconds until the next allowed request.

### Gaps vs PRD

If there are discrepancies between this endpoint's current behavior and what the product requirements document specifies, list them here:

| PRD Requirement | Current API Behavior | Gap | Priority |
|-----------------|---------------------|-----|----------|
| <requirement> | <what the API actually does> | <what is missing or different> | High/Medium/Low |

Flag any gaps that block frontend integration so they can be prioritized in the current sprint.
