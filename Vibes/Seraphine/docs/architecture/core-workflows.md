# Core Workflows
```mermaid
sequenceDiagram
    participant User as Pharmacist
    participant Web as Next.js UI
    participant Convex as Convex Realtime
    participant API as Domain Service Layer
    participant DB as Neon Postgres
    participant Audit as Audit Logger

    User->>Web: Launch reconciliation wizard
    Web->>Convex: Subscribe cashSessionLive(sessionId)
    Convex-->>Web: Stream expected totals & variance
    User->>Web: Enter counted cash
    Web->>API: POST /api/reconciliations {countedTotals}
    API->>DB: Insert reconciliation draft
    API->>Audit: Log reconciliation_started
    API-->>Web: 201 Created
    API-->>Convex: mutation updateReconciliationDraft
    Convex-->>Web: Updated variance & steps
    User->>Web: Add resolution step
    Web->>API: PATCH /api/reconciliations/{id} {step}
    API->>DB: Insert resolution step; update variance
    API->>Audit: Log reconciliation_step
    API-->>Web: 200 OK
    API-->>Convex: mutation pushStep
    Convex-->>Web: Stream new step
    User->>Web: Submit reconciliation
    Web->>API: POST /api/reconciliations/{id} (submit)
    API->>DB: Update status=closed
    API->>Audit: Log reconciliation_closed
    API-->>Web: 202 Accepted
    API-->>Convex: mutation finalizeReconciliation
    Convex-->>Web: status closed, variance 0
```

**Rationale**
- Trade-offs: Treated Convex as external API to highlight auth/usage boundaries; ensures plan factors vendor lock-in mitigation. Sequence diagram focuses on reconciliation since it’s most critical workflow; future diagrams can capture inventory intake once supplier integrations mature. Assumed offline events replay through Convex to avoid exposing raw Postgres externally.
- Assumptions: Clerk webhooks drive role changes, so backend must handle them idempotently. Convex tokens expire quickly; service worker refreshes via `/api/auth/convex-token` endpoint. Resend handles PDF links pointing to R2 objects signed via temporary URLs.
- Validation: Confirm legal review approves EU-hosted Clerk/Resend; ensure pharmacy-specific email templates meet compliance copy before go-live.

1. Proceed to next section  
2. Explain Reasoning (CoT Step-by-Step)  
3. Critique and Refine  
4. Assess Alignment with Overall Goals  
5. Identify Potential Risks and Unforeseen Issues  
6. Agile Team Perspective Shift  
7. Stakeholder Round Table  
8. Tree of Thoughts Deep Dive  
9. Challenge from Critical Perspective  

Select 1-9 or just type your question/feedback:
