# Dependency & Integration Management

- **Third-Party Service Onboarding Runbook**
  1. Assign an owner for each vendor (default: Product Owner for contracts, Tech Lead for technical setup) and capture in `docs/ops/vendor-owners.md`.
  2. Follow the steps below for every environment (Dev/Staging/Prod) and document completion in the runbook checklist.

  | Service | Owner | Account Creation Steps | API Credentials | Sandbox/Offline Notes |
  | ------- | ----- | ---------------------- | --------------- | --------------------- |
  | Clerk | Tech Lead | Create tenant at https://dashboard.clerk.dev (EU data residency). Configure organization feature and roles (owner/manager/cashier/accountant/auditor). | Generate publishable + secret keys per environment; store in Doppler under `CLERK_*`; share read-only publishable key with frontend devs. | Use Clerk test mode for dev/staging; disable email verifications when running E2E locally. |
  | Convex | Tech Lead | Provision deployment via `npx convex dev --team pharmasaas`. | Deploy key via `convex deploy --create`. Store in Doppler as `CONVEX_DEPLOY_KEY`; add service user to GitHub Actions secret. | Local dev uses `convex dev` with anonymous tokens; document fallback REST polling in outage playbook. |
  | Neon PostgreSQL | DevOps Lead | Create project in EU region, enable PITR, create branches for staging/preview. | Rotate `DATABASE_URL` per environment; restrict access lists to CI + Railway IPs. | For local dev use Neon branch tokens or docker-compose; capture connection strings in `.env.example`. |
  | Upstash Redis | DevOps Lead | Create multi-region queue/ratelimit instances. | Store `REDIS_URL` and `REDIS_TOKEN` in Doppler. | Document CLI usage for draining queues; provide offline mock via in-memory queue util. |
  | Resend | Product Ops | Create organization, verify sending domain (see DNS playbook). | Create API token per environment stored as `RESEND_API_KEY`. | Provide local stub via `packages/clients/resend.mock.ts` to avoid email spam in dev. |
  | Railway (Forecast Worker) | Data Lead | Provision Python service, connect to GitHub repo, configure buildpacks. | Generate `RAILWAY_TOKEN` for CI deployments; scope token to project. | Provide instructions for running worker locally with Poetry (`apps/forecast-worker/README.md`). |
  | Better Stack / PagerDuty | Ops Lead | Create Logtail + Monitoring projects; hook into Slack/PagerDuty. | Store API keys under `BETTERSTACK_*` / `PAGERDUTY_*` secrets. | Offer local `.env` toggles to disable alert webhooks during dev. |

- Update the checklist whenever new vendors are added; ensure ADR captures rationale for additional services.
- **Version Pinning:** All critical vendors (Clerk, Convex, Resend, Neon, Upstash) locked to known-good SDK/API versions via `pnpm overrides` and Terraform provider versions. Monthly dependency review board audits release notes and schedules upgrades in staging.
- **Patching & Security:** Dependabot/Ecosystem bots enabled; security patches triaged within 48h. Maintain vendor contact list and subscribe to status pages/webhooks for proactive alerts.
- **Fallback Strategies:** 
  - Clerk outage → fall back to existing session token cache and switch UI to read-only, prompting manual override codes for owners.
  - Convex outage → queue realtime events in Redis; reconcile via REST pollers when service returns.
  - Resend failures → reroute through backup provider (Mailchannels) using feature flag; ensure transactional emails available in in-app notifications.
  - Neon incident → failover to read replica/promoted branch per recovery playbook; application toggles to degrade-reporting mode until writes restored.
- **License & Compliance:** Track third-party licenses in `docs/licenses.md`; ensure all services offer EU data residency or documented derogations.
- **Sunset Planning:** Quarterly vendor evaluation assesses lock-in risk; maintain abstraction layers (e.g., `packages/clients`) to swap providers with minimal surface change.
