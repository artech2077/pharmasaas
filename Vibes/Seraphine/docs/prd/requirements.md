# Requirements

## Functional
1. **FR1:** Provide a unified POS and inventory dashboard showing cash position, daily profit, and discrepancy alerts in real time.
2. **FR2:** Automate daily cash reconciliation by ingesting platform-recorded sales, expenses, and cash counts, flagging mismatches, and guiding the pharmacist through resolution steps.
3. **FR3:** Manage inventory catalog (3k–8k SKUs) with supplier pricing, batch/expiry metadata, and support for regulated preparations.
4. **FR4:** Offer AI-driven short-term sales and demand forecasts with confidence bands and translate them into reorder recommendations.
5. **FR5:** Generate compliant financial and tax-ready reports (cash journal, sales summaries, VAT-ready exports) in one click.
6. **FR6:** Track supplier orders end-to-end, including pending deliveries, credit notes, and reconciliation against received stock.
7. **FR7:** Support multi-user access (owner, manager, staff) with role-based permissions for POS actions, reconciliation approvals, and report access.
8. **FR8:** Provide French-language UI across web and mobile-responsive layouts with clear task-driven workflows.

## Non Functional
1. **NFR1:** Ensure data consistency with ACID guarantees and comprehensive audit logging for every financial and inventory transaction.
2. **NFR2:** Encrypt data at rest and in transit to bank-level standards (TLS 1.2+, AES-256).
3. **NFR3:** Achieve 99.9% uptime and sub-2-second initial page load on 3G connections.
4. **NFR4:** Support offline-first usage with automatic sync and conflict resolution when connectivity restores.
5. **NFR5:** Deliver under 500 ms response times for core POS actions and under 5 seconds for report generation.
6. **NFR6:** Provide observability (metrics, structured logs, alerts) adequate for a two-person team to diagnose issues quickly.
7. **NFR7:** Maintain GDPR-equivalent data privacy compliance and Moroccan financial reporting regulations.
