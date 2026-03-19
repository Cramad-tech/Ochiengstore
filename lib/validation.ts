import { z } from "zod"

export const newsletterSchema = z.object({
  email: z.string().email(),
})

export const customerSignupSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  region: z.string().min(2),
  city: z.string().min(2),
  district: z.string().optional().or(z.literal("")),
  addressLine: z.string().min(5),
  password: z.string().min(8),
  acceptPolicies: z.boolean().refine((value) => value, {
    message: "You must accept the store policies before continuing.",
  }),
})

export const verificationCodeSchema = z.object({
  email: z.string().email(),
  code: z.string().trim().regex(/^\d{6}$/, "Enter the 6-digit verification code."),
})

export const pendingSignupApprovalSchema = z.object({
  verificationId: z.string().min(2),
})

export const passwordResetRequestSchema = z.object({
  email: z.string().email(),
})

export const passwordResetSchema = verificationCodeSchema.extend({
  password: z.string().min(8),
})

export const passwordChangeSchema = z
  .object({
    currentPassword: z.string().min(8),
    newPassword: z.string().min(8),
    confirmPassword: z.string().min(8),
  })
  .refine((payload) => payload.newPassword === payload.confirmPassword, {
    message: "New passwords do not match.",
    path: ["confirmPassword"],
  })

export const managedUserCreateSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  roleCode: z.enum(["SUPER_ADMIN", "MANAGER", "EDITOR", "SUPPORT", "CUSTOMER"]),
  password: z.string().min(8),
})

export const managedUserUpdateSchema = z.object({
  userId: z.string().min(2),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  roleCode: z.enum(["SUPER_ADMIN", "MANAGER", "EDITOR", "SUPPORT", "CUSTOMER"]),
  password: z.string().optional().or(z.literal("")),
})

export const customerProfileSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(9),
  region: z.string().min(2),
  city: z.string().min(2),
  district: z.string().optional().or(z.literal("")),
  addressLine: z.string().min(5),
})

export const supportConversationCreateSchema = z.object({
  subject: z.string().min(4).max(120),
  message: z.string().min(10).max(4000),
})

export const supportConversationReplySchema = z.object({
  conversationId: z.string().min(2),
  message: z.string().min(1).max(4000),
})

export const supportConversationStatusSchema = z.object({
  conversationId: z.string().min(2),
  status: z.enum(["OPEN", "WAITING_ON_ADMIN", "WAITING_ON_CUSTOMER", "CLOSED"]),
})

export const contactInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(7).optional().or(z.literal("")),
  subject: z.string().min(3),
  message: z.string().min(10),
})

export const cartItemSchema = z.object({
  slug: z.string().min(1),
  name: z.string().min(1),
  price: z.number().int().nonnegative(),
  discountPrice: z.number().int().nonnegative().optional(),
  quantity: z.number().int().min(1),
})

export const checkoutSchema = z.object({
  customerName: z.string().min(3),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().min(9),
  region: z.string().min(2),
  city: z.string().min(2),
  district: z.string().optional().or(z.literal("")),
  addressLine: z.string().min(5),
  notes: z.string().optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BANK_TRANSFER", "MOBILE_MONEY_MANUAL", "WHATSAPP_CONFIRMATION"]),
  acceptPolicies: z.boolean().refine((value) => value, {
    message: "Please accept the store policies before placing the order.",
  }),
  items: z.array(cartItemSchema).min(1),
})

export const orderTrackingSchema = z.object({
  orderNumber: z.string().min(4),
  phone: z.string().min(7),
})

export const reviewSubmissionSchema = z.object({
  productSlug: z.string().min(2),
  name: z.string().min(2),
  title: z.string().min(2).optional().or(z.literal("")),
  rating: z.coerce.number().int().min(1).max(5),
  body: z.string().min(10),
})

export const productFormSchema = z.object({
  name: z.string().min(3),
  nameSw: z.string().min(3),
  sku: z.string().min(3),
  slug: z.string().min(3),
  brandSlug: z.string().min(2),
  categorySlug: z.string().min(2),
  subcategorySlug: z.string().min(2),
  modelNumber: z.string().min(2),
  price: z.coerce.number().int().nonnegative(),
  discountPrice: z.coerce.number().int().nonnegative().optional(),
  stock: z.coerce.number().int().nonnegative(),
  warrantyMonths: z.coerce.number().int().min(0),
  shortDescription: z.string().min(10),
  shortDescriptionSw: z.string().min(10),
  description: z.string().min(20),
  descriptionSw: z.string().min(20),
  image: z.string().min(2),
  gallery: z.string().optional().or(z.literal("")),
  videoUrl: z.string().optional().or(z.literal("")),
  energyDetails: z.string().min(3),
  dimensions: z.string().min(3),
  weightKg: z.coerce.number().nonnegative(),
  installationInfo: z.string().optional().or(z.literal("")),
  keyFeatures: z.string().min(3),
  keyFeaturesSw: z.string().min(3),
  specifications: z.string().optional().or(z.literal("")),
})

export const categoryFormSchema = z.object({
  name: z.string().min(2),
  nameSw: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  descriptionSw: z.string().min(5),
  icon: z.string().min(2),
})

export const brandFormSchema = z.object({
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  country: z.string().min(2),
})

export const reviewModerationSchema = z.object({
  reviewId: z.string().min(2),
  status: z.enum(["APPROVED", "REJECTED", "PENDING"]),
})

export const orderStatusSchema = z.object({
  orderId: z.string().min(2),
  status: z.enum(["PENDING", "PAYMENT_REVIEW", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"]),
  paymentStatus: z.enum(["PENDING", "AWAITING_CONFIRMATION", "PAID", "FAILED", "REFUNDED", "CANCELLED"]),
})

export const couponFormSchema = z.object({
  code: z.string().min(3),
  name: z.string().min(3),
  description: z.string().optional().or(z.literal("")),
  discountType: z.enum(["PERCENTAGE", "FIXED_AMOUNT"]),
  discountValue: z.coerce.number().int().positive(),
  minOrderAmount: z.coerce.number().int().nonnegative().optional(),
  maxDiscountAmount: z.coerce.number().int().nonnegative().optional(),
  usageLimit: z.coerce.number().int().positive().optional(),
})

export const bannerFormSchema = z.object({
  eyebrow: z.string().min(2),
  eyebrowSw: z.string().min(2),
  title: z.string().min(5),
  titleSw: z.string().min(5),
  description: z.string().min(10),
  descriptionSw: z.string().min(10),
  ctaLabel: z.string().min(2),
  ctaLabelSw: z.string().min(2),
  ctaHref: z.string().min(1),
})

export const testimonialFormSchema = z.object({
  id: z.string().optional().or(z.literal("")),
  name: z.string().min(2),
  city: z.string().min(2),
  role: z.string().min(2),
  roleSw: z.string().min(2),
  quote: z.string().min(10),
  quoteSw: z.string().min(10),
  rating: z.coerce.number().int().min(1).max(5),
})

export const siteSettingsFormSchema = z.object({
  storeName: z.string().min(2),
  tagline: z.string().min(5),
  supportPhone: z.string().min(7),
  supportEmail: z.string().email(),
  whatsappPhone: z.string().min(7),
  address: z.string().min(5),
  defaultDeliveryLead: z.string().min(3),
  regions: z.string().min(2),
})
