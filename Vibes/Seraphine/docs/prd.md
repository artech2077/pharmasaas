# PharmaSaaS Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Deliver a unified SaaS that replaces fragmented pharmacy tools with one workflow-centric platform.
- Cut daily cash-reconciliation effort from 2+ hours to under 15 minutes using guided automation.
- Provide real-time profitability and inventory intelligence tailored to Moroccan pharmacies.
- Enable accurate short-term demand forecasting to reduce stockouts and overstock.
- Ensure compliance-ready financial reporting and audit trails from day one.

### Background Context
Moroccan pharmacists juggle separate systems for sales, inventory, and accounting, forcing hours of manual reconciliation and leaving profitability opaque. Generic POS or ERP products miss pharmacy-specific workflows, while disconnected tools introduce errors and stress. PharmaSaaS addresses this by delivering an AI-driven, French-first platform that centralizes operations, automates reconciliation, and offers proactive inventory and cash-flow insights. The MVP prioritizes core reconciliation, profit tracking, and forecasting to prove value quickly within tight budget and timeline constraints.

### Change Log
| Date       | Version | Description               | Author |
|------------|---------|---------------------------|--------|
| 2025-10-20 | 0.1     | Initial PRD draft kickoff | PM     |

## Requirements

### Functional
1. **FR1:** Provide a unified POS and inventory dashboard showing cash position, daily profit, and discrepancy alerts in real time.
2. **FR2:** Automate daily cash reconciliation by ingesting platform-recorded sales, expenses, and cash counts, flagging mismatches, and guiding the pharmacist through resolution steps.
3. **FR3:** Manage inventory catalog (3k–8k SKUs) with supplier pricing, batch/expiry metadata, and support for regulated preparations.
4. **FR4:** Offer AI-driven short-term sales and demand forecasts with confidence bands and translate them into reorder recommendations.
5. **FR5:** Generate compliant financial and tax-ready reports (cash journal, sales summaries, VAT-ready exports) in one click.
6. **FR6:** Track supplier orders end-to-end, including pending deliveries, credit notes, and reconciliation against received stock.
7. **FR7:** Support multi-user access (owner, manager, staff) with role-based permissions for POS actions, reconciliation approvals, and report access.
8. **FR8:** Provide French-language UI across web and mobile-responsive layouts with clear task-driven workflows.

### Non Functional
1. **NFR1:** Ensure data consistency with ACID guarantees and comprehensive audit logging for every financial and inventory transaction.
2. **NFR2:** Encrypt data at rest and in transit to bank-level standards (TLS 1.2+, AES-256).
3. **NFR3:** Achieve 99.9% uptime and sub-2-second initial page load on 3G connections.
4. **NFR4:** Support offline-first usage with automatic sync and conflict resolution when connectivity restores.
5. **NFR5:** Deliver under 500 ms response times for core POS actions and under 5 seconds for report generation.
6. **NFR6:** Provide observability (metrics, structured logs, alerts) adequate for a two-person team to diagnose issues quickly.
7. **NFR7:** Maintain GDPR-equivalent data privacy compliance and Moroccan financial reporting regulations.

## Human & Agent Responsibilities

| Responsibility | Owner (Human) | Supporting Agent Tasks |
| -------------- | ------------- | ---------------------- |
| Vendor & domain onboarding (Clerk, Convex, Neon, Resend, DNS) | Product Ops / Tech Lead (humans) run checklists, purchase domains, manage billing | Agents consume stored credentials only through provided env schemas; never create accounts or manage billing |
| Secrets management & rotation | DevOps Lead updates Doppler/1Password vaults, communicates rotation windows | Agents update `.env.example`, configuration files, and CI secrets references after rotations |
| Financial approvals (large adjustments, refunds, purchase orders) | Pharmacy Owner/Manager approves in app; Support logs exception | Agents enforce approval workflows, log audit entries, and send notifications |
| Regulatory compliance & retention reviews | Compliance Officer schedules annual reviews, signs-off documentation | Agents implement retention jobs, audit logs, and generate compliance reports |
| Support & pilot training | Support Lead delivers training, maintains help center content | Agents integrate in-app tooltips, update links, and ensure localized copy |

