# MODO Architectural Patterns

Common patterns and best practices for MODO projects.

## UI Component Patterns

### Pattern: Wrapper Components for UI Library

**When**: Using `@playsistemico/modo-sdk-web-ui-lib` components

**Why**: Adapt UI lib components to project-specific needs while maintaining consistency

**Example**:
```typescript
// src/features/promotions/PromotionCard.tsx
import { HubCardPromo } from '@playsistemico/modo-sdk-web-ui-lib'

interface PromotionCardProps {
  promo: PromotionCard
  variant?: 'vertical' | 'horizontal'
}

export function PromotionCard({ promo, variant = 'horizontal' }: PromotionCardProps) {
  // Adapt data to HubCardPromo props
  const where = promo.merchant_name
  const benefit = promo.content?.row?.[1]?.text || ''
  const src = promo.content?.image?.primary_image
  const isOnline = promo.flow === 'online'

  return (
    <HubCardPromo
      where={where}
      benefit={benefit}
      src={src}
      isOnline={isOnline}
      layout={variant}
    />
  )
}
```

**Benefits**:
- Reuse official components
- Type safety with project types
- Easy to update when UI lib changes

---

### Pattern: Remote Config for Design Tokens

**When**: Styling components

**Why**: Centralized design system, easy theming, consistency

**Implementation**:
```typescript
// src/shared/components/RemoteConfig.tsx
const MODO_DESIGN_SYSTEM_STYLES = `
  --color-default: #008859;
  --color-yellow-default: #FFC738;
  --spacing-md: 12px;
  --radius-small: 12px;
`

export default function RemoteConfig({ children }) {
  return (
    <>
      <style>{`:root { ${MODO_DESIGN_SYSTEM_STYLES} }`}</style>
      {children}
    </>
  )
}
```

**Usage**:
```tsx
// ✅ Correct
<div className="bg-[var(--color-default)] p-[var(--spacing-md)]">

// ❌ Incorrect
<div className="bg-[#008859] p-3">
```

---

## API Integration Patterns

### Pattern: Centralized API Service

**When**: Multiple components need same API

**Why**: DRY, caching, error handling in one place

**Structure**:
```
src/shared/services/
├── api-base.ts          # Base fetch wrapper with auth
├── promos-api.ts        # Promotions API methods
├── auth-api.ts          # Authentication API
└── banks-api.ts         # Banks API
```

**Example**:
```typescript
// src/shared/services/promos-api.ts
const API_BASE_URL = 'https://promoshub.modo.com.ar/api/rewards'

export async function searchPromotions(params: SearchParams) {
  const queryString = buildSearchParams(params)
  const url = `${API_BASE_URL}/slots?${queryString}`

  const response = await fetch(url)
  if (!response.ok) throw new Error(`API Error: ${response.status}`)

  return response.json()
}
```

---

### Pattern: Type-Safe API Parameters

**When**: Documenting API endpoints

**Why**: Compile-time validation, IDE autocomplete, documentation

**Example**:
```typescript
// src/types/api.ts
export interface SearchPromotionsParams {
  search_text: string
  limit?: number              // Optional with default
  page?: number
  banks?: string[]            // Array converted to comma-separated
  search_ia?: boolean         // Enable AI hints
}

// src/services/promos-api.ts
export async function searchPromotions(
  params: SearchPromotionsParams
): Promise<SearchPromotionsResponse> {
  // Implementation
}
```

---

## MCP Server Patterns

### Pattern: Dual Transport Support

**When**: Building MCP servers for ChatGPT

**Why**: Development (stdio) + Production (HTTP)

**Structure**:
```
server/
├── mcp-server.ts          # Stdio transport (development)
├── mcp-http-server.ts     # HTTP/SSE transport (production)
└── shared/
    ├── tools.ts           # Tool definitions (shared)
    └── handlers.ts        # Tool handlers (shared)
```

**Benefit**: Same logic, different transports

---

### Pattern: Tool with Metadata

**When**: Defining MCP tools for ChatGPT

**Why**: OpenAI-specific features (widgets, templates)

**Example**:
```typescript
{
  name: 'search_modo_promotions',
  description: 'Busca promociones en MODO',
  inputSchema: {
    type: 'object',
    properties: {
      query: { type: 'string' }
    },
    required: ['query']
  },
  metadata: {
    'openai/outputTemplate': 'html',
    'openai/widgetAccessible': true
  }
}
```

---

## State Management Patterns

