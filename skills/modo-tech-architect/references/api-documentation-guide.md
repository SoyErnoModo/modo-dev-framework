# API Documentation Guide

How to document API integrations in technical guides for MODO projects.

## Complete API Documentation Template

For each API endpoint, document:

```markdown
### [API Name] - [Endpoint Path]

#### Endpoint Base
\`\`\`
[HTTP METHOD] https://[domain]/[path]
\`\`\`

#### Authentication
- Method: [Bearer Token | API Key | None]
- Header: [Authorization: Bearer XXX]
- [Additional auth details]

#### Headers
| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| Content-Type | ✅ | application/json | Request format |
| [Other headers] | | | |

#### Parameters (Query String / Body)

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| param_name | string | ✅ | - | What it does | `"example"` |
| optional_param | number | ❌ | `10` | Optional param | `20` |

#### Request Example
\`\`\`bash
curl -X GET "https://api.example.com/endpoint?param=value" \\
  -H "Content-Type: application/json"
\`\`\`

#### Response Structure
\`\`\`typescript
interface APIResponse {
  data: {
    items: Item[]
    metadata: Metadata
  }
  status: 'success' | 'error'
}
\`\`\`

#### Response Example
\`\`\`json
{
  "data": {
    "items": [...]
  },
  "status": "success"
}
\`\`\`

#### Error Responses
| Status | Code | Description | Action |
|--------|------|-------------|--------|
| 400 | BAD_REQUEST | Invalid parameters | Validate input |
| 401 | UNAUTHORIZED | Missing auth | Add token |
| 404 | NOT_FOUND | Resource not found | Check ID |
| 500 | SERVER_ERROR | Server error | Retry or contact support |

#### Rate Limiting
- Limit: X requests per Y seconds
- Header: `X-RateLimit-Remaining`
- Retry-After: [seconds]

#### Implementation Example
\`\`\`typescript
// src/services/example-api.ts
export async function fetchData(params: Params): Promise<Response> {
  const url = buildURL(params)
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new APIError(response.status, await response.text())
  }

  return response.json()
}
\`\`\`

#### Gaps vs PRD

| PRD Requirement | API Provides | Status | Action |
|-----------------|--------------|--------|--------|
| User profile | ✅ | Complete | Use as-is |
| Detailed analytics | ❌ | **MISSING** | 🔴 Request from backend team |
| Filtering by date | 🟡 | Partial (only month) | 🟡 Request day-level filtering |

#### Notes
- [Any quirks, gotchas, or important notes]
- [Link to Swagger documentation]
- [Link to Confluence page]
\`\`\`

---

## Real Example: MODO Rewards API

### Rewards Search - `/api/rewards/slots`

#### Endpoint Base
```
GET https://promoshub.modo.com.ar/api/rewards/slots
```

#### Authentication
- Method: None (public endpoint)
- Note: Some parameters (user_id) used for personalization but not required

#### Headers
| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| Content-Type | ❌ | application/json | Optional |

#### Parameters (Query String)

| Parameter | Type | Required | Default | Description | Example |
|-----------|------|----------|---------|-------------|---------|
| `slots` | string | ❌ | `app-modo-home-carrousel_principal,...` | Comma-separated slot IDs | `"app-modo-destacados-1"` |
| `banks` | string | ❌ | [UUID list] | Comma-separated bank UUIDs | `"167504f6-..."` |
| `limit` | number | ❌ | `10` | Results per page (max: 20) | `15` |
| `page` | number | ❌ | `1` | Page number (1-indexed) | `2` |
| `search_text` | string | ❌ | `""` | Search query | `"supermercado"` |
| `search_ia` | boolean | ❌ | `false` | Enable AI hints | `true` |
| `slot_info` | boolean | ❌ | `false` | Include slot metadata | `true` |
| `fcalcstatus` | string | ❌ | `""` | Filter by status | `"running"` |
| `fflow` | string | ❌ | `""` | Filter by flow | `"online"` or `"offline"` |

**Reference**: Full parameter list in `src/shared/services/promos-api.ts:53-76`

#### Request Example
```bash
curl "https://promoshub.modo.com.ar/api/rewards/slots?\
slots=app-modo-destacados-1&\
search_text=cafe&\
limit=5&\
search_ia=true"
```

#### Response Structure
```typescript
interface SearchIAResponse {
  data: {
    cards: PromotionCard[]           // Main results
    search_ia?: {                    // AI-powered features
      hint_ai?: string               // AI-generated hint
      search_id?: string             // For pagination
      similar_cards?: PromotionCard[] // Recommendations
    }
  }
  metadata: {
    pagination: {
      page: number
      total_pages: number
      total_results: number
      limit: number
    }
  }
}

