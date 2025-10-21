# Source Tree Reference

This document describes the expected structure of the PharmaSaaS monorepo so every contributor can quickly locate code, tests, and infrastructure assets. Use it as the source of truth when adding new modules or validating that generated scaffolds match our architecture decisions.

## Root Layout

```plaintext
pharmasaas/
├── .github/                  # CI workflows, composite actions, automation scripts
├── apps/                     # Executable applications (Next.js, admin consoles, workers)
│   ├── web/                  # Primary Next.js App Router app (UI + API routes)
│   ├── ops-console/          # Optional Backoffice console (lazy-loaded workspace)
│   └── forecast-worker/      # Python forecasting worker (Dockerized)
├── packages/                 # Shared TypeScript packages consumed across apps
│   ├── domain/               # Business logic, services, DTOs
│   ├── db/                   # Drizzle schema, migrations, repositories
│   ├── ui/                   # shadcn/ui design system and theme primitives
│   ├── config/               # Environment parsing, feature flags, eslint/ts presets
│   └── clients/              # Typed REST/Convex clients for frontends
├── convex/                   # Convex functions, schema, auth helpers
├── infra/                    # Terraform + Terragrunt infrastructure definition
├── scripts/                  # Operational scripts (seeding, linting, migrations)
├── tests/                    # Cross-app e2e and contract tests (Playwright)
├── docs/                     # Product & architecture documentation
├── package.json              # Root workspace manifest
├── pnpm-workspace.yaml       # Turborepo workspace mapping
├── turbo.json                # Task pipeline configuration
└── .env.example              # Canonical environment variable catalogue
```

## Directory Responsibilities

| Path | Owner | Purpose | Key Notes |
| ---- | ----- | ------- | --------- |
| `.github/workflows/` | Platform Engineering | CI entrypoints (`ci.yml`, `deploy.yml`) | Workflow names must match protected branch checks. |
| `apps/web/` | Frontend + BFF | Next.js App Router UI and `app/api/*` routes | No standalone `apps/api`; API endpoints live here per architecture decision. |
| `apps/ops-console/` | Ops Tooling | Backoffice console surfaced when operations team onboards | Ship as dormant workspace; keep dependencies optional. |
| `apps/forecast-worker/` | Data Science | Python worker for demand forecasting jobs | Uses `pyproject.toml` and Dockerfile for Railway deploy. |
| `packages/domain/` | Domain Guild | Cross-cutting business logic, value objects, domain events | Source of truth for shared types—never duplicate DTOs elsewhere. |
| `packages/db/` | Infra + Backend | Drizzle schema, migrations, repository adapters | Exposes typed query builders to domain layer. |
| `packages/ui/` | Design System | Shared UI primitives built on shadcn/ui + Tailwind | Export-only components; no data fetching. |
| `packages/config/` | Platform Engineering | Zod env schemas, lint/ts configs, shared scripts | Only entrypoint for reading environment variables. |
| `packages/clients/` | Frontend Guild | Typed REST + Convex client wrappers | Frontend must call these instead of raw `fetch` or Convex functions. |
| `convex/` | Realtime Guild | Convex schema, functions, auth integrations | Mirror domain types via `packages/domain`. |
| `infra/` | DevOps | Terraform/Terragrunt modules per environment | Keep environment state segregated under `infra/terraform/envs/*`. |
| `scripts/` | Platform Engineering | Reusable automation (`seed-db`, `sync-translations`) | Prefer TypeScript scripts executed via `tsx`. |
| `tests/` | QA | Top-level Playwright suites, contract tests | Filtered in CI via `pnpm turbo run test:e2e`. |
| `docs/` | Product & Architecture | PRD, architecture shards, runbooks | Keep architecture references in `docs/architecture/*`. |

## apps Workspaces

