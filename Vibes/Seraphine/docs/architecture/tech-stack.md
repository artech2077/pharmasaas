# Tech Stack
| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Frontend Language | TypeScript | 5.3.x | Shared typing across UI and backend | Prevents runtime errors, allows shared domain types |
| Frontend Framework | Next.js (App Router) | 14.x | UI delivery, API routes, server actions | Tight Vercel integration, hybrid SSR/ISR, streaming |
| UI Component Library | shadcn/ui + Tailwind CSS | Latest | Design system implementation | Matches UX spec, rapid composition, accessible defaults |
| State Management | TanStack Query + Convex client | 5.x | Data fetching, caching, realtime updates | Handles optimistic mutations and offline sync |
| Backend Language | TypeScript | 5.3.x | Domain logic, API routes | Shared language reduces context switching |
| Backend Framework | Lightweight Express-compatible handlers within Next API routes (Hono) | 4.x | Structured service layer | Provides middleware + testing ergonomics |
| API Style | REST + websocket-based realtime | v1 | JSON REST for mutations, Convex live queries for reads | Aligns with PRD workflows and offline support |
| Database | Neon PostgreSQL | 15.x | System-of-record, audit logs | ACID guarantees, EU region, branching for previews |
| Cache | Upstash Redis (serverless) | Latest | Job queues, rate limiting, feature evaluation | Serverless, pay-per-request, native Vercel support |
| File Storage | Cloudflare R2 | Latest | Reports, receipts, ML artifacts | Low-cost, S3-compatible in EU |
| Authentication | Clerk | Latest | Auth, RBAC, session management | Turnkey multi-role auth, compliance features |
| Frontend Testing | Vitest + Testing Library + Storybook | Latest | Component/unit regression | Fast TS-native runner, supports UI regression |
| Backend Testing | Vitest (node) + Supertest | Latest | Service/API testing | Reuses runner, simplifies integration tests |
| E2E Testing | Playwright | 1.43.x | Workflow validation on desktop/tablet | Cross-browser, device emulation |
| Build Tool | Turborepo + pnpm | Latest | Task orchestration | Parallel builds, shared caching |
| Bundler | Vite (Storybook) / Next bundler (RSC) | Latest | Packaging | Default Next bundler + Vite for isolated builds |
| IaC Tool | Terraform + Terragrunt | 1.6.x | Provision multi-vendor resources | Avoids configuration drift |
| CI/CD | GitHub Actions | Latest | Test, lint, deploy pipelines | Integrates with Vercel, Neon, Convex deploy hooks |
| Monitoring | Sentry + Vercel Analytics | Latest | Error tracing, performance insights | Unified front/back monitoring |
| Logging | Better Stack (Logtail) | Latest | Centralized structured logs | Queryable, EU storage |
| CSS Framework | Tailwind CSS | 3.x | Utility-first styling | Pairs with shadcn/ui, responsive-ready |
