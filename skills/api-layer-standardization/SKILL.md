---
name: api-layer-standardization
description: Standardize the API layer with consistent patterns for data fetching, error handling, and caching. Use when creating or modifying API calls and services.
---

# API Layer Standardization

## When to Use
- Manual invoke when creating/modifying API services

## Current State (Fragmented)
4 separate API locations:
1. `src/services/` - banks, bankpromos (2 JS files)
2. `src/promotions/services/` - Promotions API (JS)
3. `src/promotionsTS/services/` - Newer promotions API (TS)
4. `src/stores/actions/` - Store fetch actions

## HTTP Client
- **Axios 1.6.0** with `x-auth-application` header interceptor
- **Native fetch** in some older utilities
- **SWR** for some hook-based data fetching

## Target Architecture
```
src/api/
  client.ts           # Axios instance + interceptors
  promotions/
    promotions.api.ts  # Endpoints
    promotions.types.ts # Request/response types
  stores/
  merchants/
```

## Data Fetching Decision Matrix
| Use Case | Pattern |
|----------|---------|
| Server state (lists, detail) | SWR/TanStack Query |
| Client mutations | Redux Toolkit async thunks |
| Form submissions | Direct API call |

## Rules
- All new API calls use unified client
- Every endpoint has typed request/response interfaces
- Consistent error handling pattern
- No direct `fetch()` calls for API endpoints
