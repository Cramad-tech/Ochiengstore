import { prisma } from "@/lib/prisma"
import { HOME_BANNER, STORE_BRANDS, STORE_CATEGORIES, STORE_PRODUCTS, STORE_TESTIMONIALS } from "@/lib/demo-store"
import { FAQ_ITEMS, SITE_SETTINGS_FALLBACK } from "@/lib/site-content"
import type { SiteSettingsShape, StoreBanner, StoreBrand, StoreCategory, StoreProduct, StoreTestimonial } from "@/lib/store-types"

type ProductFilters = {
  category?: string
  brand?: string
  search?: string
  featured?: boolean
  dealsOnly?: boolean
  sort?: string
}

function shouldUseDemoData() {
  return process.env.USE_DEMO_DATA === "true" || (!process.env.DATABASE_URL && process.env.NODE_ENV !== "production")
}

function resolveStorefrontFallback<T>(error: unknown, fallback: T) {
  if (process.env.USE_DEMO_DATA === "true" || process.env.NODE_ENV === "development") {
    console.warn("Storefront data fallback engaged.", error)
    return fallback
  }

  throw error instanceof Error ? error : new Error("Storefront data lookup failed.")
}

function applySiteSettingOverrides(settings: SiteSettingsShape): SiteSettingsShape {
  return {
    ...settings,
    supportPhone: process.env.SUPPORT_PHONE ?? settings.supportPhone,
    supportEmail: process.env.SUPPORT_EMAIL ?? settings.supportEmail,
    whatsappPhone: process.env.WHATSAPP_PHONE ?? settings.whatsappPhone,
    address: process.env.STORE_ADDRESS ?? settings.address,
    defaultDeliveryLead: process.env.DEFAULT_DELIVERY_LEAD ?? settings.defaultDeliveryLead,
  }
}

function normalizeSiteSettings(settings: Record<string, unknown>): SiteSettingsShape {
  return applySiteSettingOverrides({
    ...SITE_SETTINGS_FALLBACK,
    ...settings,
    regions: Array.isArray(settings.regions)
      ? settings.regions.filter((region): region is string => typeof region === "string" && region.trim().length > 0)
      : SITE_SETTINGS_FALLBACK.regions,
  })
}

function mapProductRecord(product: {
  slug: string
  name: string
  nameSw: string
  sku: string
  modelNumber: string
  price: number
  discountPrice: number | null
  availabilityStatus: StoreProduct["availability"]
  warrantyPeriodMonths: number
  shortDescription: string
  shortDescriptionSw: string
  fullDescription: string
  fullDescriptionSw: string
  keyFeatures: unknown
  keyFeaturesSw: unknown
  energyDetails: string
  dimensions: string
  weightKg: number | null
  videoUrl: string | null
  featured: boolean
  trending: boolean
  newArrival: boolean
  averageRating: number
  reviewCount: number
  deliveryEligible: boolean
  installationInfo: string | null
  brand: { slug: string }
  category: { slug: string }
  subcategory: { slug: string } | null
  inventory: { quantity: number } | null
  images: Array<{ url: string; isPrimary: boolean }>
  specifications: Array<{ groupName: string; label: string; value: string }>
}): StoreProduct {
  const primaryImage = product.images.find((image) => image.isPrimary)?.url ?? product.images[0]?.url ?? "/placeholder.svg"

  return {
    slug: product.slug,
    name: product.name,
    nameSw: product.nameSw,
    sku: product.sku,
    brandSlug: product.brand.slug,
    categorySlug: product.category.slug,
    subcategorySlug: product.subcategory?.slug ?? "general",
    price: product.price,
    discountPrice: product.discountPrice ?? undefined,
    stock: product.inventory?.quantity ?? 0,
    availability: product.availabilityStatus,
    warrantyMonths: product.warrantyPeriodMonths,
    modelNumber: product.modelNumber,
    shortDescription: product.shortDescription,
    shortDescriptionSw: product.shortDescriptionSw,
    description: product.fullDescription,
    descriptionSw: product.fullDescriptionSw,
    keyFeatures: Array.isArray(product.keyFeatures) ? (product.keyFeatures as string[]) : [],
    keyFeaturesSw: Array.isArray(product.keyFeaturesSw) ? (product.keyFeaturesSw as string[]) : [],
    technicalSpecifications: product.specifications.map((item) => ({
      group: item.groupName,
      label: item.label,
      value: item.value,
    })),
    energyDetails: product.energyDetails,
    dimensions: product.dimensions,
    weightKg: product.weightKg ?? 0,
    image: primaryImage,
    gallery: product.images.map((item) => item.url),
    videoUrl: product.videoUrl ?? undefined,
    featured: product.featured,
    trending: product.trending,
    newArrival: product.newArrival,
    rating: product.averageRating,
    reviewCount: product.reviewCount,
    deliveryEligible: product.deliveryEligible,
    installationInfo: product.installationInfo ?? undefined,
  }
}