interface PromotionCard {
  promo_id: string
  title: string
  merchant_name: string
  flow?: 'online' | 'offline'
  content?: {
    row?: Array<{text: string}>
    image?: {primary_image?: string}
    tag_extras?: Array<{label?: string}>
  }
  // See full type in src/types/promotion.ts
}
```

#### Response Example
```json
{
  "data": {
    "cards": [
      {
        "promo_id": "ABC123",
        "title": "30% de reintegro en Starbucks",
        "merchant_name": "Starbucks",
        "flow": "offline",
        "content": {
          "row": [
            {"text": "Starbucks"},
            {"text": "30% de reintegro"}
          ],
          "image": {
            "primary_image": "https://..."
          }
        }
      }
    ],
    "search_ia": {
      "hint_ai": "Encontré 5 promociones de cafeterías...",
      "search_id": "search_abc123"
    }
  },
  "metadata": {
    "pagination": {
      "page": 1,
      "total_pages": 3,
      "total_results": 25,
      "limit": 10
    }
  }
}
```

#### Error Responses
| Status | Description | Action |
|--------|-------------|--------|
| 500 | Server error | Retry with exponential backoff |
| 503 | Service unavailable | Use mock data fallback |

#### Rate Limiting
- No explicit rate limiting observed
- Consider client-side caching (5 minutes TTL)

#### Implementation
**File**: [src/shared/services/promos-api.ts](../../../modo-chatgpt-app/src/shared/services/promos-api.ts)

```typescript
export async function searchPromotionsIA(
  params: SearchIAParams
): Promise<SearchIAResponse> {
  const queryString = buildSearchParams(params)
  const url = `${API_BASE_URL}/slots?${queryString}`

  const response = await fetch(url, {
    method: 'GET',
    headers: { 'Content-Type': 'application/json' }
  })

  if (!response.ok) {
    throw new Error(`Error ${response.status}`)
  }

  return response.json()
}
```

#### Gaps vs PRD

| PRD Requirement | API Provides | Status | Action |
|-----------------|--------------|--------|--------|
| Search promotions | ✅ `/api/rewards/slots` | Complete | Use with `search_text` |
| AI hints | ✅ `search_ia=true` | Complete | Already using |
| List all promotions | ✅ Empty `search_text` | Complete | - |
| **Promotion details** | ❌ No `/api/rewards/promo/{id}` | **CRITICAL GAP** | 🔴 Request endpoint from backend |
| **Bank list** | 🟡 Hardcoded UUIDs | Partial | 🟡 Request `/api/banks` endpoint |
| **Categories list** | 🟡 Hardcoded in frontend | Partial | 🟡 Request `/api/categories` endpoint |

**Fields Missing in Response**:
- `tope_reintegro` (refund cap)
- `monto_minimo` (minimum purchase)
- `dias_aplica` (applicable days: L M X J V S D)
- `bancos_adheridos` (participating banks with logos)
- `medios_pago` (payment methods: VISA, MC, etc.)

**Conclusion**: `/api/rewards/slots` covers search well, but **detail view requires new endpoint** or enriching current response.

#### Next Steps
1. ✅ Use current endpoint for search/list
2. 🔴 Request backend team to create `/api/rewards/promo/{id}` endpoint
3. 🟡 Meanwhile, use available data from `content` field
4. Document limitation in UI: "Some details not available yet"

#### Related Swagger
- **URL**: https://promoshub.modo.com.ar/swagger (TODO: Add actual URL)
- **Confluence**: [Rewards API Documentation](https://modo.atlassian.net/wiki/...) (TODO: Add link)

---

## Tips for Good API Documentation

### 1. Always Include Examples

Real request/response examples are invaluable. Copy-paste from actual API calls.

### 2. Document Quirks

APIs have quirks. Document them:
- "Parameter `user_id` is ignored if `banks` is empty"
- "Empty `search_text` returns all promotions"
- "Maximum `limit` is 20, higher values are clamped"

### 3. Link to Source Code

Reference the file that implements the API call:
```markdown
**Implementation**: [src/services/api.ts:42](src/services/api.ts#L42)
```

### 4. Show Default Values

Default values are often undocumented. Test and document:
```markdown
| Parameter | Default | Notes |
|-----------|---------|-------|
| limit | 10 | Max: 20, tested with 100 → returns 20 |
```

### 5. Document Gaps Prominently

Use visual indicators:
- 🔴 **CRITICAL GAP** - Blocks functionality
- 🟡 **Partial** - Works but incomplete
- ✅ **Complete** - Fully implemented

### 6. Include TypeScript Interfaces

Types document better than prose:
```typescript
interface CreateUserRequest {
  name: string              // Full name, required
  email: string             // Valid email, unique
  role?: 'admin' | 'user'   // Optional, defaults to 'user'
}
```

### 7. Cross-Reference PRD

Always compare API with PRD requirements:
```markdown
**PRD Section 4.2 requires**: User should see promo details
**API provides**: Only summary data
**Gap**: Need `/promo/{id}` endpoint for full details
```

### 8. Mention Alternatives

If endpoint missing, suggest workarounds:
```markdown
**Gap**: No `/api/banks` endpoint
**Workaround**: Hardcode bank list (see `src/constants/banks.ts`)
**TODO**: Request dynamic endpoint from backend team
```

---

## Checklist for API Documentation

Before considering API documentation complete:

- [ ] Endpoint URL (full, not relative)
- [ ] HTTP method
- [ ] Authentication method
- [ ] All parameters (query + body)
- [ ] Required vs optional (with defaults)
- [ ] Parameter types (TypeScript interfaces)
- [ ] Request example (curl or code)
- [ ] Response structure (TypeScript interface)
- [ ] Response example (real JSON)
- [ ] Error responses (status codes + meanings)
- [ ] Rate limiting (if applicable)
- [ ] Implementation example (code snippet)
- [ ] Gaps vs PRD (table with actions)
- [ ] Link to Swagger/Confluence
- [ ] Link to source code implementation
- [ ] Notes on quirks/gotchas

If any checklist item is unknown:
- Note as "TODO: [Item] - Ask [Team]"
- Don't skip documentation
