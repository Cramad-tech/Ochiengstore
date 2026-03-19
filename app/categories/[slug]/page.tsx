import { notFound } from "next/navigation"

import { ProductCard } from "@/components/product-card"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getCategoryBySlug, getProducts, getSiteSettings } from "@/lib/storefront"

export default async function CategoryDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const category = await getCategoryBySlug(slug)

  if (!category) {
    notFound()
  }

  const [products, settings] = await Promise.all([getProducts({ category: slug }), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero eyebrow={category.name} title={category.name} description={category.description} />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
