# Engineering Governance

- **Source Control Workflow:** GitHub Flow with protected `main`; feature branches follow `feature/<scope>` naming. Require two approvals (architect + QA/Domain DRI) and passing lint/test/e2e checks before merge.
- **Release Gates:** Staging auto-deploys on merge. Production promotion demands checklist sign-off, rollback plan confirmation, and validation that related feature flags exist for graceful disablement.
- **Decision Records:** Capture significant architectural or vendor choices in `docs/adr/ADR-<yyyy-mm-dd>-<slug>.md` (MADR format). Reference ADR IDs in PR descriptions for traceability.
- **Operational Documentation:** Runbooks, postmortems, and SOPs live alongside ADRs; link them from GitHub Issues to keep learnings discoverable.
