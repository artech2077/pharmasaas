# Database Schema

## Schema Design
```sql
-- Tenants and configuration
create table tenants (
  id uuid primary key,
  legal_name text not null,
  locale text not null default 'fr-MA',
  timezone text not null,
  cash_variance_threshold numeric(12,2) not null default 50,
  retention_financial_years int not null default 10,
  retention_audit_years int not null default 10,
  anonymization_days int not null default 365,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index tenants_timezone_idx on tenants(timezone);

-- Users (Clerk linked)
create table users (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  role text not null check (role in ('owner','manager','cashier','accountant','auditor')),
  status text not null check (status in ('active','suspended','invited')),
  display_name text not null,
  email text not null,
  phone text,
  mfa_enabled boolean not null default false,
  last_active_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index users_tenant_role_idx on users(tenant_id, role);

-- Cash sessions and reconciliation
create table cash_sessions (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  opened_by uuid references users(id),
  closed_by uuid references users(id),
  register_id text not null,
  status text not null check (status in ('open','pending_reconciliation','closed')),
  opened_at timestamptz not null default now(),
  closed_at timestamptz,
  expected_mad_cash numeric(12,2) not null default 0,
  expected_card numeric(12,2) not null default 0,
  expected_mobile_wallet numeric(12,2) not null default 0,
  expected_other numeric(12,2) not null default 0,
  offline_transaction_count int not null default 0
);
create index cash_sessions_tenant_status_idx on cash_sessions(tenant_id, status, opened_at desc);

create table cash_reconciliations (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  cash_session_id uuid references cash_sessions(id) on delete cascade,
  initiated_by uuid references users(id),
  approved_by uuid references users(id),
  status text not null check (status in ('draft','escalated','closed')),
  counted_mad_cash numeric(12,2) not null default 0,
  counted_card numeric(12,2) not null default 0,
  counted_mobile_wallet numeric(12,2) not null default 0,
  counted_other numeric(12,2) not null default 0,
  variance numeric(12,2) not null,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index cash_reconciliations_session_idx on cash_reconciliations(cash_session_id);

create table cash_reconciliation_steps (
  id uuid primary key,
  reconciliation_id uuid references cash_reconciliations(id) on delete cascade,
  type text not null check (type in ('adjustment','transaction_fix','escalation','write_off')),
  description text not null,
  amount_impact numeric(12,2) not null,
  performed_by uuid references users(id),
  performed_at timestamptz not null default now(),
  metadata jsonb
);
create index cash_reconciliation_steps_recon_idx on cash_reconciliation_steps(reconciliation_id);

-- Inventory
create table inventory_items (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  supplier_id uuid,
  name text not null,
  french_label text not null,
  category text not null,
  barcode text,
  reorder_point int not null default 0,
  reorder_quantity int not null default 0,
  unit_cost numeric(12,2) not null,
  retail_price numeric(12,2) not null,
  current_stock int not null default 0,
  stock_status text not null,
  expiry_tracked boolean not null default false,
  last_counted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index inventory_items_tenant_category_idx on inventory_items(tenant_id, category);
create unique index inventory_items_barcode_unique on inventory_items(tenant_id, barcode) where barcode is not null;

create table stock_batches (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id) on delete cascade,
  batch_number text not null,
  manufacture_date date,
  expiry_date date not null,
  quantity_on_hand int not null,
  reserved_quantity int not null default 0,
  received_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index stock_batches_item_expiry_idx on stock_batches(inventory_item_id, expiry_date);

-- Forecasting
create table forecast_snapshots (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id) on delete cascade,
  generated_at timestamptz not null,
  horizon_days int not null,
  expected_demand numeric(12,2) not null,
  confidence_low numeric(12,2) not null,
  confidence_high numeric(12,2) not null,
  recommended_order_qty numeric(12,2) not null,
  rationale text,
  model_version text not null
);
create index forecast_snapshots_item_generated_idx on forecast_snapshots(inventory_item_id, generated_at desc);

-- Supplier orders
create table supplier_orders (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  supplier_id uuid,
  status text not null check (status in ('draft','submitted','partially_received','closed','cancelled')),
  expected_delivery_date date,
  total_amount numeric(12,2) not null,
  currency text not null default 'MAD',
  created_by uuid references users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index supplier_orders_tenant_status_idx on supplier_orders(tenant_id, status);

create table supplier_order_lines (
  id uuid primary key,
  supplier_order_id uuid references supplier_orders(id) on delete cascade,
  inventory_item_id uuid references inventory_items(id),
  quantity_ordered int not null,
  quantity_received int not null default 0,
  unit_cost numeric(12,2) not null,
  batch_number text,
  expiry_date date,
  created_at timestamptz not null default now()
);
create index supplier_order_lines_order_idx on supplier_order_lines(supplier_order_id);

-- Audit log (hash chained)
create table audit_log_entries (
  id uuid primary key,
  tenant_id uuid references tenants(id) on delete cascade,
  event_type text not null,
  performed_by uuid,
  performed_at timestamptz not null default now(),
  resource_type text not null,
  resource_id text not null,
  metadata jsonb not null,
  previous_hash bytea,
  hash bytea not null
);
create index audit_log_entries_tenant_event_idx on audit_log_entries(tenant_id, event_type, performed_at desc);
```

