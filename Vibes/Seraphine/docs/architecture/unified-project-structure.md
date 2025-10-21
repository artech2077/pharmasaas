# Unified Project Structure

```plaintext
pharmasaas/
├── .github/
│   └── workflows/
│       ├── ci.yml
│       └── deploy.yml
├── apps/
│   ├── web/
│   │   ├── src/
│   │   │   ├── app/
│   │   │   ├── components/
│   │   │   ├── features/
│   │   │   ├── providers/
│   │   │   ├── lib/
│   │   │   └── styles/
│   │   ├── public/
│   │   ├── tests/
│   │   └── package.json
│   ├── ops-console/
│   │   ├── src/
│   │   └── package.json
│   └── forecast-worker/
│       ├── src/
│       │   ├── jobs/
│       │   ├── pipelines/
│       │   └── utils/
│       ├── pyproject.toml
│       └── Dockerfile
├── packages/
│   ├── domain/
│   │   ├── src/
│   │   │   ├── reconciliation/
│   │   │   ├── inventory/
│   │   │   ├── forecasting/
│   │   │   └── shared/
│   │   └── package.json
│   ├── db/
│   │   ├── schema/
│   │   ├── migrations/
│   │   ├── repositories/
│   │   └── package.json
│   ├── ui/
│   │   ├── src/
│   │   │   ├── components/
│   │   │   └── theme/
│   │   └── package.json
│   ├── clients/
│   │   ├── rest.ts
│   │   ├── convex.ts
│   │   └── package.json
│   └── config/
│       ├── env/
│       ├── eslint/
│       ├── typescript/
│       └── package.json
├── convex/
│   ├── functions/
│   ├── schema.ts
│   └── auth.ts
├── infra/
│   ├── terraform/
│   │   ├── envs/
│   │   │   ├── staging/
│   │   │   └── prod/
│   │   └── modules/
│   └── terragrunt.hcl
├── scripts/
│   ├── seed-db.ts
│   ├── sync-translations.ts
│   └── check-audit-chain.ts
├── docs/
│   ├── prd.md
│   ├── front-end-spec.md
│   └── architecture.md
├── .env.example
├── package.json
├── pnpm-workspace.yaml
├── turbo.json
└── README.md
```

**Rationale**
- Trade-offs: Monorepo layout keeps app-specific code isolated while allowing packages to expose shared business logic and UI primitives. Optional ops console remains dormant until needed, ensuring limited overhead today.
- Assumptions: Forecast worker owned by Python-focused tooling; Terraform directory handles multi-env provisioning.

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
