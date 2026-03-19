# Ochieng Home Appliances

Tanzania-focused ecommerce platform for home appliances built with Next.js App Router, Prisma, PostgreSQL, Auth.js, and Tailwind CSS.

## What changed
- Replaced the old client-only marketplace prototype with a server-capable ecommerce structure.
- Added Prisma schema and seed support for products, categories, brands, orders, payments, reviews, banners, settings, RBAC, and audit logs.
- Rebuilt the storefront around home appliances with TZS pricing, Tanzania delivery messaging, WhatsApp support, checkout, order tracking, wishlist, and policy pages.
- Rebuilt the admin console around server-backed product, category, brand, order, customer, coupon, review, content, and settings flows.
- Added `sitemap.ts`, `robots.ts`, metadata improvements, and structured product JSON-LD.

## Setup
1. Install Node.js 22+ and a package manager (`npm` or `pnpm`).
2. Copy `.env.example` to `.env` and fill in the values.
   The included `DATABASE_URL` is only a template. Replace `REPLACE_WITH_YOUR_POSTGRES_PASSWORD` with the real password for your local PostgreSQL user before running Prisma commands.
3. Install dependencies:

```bash
npm install
```

4. Generate Prisma client and apply the schema:

```bash
npm run db:generate
npm run db:migrate
```

The default migration command is set up for first-time local bootstrapping. For future schema changes, you can also run a named migration directly, for example:

```bash
npx prisma migrate dev --name add-order-notes
```

5. Seed the catalog and admin account:

```bash
npm run db:seed
```

6. Verify that the backend, seed data, and database are ready:

```bash
npm run verify:backend
```

7. Start the app:

```bash
npm run dev
```

## Environment variables
Use the values in `.env.example` as the baseline. The most important variables are:
- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXT_PUBLIC_SITE_URL`
- `ALLOWED_DEV_ORIGINS`
- `WHATSAPP_PHONE`
- `SUPPORT_PHONE`
- `SUPPORT_EMAIL`
- `ADMIN_SEED_EMAIL`
- `ADMIN_SEED_PASSWORD`
- `CUSTOMER_SEED_EMAIL`
- `CUSTOMER_SEED_PASSWORD`
- `CUSTOMER_SEED_PHONE`

In local development, Auth.js now falls back to a stable project-specific secret if `.env` has not been created yet. Keep using a real `AUTH_SECRET` in any shared or production environment.

## Database and migrations
- Prisma schema: `prisma/schema.prisma`
- Seed script: `prisma/seed.ts`
- Recommended workflow:

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run verify:backend
```

If you need a fast local sync while iterating:

```bash
npm run db:push
```

## Testing
Run the available checks after Node is available:

```bash
npm run verify:backend
npm run lint
npm run typecheck
npm run test
npm run build
```

## Customer and admin access
- Customer login: `/login`
- Customer signup: `/signup`
- Customer account area: `/account`
- Admin login: `/admin/login`

Seeded local test accounts:
- Admin: `admin@ochiengstore.co.tz` / `ChangeMe123!`
- Customer: `customer@ochiengstore.co.tz` / `Customer123!`

## Deployment
Recommended target: Vercel + managed PostgreSQL.

1. Provision a PostgreSQL database.
2. Add all `.env` variables in Vercel project settings.
3. Run migrations during deployment or before first release.
4. Seed the production database once with the intended admin credentials.
5. Set `NEXT_PUBLIC_SITE_URL` to the production domain.

More detail is in `docs/deployment.md`.

## Project structure
- `app/`: storefront, admin routes, API routes, sitemap, robots
- `components/`: shared UI, storefront sections, admin shell
- `lib/`: Prisma client, auth helpers, admin actions, storefront repositories, validation, commerce helpers
- `prisma/`: schema and seed script
- `tests/`: unit tests for critical helpers

## Validation note
If your shell does not expose `node` and `npm` on `PATH`, you can still run the commands by using the installed binaries directly from `C:\Program Files\nodejs` or by updating your system `PATH` and restarting the terminal.
