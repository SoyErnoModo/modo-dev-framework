---
name: sonar-best-practices
description: "SonarQube/SonarCloud best practices for JavaScript, TypeScript, and React. Auto-invocable skill that applies security, maintainability, and code quality rules when writing or reviewing JS/TS code. Use proactively when: (1) Writing JavaScript/TypeScript code, (2) Creating React components, (3) Reviewing code for security issues, (4) Fixing code smells. Triggers: Automatically apply these rules when writing JS/TS/React code. No explicit invocation needed."
autoInvoke: true
---

# SonarQube Best Practices for JavaScript/TypeScript/React

Comprehensive rule set covering all common SonarQube/SonarCloud issues encountered in React + Next.js projects.

---

## 1. SECURITY RULES (Critical / Hotspot)

### S5765: Use `noopener` with `window.open()`

```typescript
// BAD
window.open("https://example.com", "_blank");

// GOOD
window.open("https://example.com", "_blank", "noopener");
```

### S5131: Use `rel="noopener noreferrer"` on external links

```tsx
// BAD
<a href="https://example.com" target="_blank">Link</a>

// GOOD
<a href="https://example.com" target="_blank" rel="noopener noreferrer">Link</a>
```

### S2245: No `Math.random()` for security purposes

```typescript
// BAD
const token = Math.random().toString(36);

// GOOD
const token = crypto.randomUUID();
```

### S5829: `postMessage` must use specific target origin

**Severity**: Critical (Security Hotspot)

Never use `"*"` as the target origin in `postMessage`. Always specify the exact expected origin.

```typescript
// BAD — Any window can receive the message
iframe.contentWindow.postMessage(data, '*');
window.parent.postMessage(data, '*');

// GOOD — Only the intended origin receives the message
const TARGET_ORIGIN = 'https://example.com';
iframe.contentWindow.postMessage(data, TARGET_ORIGIN);
window.parent.postMessage(data, TARGET_ORIGIN);
```

If the target origin is dynamic, compute it from a trusted source (env var, config):

```typescript
function getTargetOrigin(): string {
  const url = new URL(process.env.NEXT_PUBLIC_IFRAME_URL);
  return url.origin;
}
```

---

## 2. REACT COMPONENT RULES

### react/prop-types: All props must be validated

**Severity**: Major (Code Smell)

Every destructured prop in a `.jsx` component **must** have a corresponding PropTypes entry. For `.tsx` files, use TypeScript interfaces instead.

#### JSX files — use PropTypes

```jsx
import PropTypes from 'prop-types';

function UserCard({ name, age, onSelect }) {
  return <div onClick={onSelect}>{name}, {age}</div>;
}

UserCard.propTypes = {
  name: PropTypes.string.isRequired,
  age: PropTypes.number,
  onSelect: PropTypes.func,
};
```

**Common PropTypes mappings:**

| JS type | PropTypes |
|---------|-----------|
| string | `PropTypes.string` |
| number | `PropTypes.number` |
| boolean | `PropTypes.bool` |
| function | `PropTypes.func` |
| array | `PropTypes.array` or `PropTypes.arrayOf(...)` |
| object | `PropTypes.object` or `PropTypes.shape({...})` |
| React node | `PropTypes.node` |
| React element | `PropTypes.element` |

**For `React.forwardRef` components**, set propTypes on the variable:

```jsx
const MyInput = React.forwardRef(({ label, value, onChange }, ref) => (
  <label>{label}<input ref={ref} value={value} onChange={onChange} /></label>
));

MyInput.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.string,
  onChange: PropTypes.func,
};
```

**Nested prop access** (e.g. `promos.length`) also needs validation — the parent prop must be declared:

```jsx
// If you access promos.length, promos must be in propTypes
Component.propTypes = {
  promos: PropTypes.array, // covers promos.length access
};
```

#### TSX files — use TypeScript interfaces with Readonly

