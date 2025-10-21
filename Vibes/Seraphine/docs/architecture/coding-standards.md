# Coding Standards

- **Shared Types First:** Declare domain types in `packages/domain`; never duplicate DTOs in app code.
- **No Direct Fetch:** Frontend must call service functions (`packages/clients`) rather than raw `fetch`/Convex calls.
- **Audit Integrity:** Every reconciliation mutation logs via `AuditLogger`; missing log is blocker.
- **Environment Access:** Only use `@pharmasaas/config/env`; no direct `process.env` in feature code.
- **Async Error Handling:** Wrap all Convex mutations in try/catch with `mapError` helper to ensure friendly UX messages.

| Element | Frontend | Backend | Example |
|---------|----------|---------|---------|
| Components | PascalCase | - | `ReconciliationWizard.tsx` |
| Hooks | camelCase with 'use' | - | `useForecastSnapshot.ts` |
| API Routes | - | kebab-case | `/api/cash-sessions` |
| Database Tables | - | snake_case | `cash_reconciliations` |

**Rationale**
- Trade-offs: Rules focus on failure modes we expect AI contributors to miss (direct fetch, skipping audit logs). Naming alignment keeps repo searchable.
- Assumptions: ESLint custom rules will enforce environment access and audit logging checks.

1. Proceed to next section  
2. Explain Reasoning (CoT Step-by-Step)  
3. Critique and Refine  
4. Assess Alignment with Overall Goals  
5. Identify Potential Risks and Unforeseen Issues  
6. Agile Team Perspective Shift  
7. Stakeholder Round Table  
8. Tree of Thoughts Deep Dive  
9. Challenge from Critical Perspective  

Select 1-9 or share feedback:
