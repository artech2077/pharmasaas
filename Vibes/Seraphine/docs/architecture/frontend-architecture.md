# Frontend Architecture

## Component Architecture

```text
apps/web/
  src/
    app/
      layout.tsx
      page.tsx
      (protected)/
        dashboard/
          page.tsx
        reconciliation/
          [sessionId]/
            page.tsx
            components/
              CashVarianceCard.tsx
              ResolutionStepList.tsx
        inventory/
          page.tsx
          components/
            InventoryTable.tsx
            StockHealthBadge.tsx
    components/
      ui/                # shadcn re-exports with project styling
      charts/
      forms/
      feedback/
    features/
      reconciliation/
        hooks/
          useReconciliation.ts
        components/
          ReconciliationWizard.tsx
        services/
          reconciliation.service.ts
      inventory/
      forecasting/
    providers/
      ConvexProvider.tsx
      QueryClientProvider.tsx
    lib/
      i18n/
      formatters.ts
      auth.ts
    styles/
      globals.css
      theme.ts
```

```typescript
// apps/web/src/features/reconciliation/components/ReconciliationWizard.tsx
'use client';

import { useEffect } from 'react';
import { useConvexLiveQuery } from '@/providers/ConvexProvider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Spinner, Stepper } from '@/components/ui';
import { ReconciliationStepList } from './ResolutionStepList';
import { submitReconciliation } from '../services/reconciliation.service';

type ReconciliationWizardProps = {
  sessionId: string;
};

export function ReconciliationWizard({ sessionId }: ReconciliationWizardProps) {
  const queryClient = useQueryClient();
  const liveSession = useConvexLiveQuery('cashSessionLive', { sessionId });

  const { mutate: finalize, isPending } = useMutation({
    mutationFn: submitReconciliation,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reconciliations', sessionId] });
    },
  });

  useEffect(() => {
    if (!liveSession) return;
    // TODO: handle offline queue hydration
  }, [liveSession]);

  if (!liveSession) return <Spinner label="Chargement..." />;

  return (
    <div className="space-y-6">
      <Stepper steps={liveSession.steps} currentStep={liveSession.status} />
      <ReconciliationStepList steps={liveSession.steps} variance={liveSession.variance} />
      <div className="flex justify-end">
        <button
          className="btn-primary"
          disabled={isPending || liveSession.variance !== 0}
          onClick={() => finalize({ reconciliationId: liveSession.reconciliationId })}
        >
          Valider la clôture
        </button>
      </div>
    </div>
  );
}
```

## State Management Architecture

```typescript
export interface ReconciliationState {
  sessionId: string;
  expectedTotals: CashBreakdown;
  countedTotals: CashBreakdown;
  variance: number;
  steps: ResolutionStep[];
  status: 'draft' | 'escalated' | 'closed';
}

export interface InventoryState {
  items: InventoryItemSummary[];
  filters: { status?: StockStatus; query?: string };
  lastSyncedAt: string;
}

export interface ForecastState {
  snapshots: ForecastSnapshot[];
  horizonDays: number;
  feedbackPending: Record<string, boolean>;
}
```

- Slice state by feature modules (`reconciliation`, `inventory`, `forecasting`) with React Query query caches + Convex live queries.
- Use optimistic updates for reconciliation steps via Convex mutations; rollback on failure using TanStack Query `onError`.
- Persist offline drafts with service worker IndexedDB integration; hydrate into React Query cache on resume.
- Derive global UI state (toasts, dialogs) through lightweight Zustand store to avoid prop drilling.

## Routing Architecture

```text
app/
  (public)/
    sign-in/[[...index]]/page.tsx
  (protected)/
    layout.tsx              # Clerk auth guard + RBAC switch
    dashboard/page.tsx
    reconciliation/
      page.tsx              # list of sessions
      [sessionId]/page.tsx  # wizard details
    inventory/
      layout.tsx            # nested tabs
      page.tsx
      batches/page.tsx
    reports/page.tsx
    settings/
      page.tsx
      team/page.tsx
```

```typescript
// app/(protected)/layout.tsx
import { ClerkProvider } from '@clerk/nextjs';
import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';

export default async function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in');
  if (user.status !== 'active') redirect('/suspended');

  return (
    <ClerkProvider>
      <AppShell role={user.role}>{children}</AppShell>
    </ClerkProvider>
  );
}
```

## Frontend Services Layer

```typescript
// packages/clients/rest.ts
import { z } from 'zod';
import { env } from '@pharmasaas/config/env';

export const apiClient = {
  async get<T>(path: string, schema: z.ZodSchema<T>): Promise<T> {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, { credentials: 'include' });
    if (!res.ok) throw new Error(`GET ${path} failed: ${res.status}`);
    return schema.parse(await res.json());
  },
  async post<T>(path: string, body: unknown, schema: z.ZodSchema<T>): Promise<T> {
    const res = await fetch(`${env.NEXT_PUBLIC_API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!res.ok) throw new Error(`POST ${path} failed: ${res.status}`);
    return schema.parse(await res.json());
  },
};
```

```typescript
// apps/web/src/features/reconciliation/services/reconciliation.service.ts
import { apiClient } from '@pharmasaas/clients/rest';
import { reconciliationSchema } from '@pharmasaas/domain/reconciliation';

export async function loadReconciliation(sessionId: string) {
  return apiClient.get(`/api/reconciliations/${sessionId}`, reconciliationSchema);
}

export async function submitReconciliation(input: { reconciliationId: string }) {
  return apiClient.post(`/api/reconciliations/${input.reconciliationId}`, {}, reconciliationSchema);
}
```

**Rationale**
- Trade-offs: Feature-first folder structure keeps Convex hooks, services, and UI co-located while maintaining separation between shared UI primitives and feature components. Leveraged React Server Components for routing shell but used client boundary for realtime-heavy wizard. Zustand limited to cross-cutting UI state to avoid global context sprawl.
- Assumptions: App Router stable enough for production; Clerk + middleware handles access control before rendering protected routes. Service worker offline persistence will be added during implementation; structure reserves providers/hooks for it.
- Validation: Need UX confirmation for nested reconciliation routes; ensure French translations integrated via `next-intl` (planned in `lib/i18n`). Assess whether additional tooltips/microcopy require separate content layer.

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