### Pattern: Context + widgetSessionId

**When**: ChatGPT widget needs persistent state

**Why**: Sync state between ChatGPT sessions

**Example**:
```typescript
// src/shared/context/AppContext.tsx
export function AppProvider({ children }) {
  const { widgetSessionId } = useOpenAI()

  // Load state from session
  useEffect(() => {
    if (widgetSessionId) {
      const state = window.openai.getWidgetState()
      // Restore state
    }
  }, [widgetSessionId])

  // Save state on changes
  const saveState = useCallback((newState) => {
    if (window.openai) {
      window.openai.setWidgetState(newState)
    }
  }, [])

  return (
    <AppContext.Provider value={{ state, saveState }}>
      {children}
    </AppContext.Provider>
  )
}
```

---

## Error Handling Patterns

### Pattern: Fallback to Mock Data

**When**: API unavailable in development

**Why**: Unblocked development

**Example**:
```typescript
export async function searchPromotions(params: SearchParams) {
  try {
    return await searchPromotionsAPI(params)
  } catch (error) {
    console.warn('API unavailable, using mock data:', error)
    return getMockSearchResponse(params.search_text)
  }
}
```

---

## Testing Patterns

### Pattern: Test with Real API Responses

**When**: Writing tests for API integration

**Why**: Catch API changes early

**Example**:
```typescript
// tests/fixtures/api-responses.ts
export const REAL_PROMO_RESPONSE = {
  // Copy-paste actual API response
  data: {
    cards: [/* ... */]
  }
}

// tests/promos-api.test.ts
it('should parse real API response', () => {
  const result = parsePromotions(REAL_PROMO_RESPONSE)
  expect(result).toBeDefined()
})
```

---

## Deployment Patterns

### Pattern: Cloudflare Tunnel for Development

**When**: Testing ChatGPT integration locally

**Why**: Expose local server to ChatGPT without deploy

**Script**:
```bash
# scripts/dev-tunnel.sh
cloudflared tunnel --url http://localhost:3001
```

**Benefit**: Instant public URL for testing

---

## Documentation Patterns

### Pattern: Inline API Documentation

**When**: Complex API with many parameters

**Why**: Developers understand without leaving code

**Example**:
```typescript
/**
 * Busca promociones en MODO.
 *
 * @param params.search_text - Texto de búsqueda (ej: "supermercado")
 * @param params.limit - Cantidad de resultados (default: 10, max: 20)
 * @param params.search_ia - Habilitar hints de IA (default: true)
 *
 * @returns Promociones + hint_ai + similar_cards
 *
 * @example
 * const results = await searchPromotions({
 *   search_text: 'cafe',
 *   limit: 5,
 *   search_ia: true
 * })
 */
export async function searchPromotions(params: SearchParams) {
  // ...
}
```

---

## Anti-Patterns (Avoid)

### ❌ Hardcoding Design Tokens

```tsx
// ❌ BAD
<div className="bg-[#008859]">

// ✅ GOOD
<div className="bg-[var(--color-default)]">
```

### ❌ Creating Components Without Checking UI Library

```tsx
// ❌ BAD: Custom component without checking lib
export function PromoCard() {
  return <div className="...">...</div>
}

// ✅ GOOD: Use UI library
import { HubCardPromo } from '@playsistemico/modo-sdk-web-ui-lib'
```

### ❌ Inventing API Endpoints

```typescript
// ❌ BAD: Assuming endpoint exists
const response = await fetch('/api/promo-details/123')

// ✅ GOOD: Document gap, use what exists
// TODO: API endpoint /api/promo-details/{id} doesn't exist
// Using /api/rewards/slots with promo_id filter as workaround
```

### ❌ Skipping Swagger Documentation

```markdown
// ❌ BAD
API: GET /api/rewards/slots
Parameters: search_text

// ✅ GOOD
#### Endpoint
GET https://promoshub.modo.com.ar/api/rewards/slots

#### Parameters
| Name | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| search_text | string | ❌ | '' | Query string |
| limit | number | ❌ | 10 | Results per page (max: 20) |
| search_ia | boolean | ❌ | true | Enable AI hints |
```

---

## When to Create New Patterns

Create new patterns when:
1. Same solution applied 3+ times across projects
2. Pattern solves recurring MODO-specific problem
3. Pattern aligns with MODO tech stack and philosophy

Document new patterns in this file with:
- Clear use case
- Example implementation
- Benefits/trade-offs