## Data Access Layer
```typescript
// packages/db/repositories/cashReconciliationRepo.ts
import { db } from './client';
import { cashReconciliations, cashReconciliationSteps } from '../schema';
import { eq } from 'drizzle-orm';

export class CashReconciliationRepository {
  async createDraft(payload: {
    id: string;
    tenantId: string;
    cashSessionId: string;
    initiatedBy: string;
    countedTotals: { madCash: number; card: number; mobileWallet: number; other: number };
    variance: number;
  }) {
    await db.insert(cashReconciliations).values({
      id: payload.id,
      tenantId: payload.tenantId,
      cashSessionId: payload.cashSessionId,
      initiatedBy: payload.initiatedBy,
      countedMadCash: payload.countedTotals.madCash,
      countedCard: payload.countedTotals.card,
      countedMobileWallet: payload.countedTotals.mobileWallet,
      countedOther: payload.countedTotals.other,
      variance: payload.variance,
      status: 'draft',
    });
  }

  async appendStep(reconciliationId: string, step: {
    id: string;
    type: 'adjustment' | 'transaction_fix' | 'escalation' | 'write_off';
    description: string;
    amountImpact: number;
    performedBy: string;
    metadata?: Record<string, unknown>;
  }) {
    await db.insert(cashReconciliationSteps).values({
      id: step.id,
      reconciliationId,
      type: step.type,
      description: step.description,
      amountImpact: step.amountImpact,
      performedBy: step.performedBy,
      metadata: step.metadata ?? {},
    });
  }

  async close(reconciliationId: string, approvedBy: string) {
    await db.update(cashReconciliations)
      .set({ status: 'closed', approvedBy, updatedAt: new Date() })
      .where(eq(cashReconciliations.id, reconciliationId));
  }
}
```

## Data Migration & Recovery

- **Initial Migration:** Build import pipelines in `scripts/migrate-legacy/` that transform CSV/Excel exports from incumbent pharmacy tools into the normalized schema. Migrations run through Drizzle seed scripts so every record has audit metadata (source system, import batch). Dry-run command (`pnpm run db:migrate:simulate`) validates referential integrity before committing.
- **Ongoing Backups:** Neon PITR (point-in-time recovery) enabled with 24-hour granularity and daily logical dumps encrypted with KMS-managed keys, stored in Cloudflare R2 replication bucket (`r2://pharmasaas-backups`). R2 itself schedules lifecycle rules for 30-day hot + 365-day cold retention, satisfying compliance durations from the PRD.
- **Recovery Playbook:** Document RTO/RPO targets (RTO ≤ 2h, RPO ≤ 15m). Restoration sequence: pause Convex mutations → restore Neon branch from PITR snapshot → rehydrate R2 artifacts → replay Convex journal if needed → resume traffic after smoke tests.
- **Disaster Drills:** Quarterly chaos exercise spins up staging from backups to ensure scripts remain reliable and that hash-chained audit logs survive restoration.
- **Data Purging:** Implement retention jobs (Railway worker) honoring tenant-specific anonymization days defined on `Tenant.retentionPolicy`, ensuring compliance and keeping storage predictable.

**Rationale**
- Trade-offs: Kept schema normalized for auditability and analytics; avoided storing cash totals as JSON to support aggregate queries. Forecast snapshots separated from transactional writes to minimize lock contention. Supplier orders allow nullable supplier_id pending catalog finalization.
- Assumptions: UUIDs generated via ULIDs; hash chaining performed before insert. Additional tables (sales transactions, reports) will be added in later iterations once POS module is finalized.
- Validation: Confirm supplier catalog shape and whether multi-location pharmacies require store scoping. Review Neon tier to ensure write throughput covers Convex sync volume.

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
