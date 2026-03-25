---
title: OWASP Frontend Security
tags: [security, owasp, xss, injection, auth]
---

# OWASP Frontend Security Standards

MODO security rules for frontend applications, aligned with OWASP guidelines.

## Secrets Management

- **No secrets in code** -- API keys, tokens, passwords, and connection strings must never appear in source files.
- Use environment variables via `.env.local` (never committed) and server-side injection.
- Audit for secrets in CI with tools like `gitleaks` or `trufflehog`.

## Dangerous APIs

The following patterns are **banned** in MODO codebases:

- `dangerouslySetInnerHTML` -- only allowed with **DOMPurify sanitization**:
  ```tsx
  import DOMPurify from 'dompurify';
  <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(htmlContent) }} />
  ```
- `eval()` -- never use, no exceptions.
- `document.write()` -- never use, breaks streaming SSR.
- `innerHTML` direct assignment -- use React's rendering model instead.

## Authentication Token Storage

- Store auth tokens in **httpOnly cookies**, never in `localStorage` or `sessionStorage`.
- httpOnly cookies are inaccessible to JavaScript, preventing XSS token theft.
- Set `Secure` flag to ensure cookies are only sent over HTTPS.

## Input Validation

- Validate all inputs on **both client and server** side.
- Use schema validation (Zod, Yup) for API request/response shapes.
- Sanitize user input before rendering or persisting.
- Reject unexpected fields (allowlist approach over denylist).

## Content Security Policy (CSP)

Configure CSP headers to prevent unauthorized script execution:

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https:;
  connect-src 'self' https://api.modo.com.ar;
  frame-ancestors 'none';
```

- Use nonce-based script loading instead of `'unsafe-inline'` for scripts.
- Review and update CSP when adding new third-party integrations.

## XSS Prevention

- React escapes values in JSX by default -- rely on this, do not bypass it.
- Never construct HTML strings manually.
- Sanitize any content from external sources (CMS, user input, APIs) before rendering.
- Use `textContent` instead of `innerHTML` when setting text programmatically.

## CSRF Protection

- Configure cookies with `SameSite=Strict` or `SameSite=Lax` to prevent cross-site request forgery.
- For state-changing operations, use anti-CSRF tokens validated server-side.
- Verify `Origin` and `Referer` headers on sensitive endpoints.

## Additional Measures

- Enable HTTPS everywhere, redirect HTTP to HTTPS.
- Set `X-Content-Type-Options: nosniff` to prevent MIME sniffing.
- Set `X-Frame-Options: DENY` to prevent clickjacking.
- Set `Referrer-Policy: strict-origin-when-cross-origin` to limit referrer leakage.
