# Epic 2 – In-Platform POS & Cash Reconciliation
Deliver real-time sales capture, tendering, and daily reconciliation so pharmacists rely solely on PharmaSaaS for register operations—barcode scanning in, cash counts out.

## Story 2.1 In-Store Sales Capture with Barcode Scanning
As a cashier, I want to ring up items by scanning barcodes or searching products, so that every sale is recorded accurately in the platform.

### Acceptance Criteria
1. POS screen supports USB/wedge scanners with debounce and audible/visual confirmation of each scan.
2. Manual product search (name, SKU) works as fallback and supports quick-add favorites.
3. Line items display price, quantity adjustments, discounts, and allow cancellation with audit trail.
4. Offline-safe buffer queues transactions if connectivity drops and syncs once online.
5. Unit tests cover scan events, manual lookup, and error handling.

## Story 2.2 Payment Tendering & Receipt Generation
As a cashier, I want to collect payment and issue receipts, so that the platform maintains an accurate register state.

### Acceptance Criteria
1. Checkout flow supports multiple tenders (cash, card, mobile wallets, credit), split payments, and change calculation.
2. Digital receipts (PDF/email) generated in French with pharmacy branding placeholders; printable version available.
3. Cash drawer opening amount and running cash balance tracked per shift.
4. Role permissions ensure refunds and voids require manager confirmation; all actions logged.
5. Integration test verifies tender calculation and receipt output.

## Story 2.3 Cash Drawer Session Management
As an owner, I want to track cash sessions (opening float, drops, payouts), so that end-of-day counts have full context.

### Acceptance Criteria
1. Shift management UI lets staff start/end sessions, record opening cash, drops, payouts, and notes.
2. API stores session events linked to user, timestamp, and terminal/device ID.
3. Dashboard widget shows current drawer balance vs. expected based on sales and adjustments.
4. Unauthorized session closure attempts blocked; audit entries created for all events.

## Story 2.4 Discrepancy Detection & Guided Resolution
As an owner, I want automated variance detection with guided adjustments, so discrepancies are resolved quickly.

### Acceptance Criteria
1. System compares expected cash (from sessions and tenders) with counted cash; thresholds configurable.
2. Resolution assistant suggests likely causes and supports adjustments requiring approval.
3. Every adjustment records reason, approver, and links back to source transactions.
4. Automated tests cover match, minor variance, and major variance paths.

## Story 2.5 Day-End Close & Reconciliation Reporting
As a pharmacist, I want to close the day with a signed-off report, so I can satisfy regulatory and operational requirements.

### Acceptance Criteria
1. Close workflow captures final cash count, confirms variances addressed, and requires owner signature.
2. Generates reconciliation summary (sales, payments, adjustments, final cash) stored and downloadable as PDF/CSV.
3. Dashboard status flips to “Closed” with timestamp; next-day session auto-initialized with configurable opening float reminder.
4. Alerts triggered if close not completed by cutoff or variances remain unresolved; monitoring ensures alert job health.
