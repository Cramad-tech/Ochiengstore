import type { MetadataRoute } from "next"

import { getBrands, getCategories, getProducts } from "@/lib/storefront"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getBrands()])

  const staticRoutes = [
    "",
    "/shop",
    "/categories",
    "/brands",
    "/deals",
    "/about",
    "/contact",
    "/faq",
    "/warranty-policy",
    "/delivery-policy",
    "/return-refund-policy",
    "/privacy-policy",
    "/terms-and-conditions",
    "/order-tracking",
  ].map((path) => ({
    url: `${siteUrl}${path}`,
    lastModified: new Date(),
  }))

  return [
    ...staticRoutes,
    ...products.map((product) => ({
      url: `${siteUrl}/products/${product.slug}`,
      lastModified: new Date(),
    })),
    ...categories.map((category) => ({
      url: `${siteUrl}/categories/${category.slug}`,
      lastModified: new Date(),
    })),
    ...brands.map((brand) => ({
      url: `${siteUrl}/brands/${brand.slug}`,
      lastModified: new Date(),
    })),
  ]
}
