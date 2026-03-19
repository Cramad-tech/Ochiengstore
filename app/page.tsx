import Link from "next/link"

import { CategoryGrid } from "@/components/category-grid"
import { HeroSection } from "@/components/hero-section"
import { OffersSection } from "@/components/offers-section"
import { ProductCard } from "@/components/product-card"
import { NewsletterForm } from "@/components/store/newsletter-form"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getHomePageCollections } from "@/lib/storefront"
import { WHY_SHOP_WITH_US } from "@/lib/site-content"

export default async function HomePage() {
  const collections = await getHomePageCollections()

  return (
    <StorefrontShell settings={collections.settings}>
      <HeroSection
        banner={collections.banner}
        productCount={collections.topSelling.length + collections.newArrivals.length}
        whatsappPhone={collections.settings.whatsappPhone}
      />
      <CategoryGrid categories={collections.categories} />
      <OffersSection deals={collections.deals} />

      <section className="py-16 sm:py-20">
        <div className="page-shell space-y-8">
          <div className="flex items-end justify-between gap-6">
            <div className="space-y-3">
              <span className="eyebrow">Top sellers</span>
              <h2 className="section-heading">Best-performing appliances for everyday homes.</h2>
            </div>
            <Link href="/shop" className="hidden text-sm font-semibold text-primary md:inline-flex">
              View full catalog
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {collections.topSelling.slice(0, 8).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </section>

      <section className="bg-secondary/70 py-16 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
          <div className="space-y-4">
            <span className="eyebrow">Why shop with us</span>
            <h2 className="section-heading">Built for trust, clarity, and reliable delivery across Tanzania.</h2>
            <p className="text-muted-foreground">
              The storefront is structured to help customers compare appliances confidently, understand warranty coverage, and confirm delivery or installation needs before they buy.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_SHOP_WITH_US.map((item) => (
              <article key={item.title} className="glass-card p-6">
                <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="glass-card p-7">
            <span className="eyebrow">New arrivals</span>
            <h2 className="mt-4 section-heading">Latest appliance drops.</h2>
            <div className="mt-6 grid grid-cols-2 gap-4">
              {collections.newArrivals.slice(0, 4).map((product) => (
                <ProductCard key={product.slug} product={product} />
              ))}
            </div>
          </div>
          <div className="glass-card bg-[linear-gradient(135deg,#17316a,#102552)] p-7 text-white">
            <span className="eyebrow border-white/12 bg-white/8 text-white">Featured brands</span>
            <h2 className="mt-4 section-heading text-white">Reliable names trusted in Tanzanian households.</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {collections.brands.map((brand) => (
                <Link
                  key={brand.slug}
                  href={`/brands/${brand.slug}`}
                  className="rounded-[1.3rem] border border-white/10 bg-white/8 p-5 transition hover:bg-white/12"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex size-11 items-center justify-center rounded-2xl bg-white text-foreground font-semibold">
                      {brand.logoLabel}
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold">{brand.name}</h3>
                      <p className="text-sm text-white/68">{brand.country}</p>
                    </div>
                  </div>
                  <p className="mt-4 text-sm text-white/72">{brand.description}</p>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-secondary/60 py-16 sm:py-20">
        <div className="page-shell grid gap-6 lg:grid-cols-3">
          <div className="glass-card p-7 lg:col-span-1">
            <span className="eyebrow">Delivery support</span>
            <h2 className="mt-4 section-heading">Coverage for Dar es Salaam and upcountry dispatch.</h2>
            <p className="mt-4 text-sm text-muted-foreground">
              Every order captures phone-first delivery details, region, and access notes so bulky appliances reach customers with fewer surprises.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              {collections.settings.regions.slice(0, 8).map((region) => (
                <span key={region} className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                  {region}
                </span>
              ))}
            </div>
          </div>
          <div className="glass-card p-7 lg:col-span-2">
            <span className="eyebrow">Customer voice</span>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {collections.testimonials.map((testimonial) => (
                <article key={testimonial.name} className="rounded-[1.2rem] border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {testimonial.role} | {testimonial.city}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-4">
            <span className="eyebrow">Frequently asked</span>
            <h2 className="section-heading">Help buyers decide faster.</h2>
            <p className="text-muted-foreground">
              Appliance buyers often need reassurance around delivery, warranty, installation, and payment confirmation. These answers reduce friction before checkout.
            </p>
          </div>
          <div className="space-y-4">
            {collections.faqs.map((faq) => (
              <article key={faq.question} className="glass-card p-6">
                <h3 className="font-heading text-lg font-semibold">{faq.question}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{faq.answer}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <div className="glass-card grid gap-8 bg-[linear-gradient(135deg,rgba(212,161,43,0.18),rgba(23,49,106,0.1))] p-8 lg:grid-cols-[0.85fr_1.15fr]">
            <div className="space-y-4">
              <span className="eyebrow">Newsletter</span>
              <h2 className="section-heading">Stay ready for appliance price drops and fresh stock.</h2>
              <p className="text-muted-foreground">
                Subscribe for trusted deal alerts, new arrivals, and guidance on the best appliances for apartments, family homes, and small businesses.
              </p>
            </div>
            <div className="flex items-center">
              <NewsletterForm />
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}

