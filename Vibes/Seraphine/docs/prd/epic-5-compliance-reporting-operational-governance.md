# Epic 5 – Compliance Reporting & Operational Governance
Guarantee regulatory readiness, security, and operational resilience before scale-up.

## Story 5.1 Financial & VAT Reporting Suite
As an owner, I want one-click compliant reports, so audits are painless.

### Acceptance Criteria
1. Generate daily cash journal, monthly VAT statement, and profit/loss exports in prescribed formats.
2. Reports available in French with required statutory wording.
3. Scheduling enables automatic monthly exports to secure storage; retention policy enforces 10-year archive for financial reports and 5-year archive for customer credit data with anonymization after 3-year sunset.
4. Tests verify totals reconcile with transaction ledger.

## Story 5.2 Audit Logging & Data Retention
As a compliance officer, I want immutable logs, so every action is traceable.

### Acceptance Criteria
1. Every sensitive action written to a tamper-evident log (append-only table with hash chaining).
2. Retention policies documented; archival job moves records older than threshold to cold storage.
3. Admin UI supports filtered audit search by user, event, and date.
4. Security test confirms logs cannot be altered by standard roles.

## Story 5.3 Role-Based Access & Least Privilege
As an owner, I want fine-grained permissions, so staff have exactly the access they need.

### Acceptance Criteria
1. Roles for Owner, Manager, Cashier, and Accountant configurable per tenant.
2. Permission matrix enforced across UI/API with automated tests.
3. Access changes require owner approval and generate notifications.
4. Session timeout and 2FA enforcement configurable.

## Story 5.4 Observability & Incident Response Playbook
As ops lead, I want monitoring and runbooks, so we can meet the 99.9% SLA.

### Acceptance Criteria
1. Metrics dashboards (latency, error rate, job health) published and linked.
2. Alerting thresholds defined with PagerDuty/Slack integration.
3. Incident response playbook documents triage steps and communication templates.
4. Chaos or smoke test run to validate alerts fire correctly.

## Story 5.5 Production Launch Readiness Review
As a product manager, I want a structured go-live checklist, so no compliance gaps remain.

### Acceptance Criteria
1. Launch checklist covers security review, data backups, disaster recovery test, and legal documents.
2. UAT session with pilot pharmacists completed; feedback logged and triaged.
3. Sign-off records stored in docs repo and referenced in PRD change log.
4. Final status meeting scheduled with stakeholders; action items tracked.