**Guiding Principles**
- Agents implement code, tests, and configuration scripts as specified; they never handle payments, purchase tooling, or agree to legal terms.
- Humans provide clarifications, pay invoices, and own irreversible production actions (e.g., DNS cutover, tenant deletions).
- Every story requiring human approval must list the responsible role under “Dependencies” or “Notes” before work begins.

## User Interface Design Goals

### Overall UX Vision
Deliver a calm, data-rich cockpit letting pharmacists assess cash position, profits, and inventory health within seconds. Guided workflows feel like a checklist companion, reducing mental load during reconciliation and ordering. Visual hierarchy spotlights actionable alerts and AI recommendations without overwhelming.

### Key Interaction Paradigms
- Step-by-step reconciliation assistant with progress indicators.
- Contextual drawers/modals for resolving discrepancies and logging adjustments.
- Command palette or quick actions for power users to jump to reports, forecasts, and ordering.
- Inline AI insights (forecast cards, reorder prompts) embedded throughout dashboards and product lists.

### Core Screens and Views
- Secure login and onboarding wizard.
- Daily operations dashboard (cash status, profit, alerts, forecast cards).
- Reconciliation workflow (wizard: cash count → discrepancy resolution → confirmation).
- Inventory and supplier management (catalog table with filters, batch/expiry details, reorder prompts).
- Sales and reports hub (financial reports, exports, compliance documents).
- Settings and team roles (user management, permissions, audit trail access).

### Accessibility: WCAG AA
Contrast ratios ≥ 4.5:1, keyboard navigability, and status messages with textual alternatives.

### Branding
Professional, trustworthy palette (pharmacy greens/blues) with subtle Moroccan cues—tile-inspired accents and typography. MVP assumes no strict brand guide; later phases can add per-pharmacy theming.

### Target Device and Platforms: Web Responsive
Optimized for desktop with responsive layouts for tablets and mobile browsers—critical actions (reconciliation, alerts) remain usable on 7" screens.

## Technical Assumptions

### Repository Structure: Monorepo
Single repository housing `apps/web`, `apps/api`, and shared packages so the 1–2 dev team reuses models, keeps CI/CD simple, and coordinates releases tightly.

### Service Architecture
Modular monolith: Fastify/Express REST API with PostgreSQL as the system of record, real-time collaboration via Convex, and Cloudflare fronting Vercel (web) and Railway/Fly.io (API). Background jobs use BullMQ/Redis for reconciliation summaries and AI refreshes, while a Python service retrains forecasting models and persists outputs back into the core datastore.

### Testing Requirements
Full testing pyramid: unit tests (Jest/Vitest) for UI and services, integration tests using Postgres test containers and Convex stubs, Cypress/Playwright E2E for POS, reconciliation, and report workflows, plus manual exploratory checklists before finance-sensitive releases.

### Additional Technical Assumptions and Requests
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

## Epic List
1. **Epic 1 – Project Foundation & Developer Operations:** Establish monorepo, tooling, auth baseline, and observability so future features land on stable rails.
2. **Epic 2 – In-Platform POS & Cash Reconciliation:** Deliver barcode-based sales capture, tendering, and guided reconciliation entirely within PharmaSaaS.
3. **Epic 3 – Inventory Catalog & Supplier Management:** Maintain accurate stock with batch/expiry tracking and supplier-driven purchase workflows.
4. **Epic 4 – Forecasting & AI Recommendations:** Provide trustworthy demand forecasts and reorder guidance that tie directly into inventory operations.
5. **Epic 5 – Compliance Reporting & Operational Governance:** Ship reporting, permissions, and reliability guardrails required for production readiness.

## Epic 1 – Project Foundation & Developer Operations
Create a stable monorepo with shared tooling, automated pipelines, and baseline auth so future work lands on predictable rails. Ensure environments, observability hooks, and deployment paths exist before any business features ship.

