import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"

import { ProductCard } from "@/components/product-card"
import { ProductActions } from "@/components/store/product-actions"
import { ReviewForm } from "@/components/store/review-form"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { formatTzs } from "@/lib/format"
import { resolveProductVideoSource } from "@/lib/media"
import { prisma } from "@/lib/prisma"
import { getProductBySlug, getRelatedProducts, getSiteSettings } from "@/lib/storefront"

type Params = Promise<{ slug: string }>

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: "Product not found",
    }
  }

  return {
    title: product.name,
    description: product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      images: [product.image],
    },
  }
}

export default async function ProductDetailPage({ params }: { params: Params }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const [relatedProducts, settings] = await Promise.all([getRelatedProducts(product), getSiteSettings()])
  const approvedReviews = await prisma.review
    .findMany({
      where: {
        product: {
          is: {
            slug: product.slug,
          },
        },
        status: "APPROVED",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 4,
    })
    .catch(() => [])
  const activePrice = product.discountPrice ?? product.price
  const videoSource = resolveProductVideoSource(product.videoUrl)

  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    sku: product.sku,
    image: product.gallery,
    ...(product.videoUrl ? { video: product.videoUrl } : {}),
    brand: {
      "@type": "Brand",
      name: product.brandSlug,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "TZS",
      price: activePrice,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  }

  return (
    <StorefrontShell settings={settings}>
      <section className="pb-12 pt-10 sm:pb-16 sm:pt-14">
        <div className="page-shell">
          <div className="grid gap-8 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="glass-card p-5 sm:p-7">
              <div className="grid gap-4 lg:grid-cols-[1fr_130px]">
                <div className="overflow-hidden rounded-[1.6rem] bg-secondary/60">
                  <Image
                    src={product.image}
                    alt={product.name}
                    width={1200}
                    height={1200}
                    className="aspect-square w-full object-cover"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-1">
                  {product.gallery.map((image, index) => (
                    <div key={`${image}-${index}`} className="overflow-hidden rounded-[1.1rem] border border-border bg-card">
                      <Image src={image} alt={`${product.name} preview ${index + 1}`} width={220} height={220} className="aspect-square w-full object-cover" />
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-5">
              <div className="glass-card p-7">
                <p className="text-xs uppercase tracking-[0.26em] text-primary">{product.brandSlug}</p>
                <h1 className="mt-3 font-heading text-4xl font-semibold">{product.name}</h1>
                <p className="mt-4 text-base text-muted-foreground">{product.description}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
                    {product.warrantyMonths} months warranty
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    Model {product.modelNumber}
                  </span>
                  <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                    {product.deliveryEligible ? "Delivery eligible" : "Store pickup only"}
                  </span>
                </div>
                <div className="mt-7 flex items-end gap-4">
                  <div>
                    <p className="text-4xl font-bold text-foreground">{formatTzs(activePrice)}</p>
                    {product.discountPrice ? <p className="text-base text-muted-foreground line-through">{formatTzs(product.price)}</p> : null}
                  </div>
                  <p className="text-sm text-muted-foreground">{product.rating.toFixed(1)} rating | {product.reviewCount} reviews</p>
                </div>
                <div className="mt-7">
                  <ProductActions product={product} whatsappPhone={settings.whatsappPhone} />
                </div>
              </div>

              <div className="glass-card p-7">
                <h2 className="font-heading text-2xl font-semibold">Key features</h2>
                <ul className="mt-4 grid gap-3 text-sm text-muted-foreground">
                  {product.keyFeatures.map((feature) => (
                    <li key={feature} className="rounded-2xl bg-secondary/70 px-4 py-3">
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="glass-card p-7">
              <h2 className="font-heading text-2xl font-semibold">Technical specifications</h2>
              <div className="mt-6 overflow-hidden rounded-[1.2rem] border border-border">
                <table className="w-full text-sm">
                  <tbody>
                    {product.technicalSpecifications.map((specification) => (
                      <tr key={`${specification.group}-${specification.label}`} className="border-b border-border last:border-b-0">
                        <td className="bg-secondary/60 px-4 py-3 font-semibold text-foreground">{specification.label}</td>
                        <td className="px-4 py-3 text-muted-foreground">{specification.value}</td>
                      </tr>
                    ))}
                    <tr className="border-b border-border">
                      <td className="bg-secondary/60 px-4 py-3 font-semibold text-foreground">Energy details</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.energyDetails}</td>
                    </tr>
                    <tr className="border-b border-border">
                      <td className="bg-secondary/60 px-4 py-3 font-semibold text-foreground">Dimensions</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.dimensions}</td>
                    </tr>
                    <tr>
                      <td className="bg-secondary/60 px-4 py-3 font-semibold text-foreground">Weight</td>
                      <td className="px-4 py-3 text-muted-foreground">{product.weightKg} kg</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div className="glass-card p-7">
              <h2 className="font-heading text-2xl font-semibold">Delivery & installation</h2>
              <div className="mt-5 space-y-4 text-sm text-muted-foreground">
                <p>Delivery eligibility: {product.deliveryEligible ? "Available across supported regions" : "Limited to confirmed routes"}</p>
                <p>Warranty: {product.warrantyMonths} months with order-number based support.</p>
                {product.installationInfo ? <p>Installation note: {product.installationInfo}</p> : null}
              </div>
            </div>
          </div>

          {videoSource ? (
            <section className="mt-8">
              <div className="glass-card p-7">
                <span className="eyebrow">Product video</span>
                <h2 className="mt-4 font-heading text-2xl font-semibold">See the product before you order.</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  Watch a quick product preview to understand size, design, controls, and setup expectations.
                </p>
                <div className="mt-6 overflow-hidden rounded-[1.5rem] border border-border bg-secondary/40">
                  {videoSource.kind === "embed" ? (
                    <iframe
                      src={videoSource.src}
                      title={`${product.name} product video`}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video w-full"
                    />
                  ) : (
                    <video controls preload="metadata" className="aspect-video w-full bg-black">
                      <source src={videoSource.src} />
                      Your browser does not support embedded product videos.
                    </video>
                  )}
                </div>
              </div>
            </section>
          ) : null}

          <section className="mt-12">
            <div className="flex items-end justify-between gap-4">
              <div>
                <span className="eyebrow">Related picks</span>
                <h2 className="mt-3 section-heading">Similar appliances shoppers compare.</h2>
              </div>
            </div>
            <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.slug} product={relatedProduct} />
              ))}
            </div>
          </section>

          <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
            <div className="glass-card p-7">
              <span className="eyebrow">Customer reviews</span>
              <h2 className="mt-4 section-heading">Recent approved feedback.</h2>
              <div className="mt-6 space-y-4">
                {approvedReviews.length > 0 ? (
                  approvedReviews.map((review: (typeof approvedReviews)[number]) => (
                    <article key={review.id} className="rounded-[1.2rem] border border-border p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="font-heading text-lg font-semibold">{review.title ?? review.name}</h3>
                          <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{review.name}</p>
                        </div>
                        <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
                          {review.rating}/5
                        </span>
                      </div>
                      <p className="mt-4 text-sm text-muted-foreground">{review.body}</p>
                    </article>
                  ))
                ) : (
                  <p className="text-sm text-muted-foreground">No approved reviews yet. Be the first to share your experience.</p>
                )}
              </div>
            </div>

            <div className="glass-card p-7">
              <span className="eyebrow">Leave a review</span>
              <h2 className="mt-4 section-heading">Help other shoppers buy confidently.</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Reviews are moderated before publishing so the catalog remains clear, useful, and trustworthy.
              </p>
              <div className="mt-6">
                <ReviewForm productSlug={product.slug} />
              </div>
            </div>
          </section>
        </div>
      </section>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }} />
    </StorefrontShell>
  )
}
