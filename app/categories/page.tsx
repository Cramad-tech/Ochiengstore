import Link from "next/link"

import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getCategories, getProducts, getSiteSettings } from "@/lib/storefront"

export default async function CategoriesPage() {
  const [categories, products, settings] = await Promise.all([getCategories(), getProducts(), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Categories"
        title="Explore the appliance catalog by collection."
        description="Navigate quickly by appliance type to compare relevant specs, price ranges, and delivery-ready inventory."
      />

      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => {
            const count = products.filter((product) => product.categorySlug === category.slug).length
            return (
              <Link key={category.slug} href={`/categories/${category.slug}`} className="glass-card flex flex-col gap-5 p-7 transition hover:-translate-y-1">
                <div>
                  <p className="text-xs uppercase tracking-[0.26em] text-primary">{category.icon}</p>
                  <h2 className="mt-4 font-heading text-2xl font-semibold">{category.name}</h2>
                  <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>
                </div>
                <div className="mt-auto flex items-center justify-between text-sm">
                  <span className="rounded-full bg-primary/10 px-3 py-1 font-semibold text-primary">{count} items</span>
                  <span className="font-semibold text-foreground/80">Browse collection</span>
                </div>
              </Link>
            )
          })}
        </div>
      </section>
    </StorefrontShell>
  )
}
