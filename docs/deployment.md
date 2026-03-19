# Deployment Guide

## Recommended stack
- Frontend and server runtime: Vercel
- Database: Managed PostgreSQL
- ORM: Prisma

## Pre-deployment steps
1. Create the PostgreSQL database.
2. Add the production environment variables from `.env.example`.
3. Ensure `NEXT_PUBLIC_SITE_URL` matches the production domain.
4. Set the intended production admin credentials through `ADMIN_SEED_EMAIL` and `ADMIN_SEED_PASSWORD`.

## Deployment commands
Run locally or in CI before the first release:

```bash
npm install
npm run db:generate
npm run db:migrate:deploy
npm run db:seed
npm run lint
npm run typecheck
npm run test
npm run build
```

## Post-deployment checks
- Confirm the home page, shop, category, product, checkout, and order tracking pages load.
- Confirm admin login succeeds with the seeded credentials.
- Confirm a checkout writes an order and payment record.
- Confirm the contact and newsletter forms create records.
- Confirm `sitemap.xml` and `robots.txt` are reachable.

## Operational notes
- The API routes and admin actions depend on a working PostgreSQL connection.
- If you want to force demo reads without DB-backed storefront queries, set `USE_DEMO_DATA=true`.
- For production, keep `USE_DEMO_DATA=false` and seed the live database.
