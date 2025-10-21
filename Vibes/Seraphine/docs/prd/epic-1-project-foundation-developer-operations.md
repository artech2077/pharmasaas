# Epic 1 – Project Foundation & Developer Operations
Create a stable monorepo with shared tooling, automated pipelines, and baseline auth so future work lands on predictable rails. Ensure environments, observability hooks, and deployment paths exist before any business features ship.

## Story 1.1 Monorepo and CI/CD Bootstrapping
As a developer, I want a monorepo scaffolded with shared linting, testing, and build tooling, so that every service and UI module inherits consistent standards.

### Acceptance Criteria
1. Repository contains `apps/web`, `apps/api`, and `packages/shared` with TypeScript configs, linting, formatting, and testing presets wired.
2. GitHub Actions (or equivalent) runs lint, unit tests, and type checks on every push/PR.
3. CI artifacts publish for API and web apps with caching configured.
4. Branch protections documented with required checks.

## Story 1.2 Environment Configuration & Secrets Management
As an engineer, I want reproducible environment configuration, so that local, staging, and production deployments use consistent settings.

### Acceptance Criteria
1. `.env.example` files documented for web, API, and shared packages with secure defaults.
2. Secrets stored via managed vault (e.g., GitHub secrets) and referenced in CI/CD workflows.
3. Infrastructure provisioning scripts create Postgres, Convex, and Clerk tenants.
4. Readme instructions confirm developers can run `npm run dev` (or pnpm) locally end-to-end.

## Story 1.3 Authentication Baseline with Clerk
As an engineer, I want baseline auth implemented, so that the platform enforces secure tenant-aware sessions from the start.

### Acceptance Criteria
1. Clerk integrates into the web app with French-localized sign-in/up screens.
2. API includes middleware validating Clerk JWTs and binding tenant context.
3. Seed script creates demo tenant and admin user for staging.
4. Unit/integration tests cover auth guard success and failure paths.

## Story 1.4 Design System & UI Shell
As a designer/developer, I want a shared design system and application shell, so that subsequent UI stories can focus on feature logic.

### Acceptance Criteria
1. Tailwind, shadcn/UI, and design tokens configured in `packages/ui` with base components (nav, sidebar, button, card).
2. Web app renders a responsive shell with placeholder navigation (Dashboard, Reconciliation, Inventory, Reports, Settings).
3. Localization framework initialized with French default strings.
4. Visual smoke test (Storybook or Playwright) confirms layout works at desktop and tablet breakpoints.

## Story 1.5 Observability & Deployment Readiness
As a DevOps owner, I want logging, monitoring, and deployment automation in place, so that future features ship with confidence.

### Acceptance Criteria
1. Logging library emits structured logs (request ID, tenant) to stdout and Sentry SDK wired for frontend/backend.
2. OpenTelemetry traces exported to the chosen backend with sampling rules documented.
3. Automated deployments configured: staging on merge to `main`, production via manual promotion with database migration step.
4. Health-check endpoint (`/healthz`) responds with app version and service dependencies status.
