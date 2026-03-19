import Link from "next/link"

import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getBrands, getSiteSettings } from "@/lib/storefront"

export default async function BrandsPage() {
  const [brands, settings] = await Promise.all([getBrands(), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Brands"
        title="Browse trusted appliance brands."
        description="We organize the catalog around brands shoppers already know, making it easier to compare reliability, features, and pricing."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {brands.map((brand) => (
            <Link key={brand.slug} href={`/brands/${brand.slug}`} className="glass-card p-7 transition hover:-translate-y-1">
              <div className="flex items-center gap-4">
                <div className="flex size-14 items-center justify-center rounded-3xl bg-primary/10 font-heading text-lg font-semibold text-primary">
                  {brand.logoLabel}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-semibold">{brand.name}</h2>
                  <p className="text-sm uppercase tracking-[0.22em] text-muted-foreground">{brand.country}</p>
                </div>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{brand.description}</p>
            </Link>
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
