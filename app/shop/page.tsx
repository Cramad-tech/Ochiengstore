import { ProductCard } from "@/components/product-card"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getBrands, getCategories, getProducts, getSiteSettings } from "@/lib/storefront"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ShopPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const category = typeof params.category === "string" ? params.category : undefined
  const brand = typeof params.brand === "string" ? params.brand : undefined
  const search = typeof params.search === "string" ? params.search : undefined
  const sort = typeof params.sort === "string" ? params.sort : undefined

  const [products, categories, brands, settings] = await Promise.all([
    getProducts({ category, brand, search, sort }),
    getCategories(),
    getBrands(),
    getSiteSettings(),
  ])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Shop catalog"
        title="Compare home appliances with clear specs, pricing, and warranty context."
        description="Search by product type, filter by brand, and browse in Tanzanian Shillings with a cleaner path from discovery to checkout."
      />

      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="glass-card h-fit p-6">
            <form className="space-y-5" action="/shop">
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Search</label>
                <input
                  name="search"
                  defaultValue={search}
                  placeholder="TV, fridge, fan..."
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Category</label>
                <select
                  name="category"
                  defaultValue={category}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">All categories</option>
                  {categories.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Brand</label>
                <select
                  name="brand"
                  defaultValue={brand}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">All brands</option>
                  {brands.map((item) => (
                    <option key={item.slug} value={item.slug}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-2 block text-sm font-semibold text-foreground">Sort</label>
                <select
                  name="sort"
                  defaultValue={sort}
                  className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                >
                  <option value="">Featured first</option>
                  <option value="price-asc">Price: low to high</option>
                  <option value="price-desc">Price: high to low</option>
                  <option value="rating">Best rated</option>
                </select>
              </div>
              <button className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Apply filters
              </button>
            </form>
          </aside>

          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.26em] text-muted-foreground">Catalog view</p>
                <h2 className="font-heading text-2xl font-semibold">{products.length} products found</h2>
              </div>
            </div>

            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-3">
                {products.map((product) => (
                  <ProductCard key={product.slug} product={product} />
                ))}
              </div>
            ) : (
              <div className="glass-card p-12 text-center">
                <h3 className="font-heading text-2xl font-semibold">No matching products</h3>
                <p className="mt-3 text-muted-foreground">Try a broader category, brand, or search term.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