### Story 1.1 Monorepo and CI/CD Bootstrapping
As a developer, I want a monorepo scaffolded with shared linting, testing, and build tooling, so that every service and UI module inherits consistent standards.

#### Acceptance Criteria
1. Repository contains `apps/web`, `apps/api`, and `packages/shared` with TypeScript configs, linting, formatting, and testing presets wired.
2. GitHub Actions (or equivalent) runs lint, unit tests, and type checks on every push/PR.
3. CI artifacts publish for API and web apps with caching configured.
4. Branch protections documented with required checks.

### Story 1.2 Environment Configuration & Secrets Management
As an engineer, I want reproducible environment configuration, so that local, staging, and production deployments use consistent settings.

#### Acceptance Criteria
1. `.env.example` files documented for web, API, and shared packages with secure defaults.
2. Secrets stored via managed vault (e.g., GitHub secrets) and referenced in CI/CD workflows.
3. Infrastructure provisioning scripts create Postgres, Convex, and Clerk tenants.
4. Readme instructions confirm developers can run `npm run dev` (or pnpm) locally end-to-end.

### Story 1.3 Authentication Baseline with Clerk
As an engineer, I want baseline auth implemented, so that the platform enforces secure tenant-aware sessions from the start.

#### Acceptance Criteria
1. Clerk integrates into the web app with French-localized sign-in/up screens.
2. API includes middleware validating Clerk JWTs and binding tenant context.
3. Seed script creates demo tenant and admin user for staging.
4. Unit/integration tests cover auth guard success and failure paths.

### Story 1.4 Design System & UI Shell
As a designer/developer, I want a shared design system and application shell, so that subsequent UI stories can focus on feature logic.

#### Acceptance Criteria
1. Tailwind, shadcn/UI, and design tokens configured in `packages/ui` with base components (nav, sidebar, button, card).
2. Web app renders a responsive shell with placeholder navigation (Dashboard, Reconciliation, Inventory, Reports, Settings).
3. Localization framework initialized with French default strings.
4. Visual smoke test (Storybook or Playwright) confirms layout works at desktop and tablet breakpoints.

### Story 1.5 Observability & Deployment Readiness
As a DevOps owner, I want logging, monitoring, and deployment automation in place, so that future features ship with confidence.

#### Acceptance Criteria
1. Logging library emits structured logs (request ID, tenant) to stdout and Sentry SDK wired for frontend/backend.
2. OpenTelemetry traces exported to the chosen backend with sampling rules documented.
3. Automated deployments configured: staging on merge to `main`, production via manual promotion with database migration step.
4. Health-check endpoint (`/healthz`) responds with app version and service dependencies status.

## Epic 2 – In-Platform POS & Cash Reconciliation
Deliver real-time sales capture, tendering, and daily reconciliation so pharmacists rely solely on PharmaSaaS for register operations—barcode scanning in, cash counts out.

### Story 2.1 In-Store Sales Capture with Barcode Scanning
As a cashier, I want to ring up items by scanning barcodes or searching products, so that every sale is recorded accurately in the platform.

#### Acceptance Criteria
1. POS screen supports USB/wedge scanners with debounce and audible/visual confirmation of each scan.
2. Manual product search (name, SKU) works as fallback and supports quick-add favorites.
3. Line items display price, quantity adjustments, discounts, and allow cancellation with audit trail.
4. Offline-safe buffer queues transactions if connectivity drops and syncs once online.
5. Unit tests cover scan events, manual lookup, and error handling.

### Story 2.2 Payment Tendering & Receipt Generation
As a cashier, I want to collect payment and issue receipts, so that the platform maintains an accurate register state.

#### Acceptance Criteria
1. Checkout flow supports multiple tenders (cash, card, mobile wallets, credit), split payments, and change calculation.
2. Digital receipts (PDF/email) generated in French with pharmacy branding placeholders; printable version available.
3. Cash drawer opening amount and running cash balance tracked per shift.
4. Role permissions ensure refunds and voids require manager confirmation; all actions logged.
5. Integration test verifies tender calculation and receipt output.

