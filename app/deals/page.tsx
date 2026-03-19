import { ProductCard } from "@/components/product-card"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getProducts, getSiteSettings } from "@/lib/storefront"

export default async function DealsPage() {
  const [deals, settings] = await Promise.all([getProducts({ dealsOnly: true, sort: "price-asc" }), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Deals"
        title="Active appliance deals priced in TZS."
        description="Curated discounts on high-demand home appliances with transparent pricing and fulfillment notes."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {deals.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