function filterProducts(products: StoreProduct[], filters: ProductFilters = {}) {
  const search = filters.search?.toLowerCase().trim()
  let results = [...products]

  if (filters.category) {
    results = results.filter((product) => product.categorySlug === filters.category)
  }

  if (filters.brand) {
    results = results.filter((product) => product.brandSlug === filters.brand)
  }

  if (filters.featured) {
    results = results.filter((product) => product.featured)
  }

  if (filters.dealsOnly) {
    results = results.filter((product) => Boolean(product.discountPrice))
  }

  if (search) {
    results = results.filter((product) =>
      [
        product.name,
        product.nameSw,
        product.shortDescription,
        product.description,
        product.modelNumber,
        product.sku,
      ]
        .join(" ")
        .toLowerCase()
        .includes(search),
    )
  }

  switch (filters.sort) {
    case "price-asc":
      results.sort((a, b) => a.price - b.price)
      break
    case "price-desc":
      results.sort((a, b) => b.price - a.price)
      break
    case "rating":
      results.sort((a, b) => b.rating - a.rating)
      break
    default:
      results.sort((a, b) => Number(b.featured) - Number(a.featured) || Number(b.newArrival) - Number(a.newArrival))
  }

  return results
}

export async function getSiteSettings(): Promise<SiteSettingsShape> {
  if (shouldUseDemoData()) {
    return applySiteSettingOverrides(SITE_SETTINGS_FALLBACK)
  }

  try {
    const settings = await prisma.siteSetting.findMany()
    const mapped = settings.reduce((acc: Record<string, unknown>, item: (typeof settings)[number]) => {
      acc[item.key] = item.value
      return acc
    }, {})

    return normalizeSiteSettings(mapped)
  } catch (error) {
    return resolveStorefrontFallback(error, applySiteSettingOverrides(SITE_SETTINGS_FALLBACK))
  }
}

export async function getHeroBanner(): Promise<StoreBanner> {
  if (shouldUseDemoData()) {
    return HOME_BANNER
  }

  try {
    const banner = await prisma.banner.findFirst({
      where: {
        placement: "HOME_HERO",
        active: true,
      },
      orderBy: [{ sortOrder: "asc" }, { updatedAt: "desc" }],
    })

    if (!banner) {
      return HOME_BANNER
    }

    return {
      eyebrow: banner.eyebrow,
      eyebrowSw: banner.eyebrowSw,
      title: banner.title,
      titleSw: banner.titleSw,
      description: banner.description,
      descriptionSw: banner.descriptionSw,
      ctaLabel: banner.ctaLabel,
      ctaLabelSw: banner.ctaLabelSw,
      ctaHref: banner.ctaHref,
    }
  } catch (error) {
    return resolveStorefrontFallback(error, HOME_BANNER)
  }
}

export async function getTestimonials(): Promise<StoreTestimonial[]> {
  if (shouldUseDemoData()) {
    return STORE_TESTIMONIALS
  }

  try {
    const testimonials = await prisma.testimonial.findMany({
      where: {
        featured: true,
      },
      orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
      take: 6,
    })

    if (testimonials.length === 0) {
      return STORE_TESTIMONIALS
    }

    return testimonials.map((testimonial: (typeof testimonials)[number]) => ({
      name: testimonial.name,
      city: testimonial.city,
      role: testimonial.role,
      roleSw: testimonial.roleSw,
      quote: testimonial.quote,
      quoteSw: testimonial.quoteSw,
      rating: testimonial.rating,
    }))
  } catch (error) {
    return resolveStorefrontFallback(error, STORE_TESTIMONIALS)
  }
}

