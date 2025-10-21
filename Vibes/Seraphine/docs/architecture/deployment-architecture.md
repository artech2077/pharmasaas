# Deployment Architecture

**Frontend Deployment:**
- **Platform:** Vercel (preview + production)
- **Build Command:** `pnpm turbo run build --filter=web`
- **Output Directory:** `.vercel/output`
- **CDN/Edge:** Vercel Edge Network with ISR for marketing routes

**Backend Deployment:**
- **Platform:** Vercel (Next API), Convex (realtime), Railway (forecast worker)
- **Build Command:** `pnpm turbo run build --filter=web`
- **Deployment Method:** GitHub Actions orchestrates sequential deploys (Vercel -> Convex -> Railway)
- **Rollback Plan:** Database migrations run with Drizzle transactional guards and rollback scripts (`pnpm run db:migrate:down --to <timestamp>`). Feature flags via ConfigCat allow disabling new capabilities instantly. Vercel deployment reverts use `pnpm dlx vercel rollback <deployment-id>`; Railway retains previous container images for rapid revert.

```yaml
name: Deploy
on:
  push:
    branches: [main]
jobs:
  build-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run lint test
  deploy:
    needs: build-test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v3
        with:
          version: 8
      - uses: actions/setup-node@v3
        with:
          node-version: 20
      - run: pnpm install --frozen-lockfile
      - run: pnpm turbo run build --filter=web
      - run: pnpm dlx vercel deploy --prod --yes
        env:
          VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
      - run: pnpm dlx convex deploy
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
      - run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

| Environment | Frontend URL | Backend URL | Purpose |
|-------------|--------------|-------------|---------|
| Development | http://localhost:3000 | http://localhost:3000/api | Local development |
| Staging | https://staging.pharmasaas.com | https://staging.pharmasaas.com/api | Pilot pharmacies + QA |
| Production | https://app.pharmasaas.com | https://app.pharmasaas.com/api | Live tenants |

**DNS & Certificate Playbook**
- Domains managed in Cloudflare under the PharmaSaaS organization; Product Ops owns registrar access, DevOps owns DNS zone updates.
- Staging → create CNAME `staging.pharmasaas.com` pointing to Vercel-provided URL and `api.staging` if API split is introduced; enable Cloudflare proxy only after Vercel certificate validates.
- Production → configure `app.pharmasaas.com` + `api.pharmasaas.com` as CNAMEs to Vercel; request HTTPS certificates via Vercel dashboard and confirm propagation before launch.
- Add TXT verification records for Resend (`dkim._domainkey`) and Clerk (custom domain) as part of vendor onboarding checklist.
- Document DNS changes (date, record, owner) in `docs/ops/dns-changelog.md` to aid rollback and compliance reviews.

**Rationale**
- Trade-offs: Keeping API and UI on same Vercel deployment reduces routing complexity; Convex + Railway deploy steps add extra secrets management but isolate realtime + ML workloads.
- Assumptions: Staging uses Neon branch + separate Convex deployment; GitHub environments guard production secrets.

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