### Story 2.3 Cash Drawer Session Management
As an owner, I want to track cash sessions (opening float, drops, payouts), so that end-of-day counts have full context.

#### Acceptance Criteria
1. Shift management UI lets staff start/end sessions, record opening cash, drops, payouts, and notes.
2. API stores session events linked to user, timestamp, and terminal/device ID.
3. Dashboard widget shows current drawer balance vs. expected based on sales and adjustments.
4. Unauthorized session closure attempts blocked; audit entries created for all events.

### Story 2.4 Discrepancy Detection & Guided Resolution
As an owner, I want automated variance detection with guided adjustments, so discrepancies are resolved quickly.

#### Acceptance Criteria
1. System compares expected cash (from sessions and tenders) with counted cash; thresholds configurable.
2. Resolution assistant suggests likely causes and supports adjustments requiring approval.
3. Every adjustment records reason, approver, and links back to source transactions.
4. Automated tests cover match, minor variance, and major variance paths.

### Story 2.5 Day-End Close & Reconciliation Reporting
As a pharmacist, I want to close the day with a signed-off report, so I can satisfy regulatory and operational requirements.

#### Acceptance Criteria
1. Close workflow captures final cash count, confirms variances addressed, and requires owner signature.
2. Generates reconciliation summary (sales, payments, adjustments, final cash) stored and downloadable as PDF/CSV.
3. Dashboard status flips to “Closed” with timestamp; next-day session auto-initialized with configurable opening float reminder.
4. Alerts triggered if close not completed by cutoff or variances remain unresolved; monitoring ensures alert job health.

## Epic 3 – Inventory Catalog & Supplier Management
Establish a trustworthy product catalog with batch/expiry tracking and supplier operations so stock levels stay accurate and reorder decisions are grounded.

### Story 3.1 Product Master Data & Barcode Registry
As an owner, I want to maintain a canonical catalog with barcode mappings, so scanned sales tie back to correct items.

#### Acceptance Criteria
1. Catalog CRUD UI/API handles name, SKU, barcode, unit conversions, pricing tiers, and tax codes.
2. Supports composite items (preparations) with ingredient breakdown.
3. Bulk import (CSV) with validation and error reporting; duplicate barcode detection prevents conflicts.
4. Audit log tracks every field change with user and timestamp.

### Story 3.2 Batch & Expiry Tracking
As inventory staff, I want to record batches with expiry, so we prevent selling expired meds.

#### Acceptance Criteria
1. Inventory entries store batch number, manufacture/expiry dates, lot quantity, and supplier source.
2. UI surfaces soon-to-expire alerts and restricts sales of expired batches.
3. Background job emails owners when SKUs fall within configurable expiry window.
4. Tests cover FIFO depletion of batches during sales.

### Story 3.3 Supplier Directory & Purchase Terms
As an owner, I want a supplier management module, so I can track terms, contacts, and pricing agreements.

#### Acceptance Criteria
1. Supplier profiles capture contact info, payment terms, preferred currency, and discount rules.
2. Catalog items link to suppliers with cost tiers and lead times.
3. Role-based access ensures only authorized users edit supplier data.
4. Integration tests validate supplier-item associations.

### Story 3.4 Purchase Order Lifecycle
As inventory staff, I want to raise, receive, and reconcile purchase orders, so on-hand stock remains accurate.

#### Acceptance Criteria
1. PO workflow covers draft → sent → partially received → closed, with PDF export/email.
2. Receiving screen logs delivered quantities, backorders, and mismatches; updates inventory levels automatically.
3. Credit notes recorded when returns or invoice adjustments occur; linked to reconciled payouts.
4. Acceptance tests simulate full PO lifecycle including partial deliveries.

### Story 3.5 Stock Adjustments & Reconciliation Hook
As an owner, I want inventory adjustments to sync with cash reconciliation, so shrinkage and write-offs are accounted for.