export async function getCategories(): Promise<StoreCategory[]> {
  if (shouldUseDemoData()) {
    return STORE_CATEGORIES
  }

  try {
    const categories = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
    })

    return categories.map((category: (typeof categories)[number]) => ({
      slug: category.slug,
      name: category.name,
      nameSw: category.nameSw,
      description: category.description,
      descriptionSw: category.descriptionSw,
      icon: category.icon,
      featured: category.featured,
    }))
  } catch (error) {
    return resolveStorefrontFallback(error, STORE_CATEGORIES)
  }
}

export async function getBrands(): Promise<StoreBrand[]> {
  if (shouldUseDemoData()) {
    return STORE_BRANDS
  }

  try {
    const brands = await prisma.brand.findMany({
      orderBy: { name: "asc" },
    })

    return brands.map((brand: (typeof brands)[number]) => ({
      slug: brand.slug,
      name: brand.name,
      description: brand.description ?? "",
      country: brand.country ?? "Global",
      featured: brand.featured,
      logoLabel: brand.name.slice(0, 2).toUpperCase(),
    }))
  } catch (error) {
    return resolveStorefrontFallback(error, STORE_BRANDS)
  }
}

export async function getProducts(filters: ProductFilters = {}): Promise<StoreProduct[]> {
  if (shouldUseDemoData()) {
    return filterProducts(STORE_PRODUCTS, filters)
  }

  try {
    const products = await prisma.product.findMany({
      where: {
        published: true,
        ...(filters.category ? { category: { slug: filters.category } } : {}),
        ...(filters.brand ? { brand: { slug: filters.brand } } : {}),
        ...(filters.featured ? { featured: true } : {}),
        ...(filters.dealsOnly ? { discountPrice: { not: null } } : {}),
      },
      include: {
        brand: true,
        category: true,
        subcategory: true,
        inventory: true,
        images: {
          orderBy: { position: "asc" },
        },
        specifications: {
          orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
        },
      },
    })

    const mapped = products.map(mapProductRecord)

    return filterProducts(mapped, filters)
  } catch (error) {
    return resolveStorefrontFallback(error, filterProducts(STORE_PRODUCTS, filters))
  }
}

export async function getProductBySlug(slug: string) {
  if (shouldUseDemoData()) {
    return STORE_PRODUCTS.find((product) => product.slug === slug) ?? null
  }

  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        subcategory: true,
        inventory: true,
        images: {
          orderBy: { position: "asc" },
        },
        specifications: {
          orderBy: [{ groupName: "asc" }, { sortOrder: "asc" }],
        },
      },
    })

    if (!product || !product.published) {
      return null
    }

    return mapProductRecord(product)
  } catch (error) {
    const products = resolveStorefrontFallback(error, STORE_PRODUCTS)
    return products.find((product) => product.slug === slug) ?? null
  }
}

export async function getRelatedProducts(product: StoreProduct) {
  const products = await getProducts({
    category: product.categorySlug,
  })

  return products.filter((item) => item.slug !== product.slug).slice(0, 4)
}

export async function getHomePageCollections() {
  const [categories, brands, products, settings, banner, testimonials] = await Promise.all([
    getCategories(),
    getBrands(),
    getProducts(),
    getSiteSettings(),
    getHeroBanner(),
    getTestimonials(),
  ])

  return {
    banner,
    categories: categories.filter((category) => category.featured).slice(0, 8),
    brands: brands.filter((brand) => brand.featured).slice(0, 6),
    topSelling: products.filter((product) => product.featured || product.trending).slice(0, 8),
    newArrivals: products.filter((product) => product.newArrival).slice(0, 6),
    deals: products.filter((product) => product.discountPrice).slice(0, 6),
    testimonials,
    faqs: FAQ_ITEMS,
    settings,
  }
}

export async function getBrandBySlug(slug: string) {
  const brands = await getBrands()
  return brands.find((brand) => brand.slug === slug) ?? null
}

export async function getCategoryBySlug(slug: string) {
  const categories = await getCategories()
  return categories.find((category) => category.slug === slug) ?? null
}

export { FAQ_ITEMS, HOME_BANNER, STORE_TESTIMONIALS }
