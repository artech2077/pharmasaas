# Development Workflow

## Local Development Setup

```bash
# Prerequisites
brew install pnpm
brew install node@20
brew install python@3.12
brew install redis # optional for queue testing
npm install -g turbo
```

```bash
# Initial Setup
pnpm install
pnpm turbo run lint --filter=...
pnpm run db:generate   # drizzle-kit generate
pnpm run db:migrate    # apply migrations locally
pnpm run convex:login
```

```bash
# Development Commands
# Start all services
pnpm turbo run dev --parallel

# Start frontend only
pnpm turbo run dev --filter=web

# Start forecast worker locally
cd apps/forecast-worker && poetry run python -m pipelines.dev

# Run tests
pnpm turbo run test
pnpm turbo run test --filter=web
pnpm turbo run test --filter=domain
pnpm turbo run test:e2e
```

## Environment Configuration

```bash
# Frontend (.env.local)
NEXT_PUBLIC_API_URL=https://localhost:3000
NEXT_PUBLIC_CONVEX_URL=https://dev.pharmasaas.convex.cloud
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_APP_VERSION=dev

# Backend (Next runtime)
CLERK_SECRET_KEY=
CLERK_PUBLISHABLE_KEY=
DATABASE_URL=postgres://...
REDIS_URL=rediss://...
CONVEX_DEPLOYMENT=
RESEND_API_KEY=

# Shared
FEATURE_FLAG_SDK_KEY=
METABASE_SITE_URL=https://metabase.dev.pharmasaas.com
FORECAST_MODEL_BUCKET=r2://pharmasaas-dev-models
```

**Rationale**
- Trade-offs: pnpm + Turbo accelerate multi-package builds; optional Redis install only needed for integration testing. Convex login command included to align local environment with cloud functions.
- Assumptions: Developers share secrets via 1Password/Doppler; local Postgres provided via Neon branch or docker-compose (not shown).
