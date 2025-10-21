# Epic 4 – Forecasting & AI Recommendations
Deliver trustworthy short-term demand forecasts and actionable reorder guidance that plug directly into inventory operations.

## Story 4.1 Data Foundation for Forecasting
As a data engineer, I want a curated analytics dataset, so forecasting models consume clean, consistent inputs.

### Acceptance Criteria
1. Nightly ETL aggregates sales, returns, inventory positions, lead times, and promotions into analytics tables.
2. ETL handles gaps, outliers, and seasonal spikes; data-quality dashboard logs row counts, null checks, and variance thresholds.
3. Backfill command seeds six months of historical data; dry-run mode validates without writing.
4. Unit/integration tests confirm sample data transforms correctly and metrics publish to observability stack.

## Story 4.2 Forecast Training Pipeline
As a data scientist, I want automated model training, so forecasts stay current without manual effort.

### Acceptance Criteria
1. Python service trains per-SKU models using candidate algorithms and selects best based on cross-validation performance.
2. Models versioned with metadata (MAE, MAPE, training window) stored in Postgres/Convex for UI visibility.
3. Failed training runs trigger alerts; fallback uses last successful model.
4. CI job runs unit tests on feature engineering and model code; staging pipeline runs smoke training on anonymized dataset.

## Story 4.3 Forecast Serving API & Storage
As a backend engineer, I want a prediction endpoint, so other services fetch forecasts easily.

### Acceptance Criteria
1. Endpoint `GET /forecasts?sku&horizon` returns mean, confidence interval, and generation timestamp.
2. Forecast outputs cached in Convex for sub-200 ms retrieval; TTL configurable.
3. Authorization enforces tenant isolation; rate limiting prevents abuse.
4. Integration test hits the API with sample SKU and validates response schema and performance budget.

## Story 4.4 Forecast Visualization in Dashboard
As a pharmacist, I want intuitive forecast cards, so I immediately see expected demand and risk.

### Acceptance Criteria
1. Dashboard tiles display next-day and 7-day forecasts with sparklines, confidence bands, and textual summary.
2. Inventory list highlights predicted stock-outs with “days remaining” badge and quick filter “At Risk”.
3. Users can adjust horizon (1, 3, 7 days); UI updates without full page reload.
4. Accessibility: ARIA labels, French localization, and responsiveness at tablet breakpoint; UI tests cover states.

## Story 4.5 AI Reorder Recommendations
As an owner, I want reorder suggestions tied to forecasts, so I replenish inventory just in time.

### Acceptance Criteria
1. Recommendation engine combines forecasted demand, safety stock, lead times, and open purchase orders to produce quantity suggestions.
2. UI surfaces recommendations per SKU with rationale and confidence indicators.
3. One-click action creates draft purchase order pre-filled with suggested quantities; owner can adjust before sending.
4. Overrides require reason capture; accepted or ignored recommendations logged to feed back into analytics.
5. Acceptance tests simulate low-stock scenarios and verify PO draft generation.

## Story 4.6 Forecast Feedback Loop
As product/data, I want user feedback on accuracy, so models improve continually.

### Acceptance Criteria
1. Users can mark forecasts as inaccurate and provide optional context; submissions stored with SKU and date.
2. Accuracy dashboard shows rolling MAPE, top under/over-performing SKUs, and feedback counts.
3. Retraining pipeline consumes feedback flags to prioritize SKUs for manual review.
4. Tests ensure feedback records flow into analytics tables and surface in the dashboard.
