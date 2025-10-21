# High Level Architecture

## Technical Summary
- PharmaSaaS runs as a modular monolith fronted by a Next.js App Router application deployed to Vercel. The UI leverages server actions and streaming to hydrate reconciliation dashboards quickly, while API routes in the same app expose a type-safe service layer.
- Core business logic resides in shared domain modules written in TypeScript/Drizzle; they read and write to Neon-hosted PostgreSQL which holds all financial, inventory, and audit records. Cloudflare R2 stores large artifacts (reports, receipts, model files).
- Convex provides realtime synchronization and offline queuing for cash sessions, dashboards, and POS activity. Clients subscribe to live queries so multiple pharmacists see updates instantly.
- A Python worker deployed on Railway ingests transactional events, maintains forecasting feature sets, and retrains demand models nightly; results feed back into Postgres and Convex.
- Clerk powers authentication and role-based access control, wrapping requests via Vercel edge middleware, while Sentry/Better Stack capture observability metrics to satisfy the 99.9% SLA expectation.

## Platform and Infrastructure Choice

**Platform:** Vercel + Neon + Convex + Railway

**Key Services:** Vercel (Next.js, Edge Functions), Neon PostgreSQL (primary database), Convex (realtime sync and optimistic updates), Railway (Python forecasting worker), Cloudflare R2 (object storage), Clerk (auth/RBAC), Upstash Redis (queues & rate limits), Resend (email).

**Deployment Host and Regions:** Vercel FRA1 (primary) with global edge caching; Neon eu-central-1; Convex EU region; Railway eu-west; Cloudflare R2 EU (Frankfurt).

*Options considered:*  
- **AWS Serverless (Amplify + AppSync + Aurora):** single-vendor governance but higher complexity for a small team.  
- **Render/Fly Monolith with custom websockets:** simpler vendor footprint yet lacks managed offline sync and imposes more realtime engineering.

## Repository Structure
**Structure:** Monorepo with shared domain and infrastructure packages.  
**Monorepo Tool:** Turborepo (pnpm workspaces).  
**Package Organization:**
- `apps/web` – Next.js App Router UI + API routes.  
- `apps/forecast-worker` – Python worker (Dockerized) for demand forecasting.  
- `packages/domain` – Financial, inventory, forecasting business logic.  
- `packages/db` – Drizzle schema definitions, SQL migrations, seeding utilities.  
- `packages/ui` – shadcn-based design system shared across apps.  
- `packages/config` – Zod-based environment schema, feature flag helpers.  
- `packages/clients` – Typed service/Convex clients for frontend consumption.  
- `convex/` – Convex functions, schemas, helpers.  
- `infra/` – Terraform modules, state definitions.  
- `scripts/` – Generation, lint, release automation.

### Repository Bootstrap Checklist
- Product or tech lead creates the monorepo using `pnpm create turbo@latest pharmasaas` (or clones the template repo) and immediately runs `pnpm install` to lock dependencies.
- Initialize git history (`git init`, commit the generated scaffold) and push to the chosen GitHub organization/repository following naming convention `pharmasaas/monorepo`.
- Enable branch protections on `main` before inviting collaborators; seed initial `README.md` with setup excerpts below.
- Create shared secret store in Doppler/1Password and grant access to leads responsible for vendor onboarding (see “Third-Party Service Onboarding Runbook”).
- Log bootstrap completion and links to repo/secret vault in `docs/adr/ADR-<date>-project-bootstrap.md` for traceability.

## High Level Architecture Diagram
```mermaid
graph TD
    subgraph Client
        Browser[Pharmacist Browser / Tablet]
        POS[Counter Device]
    end
    Browser --> SW[Service Worker Cache]
    POS --> SW
    SW -->|HTTPS| CDN[Cloudflare CDN]
    CDN --> Next[Vercel Next.js App]
    Next -->|Edge Auth| Clerk[Clerk]
    Next -->|API Routes| ServiceLayer[TypeScript Domain Services]
    Next -->|Live Queries| Convex[Convex Realtime]
    Convex --> Browser
    ServiceLayer -->|SQL| Postgres[(Neon PostgreSQL)]
    ServiceLayer -->|Files| Storage[(Cloudflare R2)]
    ServiceLayer -->|Queues| Redis[(Upstash Redis)]
    ServiceLayer -->|Emails| Resend[Resend]
    ServiceLayer -->|Metrics| Sentry[Sentry/Better Stack]

    subgraph Data & AI
        Worker[Forecast Worker (Python on Railway)]
        FeatureViews[Feature Store Views]
    end
    Worker -->|Write Forecasts| Postgres
    Worker -->|Publish Recommendations| Convex
    Worker -->|Store Artifacts| Storage
    AdminConsole[Ops Console]
    AdminConsole --> Next
```

## Architectural Patterns
- **Hybrid Modular Monolith + BFF:** Next.js API routes act as a backend-for-frontend into modular service packages; scales vertically while keeping latency low and code discoverable.  
- **Server Components + Convex Realtime:** React Server Components stream initial state while Convex drives optimistic updates, ensuring near-instant reconciliation feedback and offline queue replay.  
- **Repository + Service Pattern:** Drizzle repositories encapsulate SQL; domain services orchestrate audit logging and invariants, supporting testability and potential future service extraction.  
- **Event-Sourced Forecasting:** Sales, returns, and stock events feed Redis queues; the Railway worker calculates features and writes ForecastSnapshot records, decoupling ML workloads from request latency.  
- **Defense-in-Depth Security:** Edge middleware validates Clerk tokens, service layer enforces RBAC, and audit log entries chain hashes for tamper evidence, satisfying compliance checkpoints.
