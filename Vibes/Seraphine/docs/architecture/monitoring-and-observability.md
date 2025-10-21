# Monitoring and Observability

- **Frontend Monitoring:** Sentry browser SDK with release health; Vercel Analytics for Web Vitals; Convex client hooks send heartbeat metrics to Better Stack.
- **Backend Monitoring:** Sentry Node SDK across API routes; Convex logs forward to Better Stack; Railway worker emits Prometheus metrics scraped by Better Stack.
- **Error Tracking:** Sentry projects per environment with Slack alerts on new issue; Clerk anomaly webhooks routed to PagerDuty if repeated failures.
- **Performance Monitoring:** Better Stack dashboards for Neon latency, Redis throughput, Convex function duration; synthetic Playwright run hourly via GitHub cron to catch regressions.

**Frontend Metrics:**
- Core Web Vitals (LCP ≤ 2.5s, FID ≤ 100ms, CLS ≤ 0.1)
- JS error rate per 1k sessions
- API latency (via browser tracing) per key workflow
- Reconciliation completion funnel with drop-off points

**Backend Metrics:**
- Request rate/error rate per endpoint
- p95/p99 latency for reconciliation & inventory APIs
- Database slow query count (>200 ms)
- Forecast job duration and freshness age

**Rationale**
- Trade-offs: Combining Sentry + Better Stack keeps costs low while achieving needed visibility; synthetic checks cover pharmacy open hours. Forecast freshness metric helps detect stalled data pipelines.
- Assumptions: Better Stack integrations available for Neon/Convex; confirm contractual DPAs for EU data.

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