#### Acceptance Criteria
1. Adjustment types (damage, theft, count variance) recorded with reason, approval, and optional attachment.
2. Adjustments update stock levels immediately and feed into daily reconciliation variance explanations.
3. Dashboard shows net stock change per day with source breakdown.
4. Tests confirm adjustments appear in reconciliation assistant and audit trail.

## Epic 4 – Forecasting & AI Recommendations
Deliver trustworthy short-term demand forecasts and actionable reorder guidance that plug directly into inventory operations.

### Story 4.1 Data Foundation for Forecasting
As a data engineer, I want a curated analytics dataset, so forecasting models consume clean, consistent inputs.

#### Acceptance Criteria
1. Nightly ETL aggregates sales, returns, inventory positions, lead times, and promotions into analytics tables.
2. ETL handles gaps, outliers, and seasonal spikes; data-quality dashboard logs row counts, null checks, and variance thresholds.
3. Backfill command seeds six months of historical data; dry-run mode validates without writing.
4. Unit/integration tests confirm sample data transforms correctly and metrics publish to observability stack.

### Story 4.2 Forecast Training Pipeline
As a data scientist, I want automated model training, so forecasts stay current without manual effort.

#### Acceptance Criteria
1. Python service trains per-SKU models using candidate algorithms and selects best based on cross-validation performance.
2. Models versioned with metadata (MAE, MAPE, training window) stored in Postgres/Convex for UI visibility.
3. Failed training runs trigger alerts; fallback uses last successful model.
4. CI job runs unit tests on feature engineering and model code; staging pipeline runs smoke training on anonymized dataset.

### Story 4.3 Forecast Serving API & Storage
As a backend engineer, I want a prediction endpoint, so other services fetch forecasts easily.

#### Acceptance Criteria
1. Endpoint `GET /forecasts?sku&horizon` returns mean, confidence interval, and generation timestamp.
2. Forecast outputs cached in Convex for sub-200 ms retrieval; TTL configurable.
3. Authorization enforces tenant isolation; rate limiting prevents abuse.
4. Integration test hits the API with sample SKU and validates response schema and performance budget.

### Story 4.4 Forecast Visualization in Dashboard
As a pharmacist, I want intuitive forecast cards, so I immediately see expected demand and risk.

#### Acceptance Criteria
1. Dashboard tiles display next-day and 7-day forecasts with sparklines, confidence bands, and textual summary.
2. Inventory list highlights predicted stock-outs with “days remaining” badge and quick filter “At Risk”.
3. Users can adjust horizon (1, 3, 7 days); UI updates without full page reload.
4. Accessibility: ARIA labels, French localization, and responsiveness at tablet breakpoint; UI tests cover states.

### Story 4.5 AI Reorder Recommendations
As an owner, I want reorder suggestions tied to forecasts, so I replenish inventory just in time.

#### Acceptance Criteria
1. Recommendation engine combines forecasted demand, safety stock, lead times, and open purchase orders to produce quantity suggestions.
2. UI surfaces recommendations per SKU with rationale and confidence indicators.
3. One-click action creates draft purchase order pre-filled with suggested quantities; owner can adjust before sending.
4. Overrides require reason capture; accepted or ignored recommendations logged to feed back into analytics.
5. Acceptance tests simulate low-stock scenarios and verify PO draft generation.

### Story 4.6 Forecast Feedback Loop
As product/data, I want user feedback on accuracy, so models improve continually.

#### Acceptance Criteria
1. Users can mark forecasts as inaccurate and provide optional context; submissions stored with SKU and date.
2. Accuracy dashboard shows rolling MAPE, top under/over-performing SKUs, and feedback counts.
3. Retraining pipeline consumes feedback flags to prioritize SKUs for manual review.
4. Tests ensure feedback records flow into analytics tables and surface in the dashboard.

## Epic 5 – Compliance Reporting & Operational Governance
Guarantee regulatory readiness, security, and operational resilience before scale-up.

### Story 5.1 Financial & VAT Reporting Suite
As an owner, I want one-click compliant reports, so audits are painless.

