# Technical Assumptions

## Repository Structure: Monorepo
Single repository housing `apps/web`, `apps/api`, and shared packages so the 1–2 dev team reuses models, keeps CI/CD simple, and coordinates releases tightly.

## Service Architecture
Modular monolith: Fastify/Express REST API with PostgreSQL as the system of record, real-time collaboration via Convex, and Cloudflare fronting Vercel (web) and Railway/Fly.io (API). Background jobs use BullMQ/Redis for reconciliation summaries and AI refreshes, while a Python service retrains forecasting models and persists outputs back into the core datastore.

## Testing Requirements
Full testing pyramid: unit tests (Jest/Vitest) for UI and services, integration tests using Postgres test containers and Convex stubs, Cypress/Playwright E2E for POS, reconciliation, and report workflows, plus manual exploratory checklists before finance-sensitive releases.

## Additional Technical Assumptions and Requests
- React + TypeScript + Tailwind + shadcn/UI with French localization by default.
- Clerk for authentication and role management; Postgres Row-Level Security for tenant isolation.
- Prisma or Drizzle ORM with migration tooling.
- Offline-first via service worker and IndexedDB caching of recent transactions/inventory.
- Observability with Sentry, OpenTelemetry traces, and Datadog/Logflare dashboards.
- Data retention policy: financial transaction and audit logs retained 10 years; customer credit ledgers 5 years; personally identifiable data anonymized 3 years after account closure.
- Future integrations considered: bank feed ingestion and Moroccan government reporting APIs reserved as integration layer placeholders (post-MVP).
- CI/CD on GitHub Actions with automated migrations and required checks.
- Single staging plus production environments; staging seeded with demo tenant and synthetic data.
- AI forecast service retrains nightly with option for manual trigger from admin UI.
