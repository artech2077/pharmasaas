# Branch Protections & Required Checks

## Protected Branches

- `main` — all changes flow through PRs; direct pushes are blocked.

## Required Status Checks

The following checks must pass before merge. Names match the GitHub Actions jobs in `.github/workflows/ci.yml`.

1. `Lint, Typecheck, and Test`
2. `Build and Publish Artifacts`

## Review & Approval Rules

- Minimum of **two approvals** per PR: one Architect reviewer and one QA/Domain DRI.
- Dismiss stale reviews when new commits are pushed.
- Require conversations to be resolved before merging.

## Branching & Naming

- Short-lived feature branches use the format `feature/{ticket-id}-{slug}`.
- Release hotfixes use `hotfix/{date}-{summary}`.
- Automation and dependency bumps use `chore/deps-{package}`.

## Required Secrets for CI

| Secret | Purpose | Where Used |
| --- | --- | --- |
| `TURBO_TOKEN` | Enables remote caching for Turborepo builds | Referenced in workflow environment |
| `VERCEL_TOKEN` | Deploy previews + production via Vercel CLI | Required for future deployment jobs |
| `CONVEX_DEPLOY_KEY` | Authenticates Convex deploy hooks | Future pipeline extension |
| `RAILWAY_TOKEN` | Publishes Python worker images | Future pipeline extension |

Store all secrets at the repository level in GitHub and mirror them into the organization-wide secret store when possible.

## CI Environment Variables

Set the following variables (or secrets) within GitHub Actions for consistent builds:

- `VERCEL_PROJECT_ID`
- `CONVEX_DEPLOYMENT`
- `RAILWAY_PROJECT_ID`
- `NODE_ENV=production`

Document additional environment variables in `@pharmasaas/config` when new services are added.
