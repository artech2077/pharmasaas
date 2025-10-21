# Epic 3 – Inventory Catalog & Supplier Management
Establish a trustworthy product catalog with batch/expiry tracking and supplier operations so stock levels stay accurate and reorder decisions are grounded.

## Story 3.1 Product Master Data & Barcode Registry
As an owner, I want to maintain a canonical catalog with barcode mappings, so scanned sales tie back to correct items.

### Acceptance Criteria
1. Catalog CRUD UI/API handles name, SKU, barcode, unit conversions, pricing tiers, and tax codes.
2. Supports composite items (preparations) with ingredient breakdown.
3. Bulk import (CSV) with validation and error reporting; duplicate barcode detection prevents conflicts.
4. Audit log tracks every field change with user and timestamp.

## Story 3.2 Batch & Expiry Tracking
As inventory staff, I want to record batches with expiry, so we prevent selling expired meds.

### Acceptance Criteria
1. Inventory entries store batch number, manufacture/expiry dates, lot quantity, and supplier source.
2. UI surfaces soon-to-expire alerts and restricts sales of expired batches.
3. Background job emails owners when SKUs fall within configurable expiry window.
4. Tests cover FIFO depletion of batches during sales.

## Story 3.3 Supplier Directory & Purchase Terms
As an owner, I want a supplier management module, so I can track terms, contacts, and pricing agreements.

### Acceptance Criteria
1. Supplier profiles capture contact info, payment terms, preferred currency, and discount rules.
2. Catalog items link to suppliers with cost tiers and lead times.
3. Role-based access ensures only authorized users edit supplier data.
4. Integration tests validate supplier-item associations.

## Story 3.4 Purchase Order Lifecycle
As inventory staff, I want to raise, receive, and reconcile purchase orders, so on-hand stock remains accurate.

### Acceptance Criteria
1. PO workflow covers draft → sent → partially received → closed, with PDF export/email.
2. Receiving screen logs delivered quantities, backorders, and mismatches; updates inventory levels automatically.
3. Credit notes recorded when returns or invoice adjustments occur; linked to reconciled payouts.
4. Acceptance tests simulate full PO lifecycle including partial deliveries.

## Story 3.5 Stock Adjustments & Reconciliation Hook
As an owner, I want inventory adjustments to sync with cash reconciliation, so shrinkage and write-offs are accounted for.

### Acceptance Criteria
1. Adjustment types (damage, theft, count variance) recorded with reason, approval, and optional attachment.
2. Adjustments update stock levels immediately and feed into daily reconciliation variance explanations.
3. Dashboard shows net stock change per day with source breakdown.
4. Tests confirm adjustments appear in reconciliation assistant and audit trail.
