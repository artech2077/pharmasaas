# Data Models

## Tenant
**Purpose:** Represents a pharmacy organization (single location) and centralizes configuration such as currency, locale, and retention policies.

**Key Attributes:**
- `id`: `string` – Global tenant identifier used across systems.
- `legalName`: `string` – Registered pharmacy name for reports.
- `locale`: `string` – Locale code (e.g., `fr-MA`) driving translations.
- `timezone`: `string` – Time zone for scheduling, reporting, and audits.
- `retentionPolicy`: `RetentionPolicy` – Structured settings for data/archive durations.

```typescript
export interface Tenant {
  id: string;
  legalName: string;
  locale: 'fr-MA';
  timezone: string;
  cashVarianceThreshold: number;
  retentionPolicy: {
    financialReportsYears: number;
    auditLogYears: number;
    anonymizationDays: number;
  };
  createdAt: string;
  updatedAt: string;
}
```

- User belongs to Tenant (many users per tenant)  
- InventoryItem, CashSession, Report all reference Tenant  
- Tenant has many FeatureFlag overrides and Integrations  

## User
**Purpose:** Authenticated pharmacist, staff, or advisor using the platform with role-based permissions.

**Key Attributes:**
- `id`: `string` – Clerk user id cross-referenced in our system.
- `tenantId`: `string` – Links to Tenant for scoping.
- `role`: `UserRole` – Owner, Manager, Cashier, Accountant, Auditor.
- `status`: `UserStatus` – Active, Suspended, Invited.
- `lastActiveAt`: `string` – ISO timestamp for compliance/audit reporting.