#### Acceptance Criteria
1. Generate daily cash journal, monthly VAT statement, and profit/loss exports in prescribed formats.
2. Reports available in French with required statutory wording.
3. Scheduling enables automatic monthly exports to secure storage; retention policy enforces 10-year archive for financial reports and 5-year archive for customer credit data with anonymization after 3-year sunset.
4. Tests verify totals reconcile with transaction ledger.

### Story 5.2 Audit Logging & Data Retention
As a compliance officer, I want immutable logs, so every action is traceable.

#### Acceptance Criteria
1. Every sensitive action written to a tamper-evident log (append-only table with hash chaining).
2. Retention policies documented; archival job moves records older than threshold to cold storage.
3. Admin UI supports filtered audit search by user, event, and date.
4. Security test confirms logs cannot be altered by standard roles.

### Story 5.3 Role-Based Access & Least Privilege
As an owner, I want fine-grained permissions, so staff have exactly the access they need.

#### Acceptance Criteria
1. Roles for Owner, Manager, Cashier, and Accountant configurable per tenant.
2. Permission matrix enforced across UI/API with automated tests.
3. Access changes require owner approval and generate notifications.
4. Session timeout and 2FA enforcement configurable.

### Story 5.4 Observability & Incident Response Playbook
As ops lead, I want monitoring and runbooks, so we can meet the 99.9% SLA.

#### Acceptance Criteria
1. Metrics dashboards (latency, error rate, job health) published and linked.
2. Alerting thresholds defined with PagerDuty/Slack integration.
3. Incident response playbook documents triage steps and communication templates.
4. Chaos or smoke test run to validate alerts fire correctly.

### Story 5.5 Production Launch Readiness Review
As a product manager, I want a structured go-live checklist, so no compliance gaps remain.

#### Acceptance Criteria
1. Launch checklist covers security review, data backups, disaster recovery test, and legal documents.
2. UAT session with pilot pharmacists completed; feedback logged and triaged.
3. Sign-off records stored in docs repo and referenced in PRD change log.
4. Final status meeting scheduled with stakeholders; action items tracked.

## Checklist Results Report
**Executive Summary**  
- Overall completeness: ~90%; scope feels Just Right for MVP; ready for architecture.  
- Gaps: monitor integration roadmap (bank feeds, government reporting) as future work item.

**Category Statuses**

| Category                         | Status  | Critical Issues |
| -------------------------------- | ------- | --------------- |
| 1. Problem Definition & Context  | PASS    | – |
| 2. MVP Scope Definition          | PASS    | – |
| 3. User Experience Requirements  | PASS    | – |
| 4. Functional Requirements       | PASS    | – |
| 5. Non-Functional Requirements   | PASS    | – |
| 6. Epic & Story Structure        | PASS    | – |
| 7. Technical Guidance            | PASS    | – |
| 8. Cross-Functional Requirements | PASS    | – |
| 9. Clarity & Communication       | PASS    | – |

**Top Issues**  
- Medium: Capture evolving plan for external integrations (bank feeds, Moroccan government reporting) in architecture backlog.

**Recommendations**  
1. Track integration roadmap in architecture backlog once compliance endpoints are defined.  
2. Review retention durations with legal counsel before launch to confirm regulatory alignment.

**Final Decision**  
READY FOR ARCHITECT – PRD is cohesive; minor clarifications can be handled during architecture.

## Next Steps

### UX Expert Prompt
“As ux-expert, create the front-end spec for PharmaSaaS using docs/prd.md. Focus on POS workflow (USB scanning), reconciliation assistant, inventory management, and forecasts dashboard. Highlight guided flows, accessibility (WCAG AA), and French localization expectations.”

### Architect Prompt
“As architect, craft the fullstack architecture for PharmaSaaS using project-brief.md and docs/prd.md. Honor the monorepo + modular monolith plan, Clerk auth, Convex real-time layer, and forecasting pipeline requirements. Call out data model boundaries, offline strategy, and observability stack.”
