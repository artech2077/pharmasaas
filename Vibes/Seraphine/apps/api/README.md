# @pharmasaas/api

This workspace provides the standalone API surface expected by downstream clients and CI checks. It exposes shared service logic from `packages/domain` via lightweight HTTP handlers so teams can run smoke tests independently of the Next.js App Router implementation.

## Commands

- `pnpm build` – Type-checks and emits compiled JavaScript into `dist/`.
- `pnpm test` – Executes Vitest-powered unit tests for individual handlers.
- `pnpm lint` – Runs ESLint against the TypeScript sources.
- `pnpm typecheck` – Validates the project with the TypeScript compiler without emitting output.

The canonical production routing for REST endpoints still resides in `apps/web` (per the architecture decision), but this workspace ensures the repository satisfies AC1 by providing a dedicated package scaffold that mirrors the API contract and can evolve as services grow.