### `apps/web`
- **Framework:** Next.js (App Router) with pnpm scripts (`dev`, `build`, `lint`, `test`).
- **API Layer:** Server-side routes live under `src/app/api/*`; document this in README to satisfy “apps/api” acceptance criteria without a separate package.
- **Module Layout:**
  ```plaintext
  src/
    app/                # Route segments (public and protected)
      (public)/
      (protected)/
      api/              # REST endpoints mapped to service functions
    components/         # Project-specific components (wrap shared UI primitives)
    features/           # Feature folders (reconciliation, inventory, forecasting)
      <feature>/hooks/  # React Query + Convex hooks
      <feature>/services/ # Calls into packages/domain & packages/clients
    providers/          # Global providers (Convex, QueryClient, Clerk)
    lib/                # Utilities, formatters, auth helpers
    styles/             # Tailwind setup, theme tokens
  tests/
    unit/               # Vitest + Testing Library
    accessibility/      # Axe accessibility checks
    api/                # Supertest integration of API routes
  ```
- **Conventions:** Server components default; mark client components explicitly. Favor feature-first organization over layer-based splits.

### `apps/ops-console`
- **Status:** Optional workspace scaffolded for future operations tooling.
- **Layout:** Mirrors `apps/web` but limited to admin routes; keep dependency surface small and ensure feature toggles gate access.
- **Practices:** Reuse shared UI kit and domain logic. Only load this workspace in CI when `ops-console` tasks are touched (`--filter=ops-console`).

### `apps/forecast-worker`
- **Language:** Python (Poetry via `pyproject.toml`), packaged for Railway deployment.
- **Structure:**
  ```plaintext
  src/
    jobs/               # Scheduled tasks (nightly retraining, cleanup)
    pipelines/          # Feature engineering pipelines
    utils/              # Shared helpers (date math, Convex publishers)
  tests/
    unit/               # Pytest suites
  ```
- **Integration:** Publishes predictions to PostgreSQL and Convex; coordinates with TypeScript packages via generated client stubs checked into `packages/domain`.

## Shared Packages

- `packages/domain`: Houses core domain models, services, and data transfer objects. Only package allowed to depend on `packages/db`. Export barrel files from `src/index.ts`.
- `packages/db`: Provides Drizzle schema definitions, migrations (`migrations/`), seed scripts (`seed/`), and repository implementations. Never import Express/Next code here.
- `packages/ui`: Contains reusable components and design tokens. All components must be framework-agnostic and avoid direct Convex or TanStack Query usage.
- `packages/config`: Centralizes environment configuration (`env/`), TypeScript references (`tsconfig/`), ESLint presets, and shared Husky hooks. Application code must read environment variables via this package.
- `packages/clients`: Offers typed clients for REST and Convex interactions. Frontends consume these helpers instead of instantiating fetch calls directly.

## Supporting Directories

- `convex/`: Mirrors Convex project layout (`functions/`, `schema.ts`, `auth.ts`). All Convex types import from `packages/domain` to ensure consistency.
- `infra/`: Contains Terraform modules (`infra/terraform/modules/*`) and environment overlays (`infra/terraform/envs/staging`, `infra/terraform/envs/prod`). Terragrunt configurations orchestrate deployments; keep secrets out of version control.
- `scripts/`: Automation scripts executed via `pnpm scripts:<name>`; store TypeScript helpers under `scripts/` with descriptive filenames.
- `tests/`: Houses Playwright end-to-end tests and cross-application contract suites. Organize by workflow (`reconciliation.spec.ts`, `inventory.spec.ts`) and ensure artifacts upload in CI.
- `docs/`: Architecture shards live in `docs/architecture`; story documents under `docs/stories`; PRD shards under `docs/prd`. Update `docs/architecture/index.md` when adding new reference documents.

## Conventions and Guardrails

- **Dependency Direction:** `apps/*` → `packages/*` → `packages/domain` → `packages/db`. Never import from an app into a package.
- **Testing Placement:** Unit tests reside within their owning workspace (`apps/*/tests/unit`, `packages/*/__tests__`). E2E tests stay in `tests/`.
- **Code Generation:** Generated clients or types belong alongside their source (e.g., Convex generated types inside `convex/_generated/`). Document generators in `scripts/`.
- **Documentation:** Any deviation from this structure must be captured in an ADR and summarized in this file to keep the tree authoritative.
