# Pre-deployment Checklist

- Node.js 22+ installed and available on `PATH`
- `.env` populated correctly
- PostgreSQL reachable from the app runtime
- Prisma client generated
- Migrations applied
- Seed completed successfully
- Admin login verified
- Product catalog visible on storefront
- Contact form works
- Newsletter form works
- Checkout creates an order
- Order tracking returns order status
- Review submission works
- Sitemap and robots confirmed
- `npm run lint` clean
- `npm run typecheck` clean
- `npm run test` clean
- `npm run build` succeeds

# Post-deployment Smoke Test Checklist

- Home page renders hero, featured categories, deals, brands, FAQ, and newsletter block
- Shop page filters by search, category, and brand
- Product page loads gallery, specs, related products, and review form
- Cart and checkout flow work on mobile and desktop
- Order confirmation page displays order number
- Order tracking resolves a live order
- Admin dashboard loads counts and links
- Admin product create/update/delete works
- Admin customer and inquiry visibility works
- Admin coupon and content updates work
- Admin order status update works
- Admin review moderation works
- Support contacts and WhatsApp links are correct
