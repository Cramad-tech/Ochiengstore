import Link from "next/link"

import { StorefrontShell } from "@/components/store/storefront-shell"

export default function NotFound() {
  return (
    <StorefrontShell>
      <section className="pb-20 pt-16">
        <div className="page-shell">
          <div className="glass-card p-14 text-center">
            <span className="eyebrow">404</span>
            <h1 className="mt-6 section-heading">That appliance page could not be found.</h1>
            <p className="mt-4 text-muted-foreground">The link may be outdated, or the product has moved to another collection.</p>
            <Link href="/shop" className="mt-8 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Return to shop
            </Link>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
