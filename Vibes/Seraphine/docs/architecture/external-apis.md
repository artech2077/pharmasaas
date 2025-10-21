# External APIs
- **Clerk API**
  - **Purpose:** Authentication, organization management, MFA enforcement, session validation
  - **Documentation:** https://clerk.com/docs
  - **Base URL(s):** `https://api.clerk.dev`
  - **Authentication:** Backend secret key (Bearer); frontend uses publishable key with JWT handoff
  - **Rate Limits:** 1000 requests/minute per key (soft); monitor via Clerk dashboard
  - **Key Endpoints Used:**
    - `GET /v1/users/{id}` – Retrieve roles after webhook events
    - `POST /v1/organizations/{id}/memberships` – Manage tenant memberships
  - **Integration Notes:** Verify HMAC signatures on webhooks; all role updates flow through backend service to preserve audit trail.

- **Resend API**
  - **Purpose:** Send transactional emails (reconciliation summaries, escalations, report links)
  - **Documentation:** https://resend.com/docs
  - **Base URL(s):** `https://api.resend.com`
  - **Authentication:** API key in `Authorization: Bearer`
  - **Rate Limits:** 600 requests/minute; exponential back-off on 429 responses
  - **Key Endpoints Used:**
    - `POST /emails` – Send localized HTML templates
  - **Integration Notes:** Queue retries through Upstash when Resend throttles; French copy is default locale.

- **Convex Managed Functions**
  - **Purpose:** Realtime queries and mutations powering dashboards and offline replay
  - **Documentation:** https://docs.convex.dev
  - **Base URL(s):** `https://{deployment}.convex.cloud`
  - **Authentication:** Convex token derived from Clerk session (signed JWT)
  - **Rate Limits:** Soft limit ~200 req/sec; monitor usage in Convex console
  - **Key Interfaces:** Generated Convex client methods (`mutation`, `query`)
  - **Integration Notes:** Keep mutations idempotent; configure exponential retries in service worker for offline sync.

No additional third-party APIs required for MVP; bank feeds/government integrations tracked for post-launch.