```tsx
interface UserCardProps {
  readonly name: string;
  readonly age?: number;
  readonly onSelect?: () => void;
}

function UserCard({ name, age, onSelect }: Readonly<UserCardProps>) { ... }
```

### S6606: Mark component props as read-only

```typescript
// BAD
interface Props { title: string; }

// GOOD — Readonly wrapper
function Component({ title }: Readonly<Props>) { ... }

// GOOD — Individual readonly fields
interface Props { readonly title: string; }
```

### S6774: Avoid leaked render values in JSX

```tsx
// BAD — renders "0" when count is 0
{count && <Component />}

// GOOD
{count > 0 && <Component />}
{Boolean(count) && <Component />}
{count ? <Component /> : null}
```

### S6827: Anchors must have a valid `href`

**Severity**: Major (Accessibility)

SonarQube's static analysis cannot detect runtime `href` injection (e.g., from Next.js `<Link passHref>`). Use plain `<a>` tags when the `href` is known at build time.

```tsx
// BAD — SonarQube cannot verify href is passed at runtime
<Link href="/about" passHref>
  <a className="link">About</a>
</Link>

// GOOD — href is statically visible
<a href="/about" className="link">About</a>

// GOOD — For client-side navigation with Next.js 13+ (App Router)
<Link href="/about" className="link">About</Link>
```

**When to use plain `<a>` vs `<Link>`**: In Next.js 12 (Pages Router), if the page is statically generated (ISR/SSG), plain `<a>` tags work fine for internal links that don't need client-side transitions.

---

## 3. CODE QUALITY RULES

### S3358: No nested ternary expressions

**Severity**: Major (Code Smell)

Extract nested ternaries into IIFEs, helper functions, or if/else blocks.

```typescript
// BAD
const url = page <= 1 ? null : page === 2 ? '/blog' : `/blog?pagina=${page - 1}`;

// GOOD — IIFE
const url = (() => {
  if (page <= 1) return null;
  if (page === 2) return '/blog';
  return `/blog?pagina=${page - 1}`;
})();

// GOOD — Helper function
function getPageUrl(page: number): string | null {
  if (page <= 1) return null;
  if (page === 2) return '/blog';
  return `/blog?pagina=${page - 1}`;
}
```

### S1751: Prefer positive conditions (avoid negated conditions)

```typescript
// BAD
result !== 1 ? 's' : ''

// GOOD
result === 1 ? '' : 's'
```

### S6582: Prefer optional chaining

```typescript
// BAD
obj && obj.property
obj && obj.method()
arr && arr.map(fn)

// GOOD
obj?.property
obj?.method()
arr?.map(fn)
```

### S6849: Ambiguous spacing in JSX

**Severity**: Minor (Code Smell)

Whitespace between JSX elements that looks intentional but isn't explicit causes rendering ambiguity.

```tsx
// BAD — ambiguous space before text
<button>Click</button> text after

// GOOD — explicit JSX expression for the space or punctuation
<button>Click</button>{' '}text after
<button>Click</button>{'.'}

// BAD — ambiguous space between elements
<span>&larr;</span> Back

// GOOD
<span>&larr;</span>{' '}Back
```

### S6478: Move function definitions outside component render

**Severity**: Minor (Code Smell)

Functions that don't depend on component state/props should be at module scope. This avoids recreating them on every render.

```tsx
// BAD — defined inside component, recreated on each render
function BlogPagination({ currentPage, totalPages }) {
  function getPageHref(page) {
    return page === 1 ? '/blog' : `/blog?pagina=${page}`;
  }
  return <a href={getPageHref(currentPage)}>...</a>;
}

// GOOD — at module scope
function getPageHref(page) {
  return page === 1 ? '/blog' : `/blog?pagina=${page}`;
}

function BlogPagination({ currentPage, totalPages }) {
  return <a href={getPageHref(currentPage)}>...</a>;
}
```

### S6594: Prefer `RegExp.exec()` over `String.match()`

```typescript
// BAD
const result = value.match(/(\d+(\.\d+)?)/);

// GOOD
const result = /(\d+(\.\d+)?)/.exec(value);
```

### S1481 / S1128: Remove unused variables and imports

```typescript
// Remove any variable or import that is not referenced in the code.
// No exceptions — unused code is dead code.
```

### S106: No `console.log` in production

Use a logging library or ESLint disable comments if intentional.

---

## 4. NODE.JS / MODULE RULES

### S6756: Use `node:` protocol for Node.js built-in imports

**Severity**: Minor (Code Smell)

```typescript
// BAD
import fs from 'fs';
import path from 'path';

// GOOD
import fs from 'node:fs';
import path from 'node:path';
```

---

## 5. DEPRECATED API RULES

### S1874: Do not use deprecated functions or APIs

**Severity**: Major (Code Smell)

When a function or API is marked `@deprecated`, do NOT import or call it. Instead:

1. **Check the deprecation message** for the recommended replacement
2. **Inline the logic** if the replacement is simple
3. **Import the underlying constants/utilities** the deprecated function used

```jsx
// BAD — deprecated function
import { getPlatformForAmplitude } from '../../utils/deprecated';
const platform = getPlatformForAmplitude(isWebView, isMobile);

// GOOD — inline with the underlying constants
import { PLATFORMS } from '../../constants/metrics/promotions/utils';

function getPlatform(isWebView, isMobile) {
  if (!isMobile) return PLATFORMS.WEB;
  if (isWebView) return PLATFORMS.WEBVIEW;
  return PLATFORMS.MOBILE;
}
```

### Deprecated HTML attributes

```tsx
// BAD — frameBorder is deprecated
<iframe frameBorder="0" src="..." />

// GOOD — use CSS style
<iframe style={{ border: 'none' }} src="..." />
```

---

## 6. PORTABILITY RULES

### S6759: Prefer `globalThis` over `window`

```typescript
// BAD
window.location.href = '/home';

// GOOD
globalThis.location.href = '/home';
```

---

## 7. HTTP / REDIRECT RULES

### S5732: Use 307/308 redirects (method-preserving)

```typescript
// BAD — POST may become GET
return NextResponse.redirect(url, 301);

// GOOD
return NextResponse.redirect(url, 308); // Permanent
return NextResponse.redirect(url, 307); // Temporary
```

---

## 8. ASYNC / PROMISE RULES

### S6544: No floating promises

```typescript
// BAD
fetchData();

// GOOD
await fetchData();
void fetchData(); // explicitly ignored
```

### S6571: No `async` without `await`

```typescript
// BAD
async function getData() { return data; }

// GOOD
function getData() { return data; }
```

---

## 9. COMPLEXITY RULES

### S3776: Reduce cognitive complexity

Break deeply nested or branching logic into helper functions. Aim for < 15 cognitive complexity per function.

```typescript
// BAD — deeply nested conditions
function process(data) {
  if (data) {
    if (data.items) {
      for (const item of data.items) {
        if (item.active) { ... }
      }
    }
  }
}

// GOOD — early returns + extraction
function process(data) {
  if (!data?.items) return;
  data.items.filter(item => item.active).forEach(processItem);
}
```

---

## 10. MODERN JS/TS STYLE RULES

### S7741: Compare with `undefined` directly

```typescript
// BAD
if (typeof globalThis.window === 'undefined') { ... }

// GOOD
if (globalThis.window === undefined) { ... }
```

### S7764: Prefer `globalThis` over `window`

```typescript
// BAD
window.location.href
window.addEventListener(...)

// GOOD
globalThis.location.href
globalThis.addEventListener(...)
```

### S7765: Use `.includes()` instead of `.some()` for value checks

```typescript
// BAD
const found = arr.some(x => x === value);
['a', 'b'].some(v => v === input);

// GOOD
const found = arr.includes(value);
['a', 'b'].includes(input);
```

### S7776: Use `Set` with `.has()` for existence checks on constant arrays

