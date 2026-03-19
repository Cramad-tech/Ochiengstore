export type Locale = "en" | "sw"

export type AvailabilityStatus = "IN_STOCK" | "LOW_STOCK" | "OUT_OF_STOCK" | "PREORDER"

export interface StoreCategory {
  slug: string
  name: string
  nameSw: string
  description: string
  descriptionSw: string
  icon: string
  featured: boolean
}

export interface StoreBrand {
  slug: string
  name: string
  description: string
  country: string
  featured: boolean
  logoLabel: string
}

export interface StoreSpecification {
  group: string
  label: string
  value: string
}

export interface StoreProduct {
  slug: string
  name: string
  nameSw: string
  sku: string
  brandSlug: string
  categorySlug: string
  subcategorySlug: string
  price: number
  discountPrice?: number
  stock: number
  availability: AvailabilityStatus
  warrantyMonths: number
  modelNumber: string
  shortDescription: string
  shortDescriptionSw: string
  description: string
  descriptionSw: string
  keyFeatures: string[]
  keyFeaturesSw: string[]
  technicalSpecifications: StoreSpecification[]
  energyDetails: string
  dimensions: string
  weightKg: number
  image: string
  gallery: string[]
  videoUrl?: string
  featured: boolean
  trending: boolean
  newArrival: boolean
  rating: number
  reviewCount: number
  deliveryEligible: boolean
  installationInfo?: string
}

export interface StoreBanner {
  title: string
  titleSw: string
  eyebrow: string
  eyebrowSw: string
  description: string
  descriptionSw: string
  ctaLabel: string
  ctaLabelSw: string
  ctaHref: string
}

export interface StoreTestimonial {
  name: string
  city: string
  role: string
  roleSw: string
  quote: string
  quoteSw: string
  rating: number
}

export interface FaqItem {
  question: string
  questionSw: string
  answer: string
  answerSw: string
}

export interface HighlightItem {
  title: string
  titleSw: string
  description: string
  descriptionSw: string
}

export interface SiteSettingsShape {
  storeName: string
  tagline: string
  supportPhone: string
  supportEmail: string
  whatsappPhone: string
  address: string
  defaultDeliveryLead: string
  regions: string[]
}
