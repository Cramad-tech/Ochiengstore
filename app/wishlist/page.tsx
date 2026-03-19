import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { WishlistView } from "@/components/store/wishlist-view"
import { getProducts, getSiteSettings } from "@/lib/storefront"

export default async function WishlistPage() {
  const [products, settings] = await Promise.all([getProducts(), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Wishlist"
        title="Keep the appliances you are still comparing."
        description="Save products while you review size, warranty, delivery eligibility, and model fit before placing an order."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <WishlistView products={products} />
        </div>
      </section>
    </StorefrontShell>
  )
}