```typescript
export interface User {
  id: string;
  tenantId: string;
  role: 'owner' | 'manager' | 'cashier' | 'accountant' | 'auditor';
  status: 'active' | 'suspended' | 'invited';
  displayName: string;
  email: string;
  phone?: string;
  mfaEnabled: boolean;
  lastActiveAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

- User belongs to Tenant  
- CashSession, CashReconciliation reference User (initiatedBy/approvedBy)  
- AuditLogEntry records User actions  

## CashSession
**Purpose:** Represents a POS operating period (e.g., daily shift) aggregating sales and cash counts for reconciliation.

**Key Attributes:**
- `id`: `string` – Session identifier.
- `tenantId`: `string` – Tenant scope for queries.
- `openedBy`: `string` – User id who opened the session.
- `status`: `CashSessionStatus` – Open, PendingReconciliation, Closed.
- `expectedTotals`: `CashBreakdown` – Computed totals per tender type.

```typescript
export interface CashSession {
  id: string;
  tenantId: string;
  openedBy: string;
  closedBy?: string;
  status: 'open' | 'pending_reconciliation' | 'closed';
  openedAt: string;
  closedAt?: string;
  expectedTotals: CashBreakdown;
  offlineTransactionCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface CashBreakdown {
  madCash: number;
  card: number;
  mobileWallet: number;
  other: number;
}
```

- CashSession aggregates many SalesTransaction records  
- CashReconciliation references the CashSession being reconciled  
- OfflineQueueEntry ties to CashSession during outages  

## CashReconciliation
**Purpose:** Captures the guided reconciliation workflow resolving discrepancies between expected and counted cash.

**Key Attributes:**
- `id`: `string` – Reconciliation identifier.
- `tenantId`: `string` – Tenant scope.
- `cashSessionId`: `string` – Session being reconciled.
- `initiatedBy`: `string` – User starting the reconciliation.
- `status`: `ReconciliationStatus` – Draft, Escalated, Closed.
- `variance`: `number` – MAD difference (positive = over, negative = short).
- `resolutionSteps`: `ReconciliationStep[]` – Ordered steps performed.

```typescript
export interface CashReconciliation {
  id: string;
  tenantId: string;
  cashSessionId: string;
  initiatedBy: string;
  approvedBy?: string;
  status: 'draft' | 'escalated' | 'closed';
  countedTotals: CashBreakdown;
  expectedTotals: CashBreakdown;
  variance: number;
  resolutionSteps: ReconciliationStep[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReconciliationStep {
  id: string;
  type: 'adjustment' | 'transaction_fix' | 'escalation' | 'write_off';
  description: string;
  amountImpact: number;
  performedBy: string;
  performedAt: string;
  metadata?: Record<string, unknown>;
}
```

- CashReconciliation belongs to CashSession  
- Produces AuditLogEntry records per resolution step  
- Can link to ForecastAdjustment when anomalies affect models  

## InventoryItem
**Purpose:** Represents a SKU with pricing, stock status, and regulatory attributes, feeding dashboards and forecasting.

**Key Attributes:**
- `id`: `string` – SKU identifier (internal).
- `tenantId`: `string` – Tenant scope.
- `name`: `string` – Localized name (French primary).
- `category`: `string` – OTC, Prescription, Preparation, etc.
- `currentStock`: `number` – In base units.

```typescript
export interface InventoryItem {
  id: string;
  tenantId: string;
  supplierId?: string;
  name: string;
  frenchLabel: string;
  category: 'otc' | 'rx' | 'preparation' | 'consumable';
  barcode?: string;
  reorderPoint: number;
  reorderQuantity: number;
  unitCost: number;
  retailPrice: number;
  currentStock: number;
  stockStatus: 'healthy' | 'low' | 'critical' | 'out';
  expiryTracked: boolean;
  lastCountedAt?: string;
  createdAt: string;
  updatedAt: string;
}
```

- InventoryItem has many StockBatch records (lot/expiry)  
- Supplier supplies InventoryItem (optional)  
- ForecastSnapshot references InventoryItem demand projections  

## StockBatch
**Purpose:** Tracks batch/lot-level inventory with expiry, supporting compliance and recall actions.

**Key Attributes:**
- `id`: `string` – Batch identifier.
- `inventoryItemId`: `string` – Associated SKU.
- `batchNumber`: `string` – Supplier batch/lot number.
- `expiryDate`: `string` – ISO expiry date.
- `quantityOnHand`: `number` – Remaining units in batch.

```typescript
export interface StockBatch {
  id: string;
  tenantId: string;
  inventoryItemId: string;
  batchNumber: string;
  manufactureDate?: string;
  expiryDate: string;
  quantityOnHand: number;
  reservedQuantity: number;
  receivedAt: string;
  createdAt: string;
  updatedAt: string;
}
```

- StockBatch belongs to InventoryItem  
- PurchaseOrderLine creates StockBatch entries  
- ForecastSnapshot considers earliest expiry for reorder urgency  

## ForecastSnapshot
**Purpose:** Stores daily demand forecasts, confidence bands, and recommended reorder quantities for each SKU.

**Key Attributes:**
- `id`: `string` – Snapshot identifier.
- `inventoryItemId`: `string` – SKU in scope.
- `forecastDate`: `string` – Date of prediction horizon.
- `expectedDemand`: `number` – Units predicted for the horizon window.
- `recommendation`: `ForecastRecommendation` – e.g., reorder amount, hold, investigate.

```typescript
export interface ForecastSnapshot {
  id: string;
  tenantId: string;
  inventoryItemId: string;
  generatedAt: string;
  horizonDays: number;
  expectedDemand: number;
  confidenceLow: number;
  confidenceHigh: number;
  recommendedOrderQty: number;
  rationale: string;
  modelVersion: string;
  createdAt: string;
}
```

- ForecastSnapshot references InventoryItem  
- ForecastFeedback ties to ForecastSnapshot for accuracy loop  
- ReorderRecommendation event consumes ForecastSnapshot  

## SupplierOrder
**Purpose:** Tracks supplier purchase orders from creation through receipt and reconciliation against stock.

**Key Attributes:**
- `id`: `string` – Purchase order id.
- `tenantId`: `string` – Tenant scope.
- `supplierId`: `string` – Supplier reference.
- `status`: `SupplierOrderStatus` – Draft, Submitted, PartiallyReceived, Closed.
- `totalAmount`: `number` – Expected total cost.

```typescript
export interface SupplierOrder {
  id: string;
  tenantId: string;
  supplierId: string;
  status: 'draft' | 'submitted' | 'partially_received' | 'closed' | 'cancelled';
  expectedDeliveryDate?: string;
  totalAmount: number;
  currency: 'MAD';
  createdBy: string;
  lineItems: SupplierOrderLine[];
  createdAt: string;
  updatedAt: string;
}

export interface SupplierOrderLine {
  id: string;
  inventoryItemId: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  batchNumber?: string;
}
```

- SupplierOrder belongs to Tenant and references Supplier  
- Goods receipt creates StockBatch entries and updates InventoryItem stock  
- CashReconciliation may reference SupplierOrder when variance caused by stock intake  

## AuditLogEntry
**Purpose:** Immutable ledger of sensitive actions for compliance (role changes, reconciliations, financial reports).

**Key Attributes:**
- `id`: `string` – Log entry id.
- `tenantId`: `string` – Tenant scope.
- `eventType`: `AuditEventType` – Enum (role_change, reconciliation_closed, report_generated, etc.).
- `performedBy`: `string` – User id or system service.
- `metadata`: `Record<string, unknown>` – Canonical details hashed for tamper evidence.
- `hash`: `string` – Hash chain value linking to previous entries.

```typescript
export interface AuditLogEntry {
  id: string;
  tenantId: string;
  eventType: AuditEventType;
  performedBy: string;
  performedAt: string;
  resourceType: string;
  resourceId: string;
  metadata: Record<string, unknown>;
  previousHash?: string;
  hash: string;
  createdAt: string;
}
```

- AuditLogEntry references User (nullable for system)  
- CashReconciliation, SupplierOrder, Report generation all emit AuditLogEntry  
- Immutable chain validated during compliance checks  
