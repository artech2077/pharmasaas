# Testing Strategy

```text
E2E Tests
/        \
Integration Tests
/            \
Frontend Unit  Backend Unit
```

```text
Frontend Tests
- apps/web/tests/unit/**/*.{test,spec}.tsx (Vitest + Testing Library)
- apps/web/tests/accessibility/*.test.ts (axe checks)
- Storybook interaction tests via `pnpm turbo run test:stories`
```

```text
Backend Tests
- packages/domain/**/__tests__/*.test.ts (Vitest node)
- apps/web/tests/api/*.test.ts (Supertest against Next server)
- db/tests/**: Drizzle repo tests with Testcontainers Postgres
```

```text
E2E Tests
- tests/e2e/reconciliation.spec.ts
- tests/e2e/inventory-stock.spec.ts
- tests/e2e/reporting-export.spec.ts
- Run on Playwright with desktop + tablet viewport
```

```typescript
// apps/web/tests/unit/ReconciliationWizard.test.tsx
import { render, screen } from '@testing-library/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { ReconciliationWizard } from '@/features/reconciliation/components/ReconciliationWizard';
import { createTestQueryClient } from '../utils/createTestClient';

test('disables validation when variance non-zero', () => {
  const client = createTestQueryClient({
    queryKey: ['convex', 'cashSessionLive'],
    data: { variance: 10, steps: [], status: 'draft', reconciliationId: 'rec_1' },
  });

  render(
    <QueryClientProvider client={client}>
      <ReconciliationWizard sessionId="session_1" />
    </QueryClientProvider>
  );

  expect(screen.getByRole('button', { name: /valider/i })).toBeDisabled();
});
```

```typescript
// packages/domain/reconciliation/__tests__/reconciliation.service.test.ts
import { describe, expect, it } from 'vitest';
import { createReconciliationService } from '../reconciliation.service';
import { InMemoryReconciliationRepo } from './fixtures/inMemoryRepo';

describe('reconciliationService', () => {
  it('calculates variance for new drafts', async () => {
    const repo = new InMemoryReconciliationRepo();
    const service = createReconciliationService({ repo });

    const result = await service.createDraft({
      tenantId: 'tenant_1',
      cashSessionId: 'session_1',
      initiatedBy: 'user_1',
      countedTotals: { madCash: 1000, card: 500, mobileWallet: 200, other: 0 },
      expectedTotals: { madCash: 900, card: 500, mobileWallet: 200, other: 0 },
    });

    expect(result.variance).toBe(100);
    expect(repo.savedDrafts).toHaveLength(1);
  });
});
```

```typescript
// tests/e2e/reconciliation.spec.ts
import { test, expect } from '@playwright/test';

test('pharmacist completes reconciliation path', async ({ page }) => {
  await page.goto('/sign-in');
  await page.fill('input[name=email]', 'owner@example.com');
  await page.fill('input[name=password]', 'Passw0rd!');
  await page.click('button[type=submit]');

  await page.waitForURL('/dashboard');
  await page.click('text=Réconcilier maintenant');
  await page.waitForURL(/reconciliation\/session/);

  await page.fill('input[name=madCash]', '900');
  await page.fill('input[name=card]', '500');
  await page.click('button:has-text("Valider la clôture")');

  await expect(page.locator('[data-test=variance]')).toHaveText('0,00 MAD');
});
```

**Rationale**
- Trade-offs: Unified Vitest tooling for both UI and service tests minimizes context switching; Playwright ensures French copy and responsive targets validated.
- Assumptions: Playwright runs nightly against staging seeded tenant; Chromatic optional for visual regression.
- **Performance & Load Testing:** K6 scenarios simulate peak pharmacy operations (200 transactions/hour, concurrent reconciliation). Synthetic data generator in `scripts/seed-load.ts` populates 10k SKUs to expose DB hotspots. Budget 1 load test per milestone and before onboarding new cohorts. Forecast worker stress tests ensure batch jobs stay under 5 minutes.