```typescript
// BAD
const SAFE_PROTOCOLS = ['https:', 'data:'];
if (SAFE_PROTOCOLS.includes(protocol)) { ... }

// GOOD
const SAFE_PROTOCOLS = new Set(['https:', 'data:']);
if (SAFE_PROTOCOLS.has(protocol)) { ... }
```

### S7781: Prefer `String#replaceAll()` over `String#replace()` with global regex

```typescript
// BAD
str.replace(/&/g, '&amp;');

// GOOD
str.replaceAll('&', '&amp;');
```

### S7735: Avoid negated conditions in ternaries

```tsx
// BAD
{!showApps ? <Fallback /> : <Main />}

// GOOD
{showApps ? <Main /> : <Fallback />}
```

### S6479: Do not use Array index as React key

```tsx
// BAD
{items.map((item, index) => <Item key={index} />)}

// GOOD — use a stable identifier
{items.map(item => <Item key={item.id} />)}

// ACCEPTABLE — when no stable id exists, combine with a distinguishing field
{items.map((item, index) => <Item key={`${item.type}-${index}`} />)}
```

---

## 11. PROJECT STRUCTURE RULES

### Never place test files inside `src/pages/`

Next.js treats every file in `src/pages/` as a route. Test files (`.test.tsx`, `.test.jsx`) placed there will cause build failures (`jest is not defined`).

```
// BAD
src/pages/ayuda/preguntas-frecuentes.test.tsx  ← Next.js tries to compile as a page

// GOOD
src/pages-tests/ayuda/preguntas-frecuentes.test.tsx  ← separate directory for page tests
```

Import the page component from the test using a relative path back to `src/pages/`:

```typescript
import FaqsPage from '../../pages/ayuda/preguntas-frecuentes';
```

---

## 12. TESTING RULES

### S2699: Tests must include assertions

```typescript
// BAD
it('should work', () => {
  const result = calculate(1, 2);
});

// GOOD
it('should work', () => {
  expect(calculate(1, 2)).toBe(3);
});
```

---

## Quick Reference Checklist

When writing or reviewing JS/TS/React code, verify:

| # | Rule | Check |
|---|------|-------|
| 1 | **PropTypes** (JSX) | Every destructured prop has a PropTypes entry |
| 2 | **Readonly** (TSX) | Props interface uses `Readonly<>` or `readonly` fields |
| 3 | **No nested ternary** | Max 1 level of ternary — extract to IIFE/function |
| 4 | **Optional chaining** | `obj?.prop` instead of `obj && obj.prop` |
| 5 | **Positive conditions** | `x === 1 ? A : B` not `x !== 1 ? B : A` |
| 6 | **Anchor href** | Every `<a>` has a statically visible `href` |
| 7 | **postMessage origin** | Never use `'*'` — always specific origin |
| 8 | **noopener** | `window.open()` with `"noopener"`, links with `rel="noopener noreferrer"` |
| 9 | **Module-scope fn** | Pure functions outside component body |
| 10 | **node: prefix** | `import fs from 'node:fs'` |
| 11 | **RegExp.exec()** | Not `String.match()` |
| 12 | **No deprecated** | Check for `@deprecated` tags before importing |
| 13 | **JSX spacing** | Use `{' '}` or `{'.'}` for explicit whitespace/punctuation |
| 14 | **Unused code** | Remove dead variables and imports |
| 15 | **Promise handling** | `await`, `.then()`, or `void` — never floating |
| 16 | **307/308 redirects** | Not 301/302 |
| 17 | **`=== undefined`** | Not `typeof x === 'undefined'` |
| 18 | **`globalThis`** | Not `window` |
| 19 | **`.includes()`** | Not `.some(x => x === val)` |
| 20 | **`Set` + `.has()`** | For constant lookup arrays |
| 21 | **`.replaceAll()`** | Not `.replace(/x/g, ...)` |
| 22 | **Positive ternaries** | `cond ? A : B` not `!cond ? B : A` |
| 23 | **Stable keys** | No array index as React key |
| 24 | **No tests in pages/** | Use `src/pages-tests/` for page test files |
