# PharmaSaaS Monorepo

This repository is scaffolded as a Turborepo-managed pnpm workspace that hosts the PharmaSaaS frontend, realtime APIs, shared TypeScript packages, Python ML workers, infrastructure-as-code, and automation scripts.

## Workspace Overview

```
apps/web             # Next.js App Router UI + API routes
apps/api             # Lightweight standalone API scaffold for shared services
apps/forecast-worker # Python forecasting jobs packaged with Poetry
packages/*           # Shared TypeScript packages (domain, db, ui, config, clients)
convex               # Convex realtime functions importing domain types
infra                # Terraform + Terragrunt infrastructure modules and env overlays
scripts              # Operational automation executed via pnpm + tsx
tests                # Cross-workspace end-to-end test harness
```

The dedicated `apps/api` workspace mirrors the REST contract expected by integrators while the production routing continues to live in the Next.js App Router. This keeps the scaffold aligned with acceptance criteria and provides a home for service-level smoke tests.

## Getting Started

1. Install pnpm 8 and Node.js 20.
2. Run `pnpm install` at the workspace root.
3. Execute linting, tests, and type checks through shared scripts:
   - `pnpm lint`
   - `pnpm test` (delegates to each workspace directly to avoid Turbo CLI keychain prompts)
   - `pnpm typecheck`
4. Use `pnpm dev --filter @pharmasaas/web` to start the Next.js app.

Environment variables are parsed via `@pharmasaas/config`. Duplicate domain types in apps are prohibited— import from `@pharmasaas/domain` instead.

## Tooling

- TypeScript project references are configured across packages and apps via `tsconfig.base.json`.
- ESLint, Prettier, and Vitest presets live at the root to ensure consistent linting/testing rules.
- Husky installs a pre-commit hook (run `pnpm prepare`) to enforce linting before pushes.

## Continuous Integration

GitHub Actions workflow `ci.yml` runs linting, testing, and type checks with pnpm + Turborepo caching. It uploads build artifacts for the web workspace and sets the foundation for additional service pipelines.

## Branch Protections

Required status checks:
- `lint`
- `test`
- `typecheck`

Merges to `main` require at least two approvals (Architect + QA/Domain DRI) per engineering governance guidelines.
