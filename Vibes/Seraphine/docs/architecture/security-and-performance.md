# Security and Performance

**Frontend Security:**
- CSP Headers: `default-src 'self'; script-src 'self' https://js.clerk.com https://js.convex.dev; connect-src 'self' https://api.pharmasaas.com https://*.convex.cloud https://api.resend.com; img-src 'self' data: https://res.cloudinary.com; frame-src https://clerk.com`
- XSS Prevention: React auto-escaping, `dompurify` for AI-generated HTML, lint rule forbidding `dangerouslySetInnerHTML`
- Secure Storage: Clerk-managed session cookies (httpOnly, SameSite=Lax); IndexedDB cache encrypted via WebCrypto AES-GCM

**Backend Security:**
- Input Validation: Zod schemas for every handler + Drizzle type-safety
- Rate Limiting: Upstash Redis sliding window per IP/tenant (default 60 req/min, burst 120)
- CORS Policy: Allow staging/production origins explicitly; deny wildcard
- Network Segmentation: Leverage Vercel project-level firewall rules and Neon branch access controls; restrict direct DB access to GitHub Actions + Railway via IP allowlists. All internal traffic forced over TLS 1.3.
- Secret Rotation: Secrets stored in Doppler; automated rotation every 90 days with staged rollout (staging → production). Clerk/Resend keys rotated immediately upon role changes.

**Authentication Security:**
- Token Storage: Clerk session tokens only; short-lived Convex tokens minted per request
- Session Management: 12h lifetime with inactivity timeout; owner role requires 2FA enforced by Clerk
- Password Policy: Clerk policy (min 12 chars, complexity), enforced plus mandatory MFA for finance actions

**Frontend Performance:**
- Bundle Size Target: <350 KB gzipped on dashboard route
- Loading Strategy: React Server Components + Suspense skeletons; defer charts until interaction
- Caching Strategy: TanStack Query SWR + service worker precache for shell assets and offline queue

**Backend Performance:**
- Response Time Target: <500 ms p95 for operational APIs; <5 s for report export
- Database Optimization: Composite indexes on `(tenant_id, status)`, nightly vacuum; materialized views for dashboards refreshed via worker
- Caching Strategy: Redis cache for KPI aggregates (TTL 30s) + Neon read replica for analytics/Metabase
- Backup Encryption: Neon logical dumps encrypted with AES-256 via KMS; R2 backup buckets enforce server-side encryption and strict access policies. Railway worker encrypts model artifacts before upload.

**Rationale**
- Trade-offs: CSP tuned tightly to vendors in use; may require update when adding analytics vendors. Offline encryption adds complexity but satisfies NFR around sensitive financial data stored locally during outages.
- Assumptions: WebCrypto available on target browsers; Upstash plan handles throttle limits for MVP volume.

1. Proceed to next section  
2. Explain Reasoning (CoT Step-by-Step)  
3. Critique and Refine  
4. Assess Alignment with Overall Goals  
5. Identify Potential Risks and Unforeseen Issues  
6. Agile Team Perspective Shift  
7. Stakeholder Round Table  
8. Tree of Thoughts Deep Dive  
9. Challenge from Critical Perspective  

Select 1-9 or share feedback:
