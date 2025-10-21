# Human & Agent Responsibilities

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
