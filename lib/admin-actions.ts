"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { hash } from "bcryptjs"

import { prisma } from "@/lib/prisma"
import { parseCurrencyInput, toSentenceCase } from "@/lib/format"
import { recordAuditEvent } from "@/lib/audit"
import { requireAdminSession, requireSuperAdminSession } from "@/lib/auth-helpers"
import { setFlashMessage } from "@/lib/flash"
import { validateManagedImageUrl, validateManagedVideoUrl } from "@/lib/media"
import { isSignupPayload, provisionCustomerAccountFromSignupPayload } from "@/lib/account-provisioning"
import {
  bannerFormSchema,
  brandFormSchema,
  categoryFormSchema,
  couponFormSchema,
  managedUserCreateSchema,
  managedUserUpdateSchema,
  orderStatusSchema,
  pendingSignupApprovalSchema,
  productFormSchema,
  reviewModerationSchema,
  siteSettingsFormSchema,
  testimonialFormSchema,
} from "@/lib/validation"

function listFromMultiline(value: string) {
  return value
    .split(/\r?\n|,/)
    .map((item) => item.trim())
    .filter(Boolean)
}

function parseSpecificationsInput(value: string) {
  return value
    .split(/\r?\n/)
    .map((row) => row.trim())
    .filter(Boolean)
    .map((row, index) => {
      const [group = "General", label = "", ...rest] = row.split("|").map((part) => part.trim())
      const valuePart = rest.join(" | ").trim()

      if (!label || !valuePart) {
        return null
      }

      return {
        groupName: group || "General",
        label,
        value: valuePart,
        sortOrder: index,
      }
    })
    .filter((item): item is { groupName: string; label: string; value: string; sortOrder: number } => Boolean(item))
}

function collectImageUrls(primaryImage: string, galleryInput: string) {
  return [primaryImage, ...listFromMultiline(galleryInput)]
    .map((value) => value.trim())
    .filter(Boolean)
    .map((value) => validateManagedImageUrl(value))
    .filter((value, index, array) => array.indexOf(value) === index)
}

function resolveAvailabilityStatus(stock: number) {
  if (stock > 5) return "IN_STOCK" as const
  if (stock > 0) return "LOW_STOCK" as const
  return "OUT_OF_STOCK" as const
}

function parseOptionalDate(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || value.trim().length === 0) {
    return null
  }

  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

async function refreshProductReviewSummary(productId: string) {
  const [aggregate, reviewCount] = await Promise.all([
    prisma.review.aggregate({
      where: {
        productId,
        status: "APPROVED",
      },
      _avg: { rating: true },
    }),
    prisma.review.count({
      where: {
        productId,
        status: "APPROVED",
      },
    }),
  ])

  await prisma.product.update({
    where: { id: productId },
    data: {
      averageRating: aggregate._avg.rating ?? 0,
      reviewCount,
    },
  })
}

export async function upsertCategoryAction(formData: FormData) {
  await requireAdminSession()

  const payload = categoryFormSchema.parse({
    name: formData.get("name"),
    nameSw: formData.get("nameSw"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    descriptionSw: formData.get("descriptionSw"),
    icon: formData.get("icon"),
  })

  const category = await prisma.category.upsert({
    where: { slug: payload.slug },
    update: payload,
    create: payload,
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Category",
    entityId: category.id,
    message: `Saved category ${payload.name}.`,
    metadata: { slug: payload.slug },
  })

  revalidatePath("/admin/categories")
  revalidatePath("/categories")
  revalidatePath("/shop")
  await setFlashMessage({ type: "success", title: "Category saved", message: `${payload.name} is ready on the catalog.` })
}

export async function deleteCategoryAction(formData: FormData) {
  await requireAdminSession()

  const slug = String(formData.get("slug") ?? "")
  if (!slug) return

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (!category) {
    return
  }

  if (category._count.products > 0) {
    await recordAuditEvent({
      action: "DELETE",
      entityType: "Category",
      entityId: category.id,
      message: `Blocked deletion for category ${category.name} because products are still attached.`,
      metadata: { slug },
    })
    await setFlashMessage({
      type: "error",
      title: "Category still in use",
      message: `${category.name} still has products attached, so it cannot be deleted yet.`,
    })
    return
  }

  await prisma.category.delete({
    where: { slug },
  })

  await recordAuditEvent({
    action: "DELETE",
    entityType: "Category",
    entityId: category.id,
    message: `Deleted category ${category.name}.`,
    metadata: { slug },
  })

  revalidatePath("/admin/categories")
  revalidatePath("/categories")
  revalidatePath("/shop")
  await setFlashMessage({ type: "success", title: "Category deleted", message: `${category.name} has been removed.` })
}

export async function upsertBrandAction(formData: FormData) {
  await requireAdminSession()

  const payload = brandFormSchema.parse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    country: formData.get("country"),
  })

  const brand = await prisma.brand.upsert({
    where: { slug: payload.slug },
    update: {
      ...payload,
      featured: formData.get("featured") === "on",
    },
    create: {
      ...payload,
      featured: formData.get("featured") === "on",
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Brand",
    entityId: brand.id,
    message: `Saved brand ${payload.name}.`,
    metadata: { slug: payload.slug },
  })

  revalidatePath("/admin/brands")
  revalidatePath("/brands")
  revalidatePath("/shop")
  await setFlashMessage({ type: "success", title: "Brand saved", message: `${payload.name} is updated for the storefront.` })
}

export async function deleteBrandAction(formData: FormData) {
  await requireAdminSession()

  const slug = String(formData.get("slug") ?? "")
  if (!slug) return

  const brand = await prisma.brand.findUnique({
    where: { slug },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  })

  if (!brand) {
    return
  }

  if (brand._count.products > 0) {
    await recordAuditEvent({
      action: "DELETE",
      entityType: "Brand",
      entityId: brand.id,
      message: `Blocked deletion for brand ${brand.name} because products are still attached.`,
      metadata: { slug },
    })
    await setFlashMessage({
      type: "error",
      title: "Brand still in use",
      message: `${brand.name} cannot be deleted while products still belong to it.`,
    })
    return
  }

  await prisma.brand.delete({
    where: { slug },
  })

  await recordAuditEvent({
    action: "DELETE",
    entityType: "Brand",
    entityId: brand.id,
    message: `Deleted brand ${brand.name}.`,
    metadata: { slug },
  })

  revalidatePath("/admin/brands")
  revalidatePath("/brands")
  revalidatePath("/shop")
  await setFlashMessage({ type: "success", title: "Brand deleted", message: `${brand.name} has been removed.` })
}

export async function upsertProductAction(formData: FormData) {
  await requireAdminSession()

  const payload = productFormSchema.parse({
    name: formData.get("name"),
    nameSw: formData.get("nameSw"),
    sku: formData.get("sku"),
    slug: formData.get("slug"),
    brandSlug: formData.get("brandSlug"),
    categorySlug: formData.get("categorySlug"),
    subcategorySlug: formData.get("subcategorySlug"),
    modelNumber: formData.get("modelNumber"),
    price: parseCurrencyInput(formData.get("price")),
    discountPrice: formData.get("discountPrice") ? parseCurrencyInput(formData.get("discountPrice")) : undefined,
    stock: Number(formData.get("stock")),
    warrantyMonths: Number(formData.get("warrantyMonths")),
    shortDescription: formData.get("shortDescription"),
    shortDescriptionSw: formData.get("shortDescriptionSw"),
    description: formData.get("description"),
    descriptionSw: formData.get("descriptionSw"),
    image: formData.get("image"),
    gallery: formData.get("gallery"),
    videoUrl: formData.get("videoUrl"),
    energyDetails: formData.get("energyDetails"),
    dimensions: formData.get("dimensions"),
    weightKg: Number(formData.get("weightKg")),
    installationInfo: formData.get("installationInfo"),
    keyFeatures: formData.get("keyFeatures"),
    keyFeaturesSw: formData.get("keyFeaturesSw"),
    specifications: formData.get("specifications"),
  })

  const brand = await prisma.brand.findUniqueOrThrow({
    where: { slug: payload.brandSlug },
  })
  const category = await prisma.category.findUniqueOrThrow({
    where: { slug: payload.categorySlug },
  })
  const subcategory = await prisma.subcategory.upsert({
    where: { slug: payload.subcategorySlug },
    update: {
      name: toSentenceCase(payload.subcategorySlug),
      nameSw: toSentenceCase(payload.subcategorySlug),
      categoryId: category.id,
    },
    create: {
      slug: payload.subcategorySlug,
      name: toSentenceCase(payload.subcategorySlug),
      nameSw: toSentenceCase(payload.subcategorySlug),
      categoryId: category.id,
    },
  })

  const normalizedVideoUrl =
    typeof payload.videoUrl === "string" && payload.videoUrl.trim().length > 0
      ? validateManagedVideoUrl(payload.videoUrl)
      : null

  const savedProduct = await prisma.product.upsert({
    where: { slug: payload.slug },
    update: {
      name: payload.name,
      nameSw: payload.nameSw,
      sku: payload.sku,
      brandId: brand.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      modelNumber: payload.modelNumber,
      price: payload.price,
      discountPrice: payload.discountPrice ?? null,
      availabilityStatus: resolveAvailabilityStatus(payload.stock),
      warrantyPeriodMonths: payload.warrantyMonths,
      shortDescription: payload.shortDescription,
      shortDescriptionSw: payload.shortDescriptionSw,
      fullDescription: payload.description,
      fullDescriptionSw: payload.descriptionSw,
      keyFeatures: listFromMultiline(payload.keyFeatures),
      keyFeaturesSw: listFromMultiline(payload.keyFeaturesSw),
      energyDetails: payload.energyDetails,
      dimensions: payload.dimensions,
      weightKg: payload.weightKg,
      videoUrl: normalizedVideoUrl,
      featured: formData.get("featured") === "on",
      trending: formData.get("trending") === "on",
      newArrival: formData.get("newArrival") === "on",
      deliveryEligible: formData.get("deliveryEligible") === "on",
      installationInfo: payload.installationInfo || null,
      published: formData.get("published") === "on",
    },
    create: {
      slug: payload.slug,
      name: payload.name,
      nameSw: payload.nameSw,
      sku: payload.sku,
      brandId: brand.id,
      categoryId: category.id,
      subcategoryId: subcategory.id,
      modelNumber: payload.modelNumber,
      price: payload.price,
      discountPrice: payload.discountPrice ?? null,
      availabilityStatus: resolveAvailabilityStatus(payload.stock),
      warrantyPeriodMonths: payload.warrantyMonths,
      shortDescription: payload.shortDescription,
      shortDescriptionSw: payload.shortDescriptionSw,
      fullDescription: payload.description,
      fullDescriptionSw: payload.descriptionSw,
      keyFeatures: listFromMultiline(payload.keyFeatures),
      keyFeaturesSw: listFromMultiline(payload.keyFeaturesSw),
      energyDetails: payload.energyDetails,
      dimensions: payload.dimensions,
      weightKg: payload.weightKg,
      videoUrl: normalizedVideoUrl,
      featured: formData.get("featured") === "on",
      trending: formData.get("trending") === "on",
      newArrival: formData.get("newArrival") === "on",
      deliveryEligible: formData.get("deliveryEligible") === "on",
      installationInfo: payload.installationInfo || null,
      published: formData.get("published") === "on",
    },
  })

  await prisma.productImage.deleteMany({ where: { productId: savedProduct.id } })
  await prisma.productSpecification.deleteMany({ where: { productId: savedProduct.id } })

  const images = collectImageUrls(payload.image, payload.gallery ?? "")
  if (images.length > 0) {
    await prisma.productImage.createMany({
      data: images.map((image, index) => ({
        productId: savedProduct.id,
        url: image,
        isPrimary: index === 0,
        position: index,
      })),
    })
  }

  const specifications = parseSpecificationsInput(payload.specifications ?? "")
  if (specifications.length > 0) {
    await prisma.productSpecification.createMany({
      data: specifications.map((item) => ({
        productId: savedProduct.id,
        ...item,
      })),
    })
  }

  await prisma.inventory.upsert({
    where: { productId: savedProduct.id },
    update: { quantity: payload.stock },
    create: {
      productId: savedProduct.id,
      quantity: payload.stock,
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Product",
    entityId: savedProduct.id,
    message: `Saved product ${payload.name}.`,
    metadata: { slug: payload.slug, sku: payload.sku },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  revalidatePath(`/products/${payload.slug}`)
  await setFlashMessage({ type: "success", title: "Product saved", message: `${payload.name} is live and ready for shoppers.` })
}

export async function deleteProductAction(formData: FormData) {
  await requireAdminSession()

  const slug = String(formData.get("slug") ?? "")
  if (!slug) return

  const product = await prisma.product.findUnique({ where: { slug } })
  if (!product) {
    return
  }

  await prisma.product.delete({
    where: { slug },
  })

  await recordAuditEvent({
    action: "DELETE",
    entityType: "Product",
    entityId: product.id,
    message: `Deleted product ${product.name}.`,
    metadata: { slug },
  })

  revalidatePath("/admin/products")
  revalidatePath("/shop")
  await setFlashMessage({ type: "success", title: "Product deleted", message: `${product.name} has been removed from the catalog.` })
}

export async function updateOrderStatusAction(formData: FormData) {
  await requireAdminSession()

  const payload = orderStatusSchema.parse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
    paymentStatus: formData.get("paymentStatus"),
  })

  const order = await prisma.order.update({
    where: { id: payload.orderId },
    data: {
      status: payload.status,
      payments: {
        updateMany: {
          where: {},
          data: {
            status: payload.paymentStatus,
          },
        },
      },
    },
    include: {
      payments: true,
    },
  })

  await recordAuditEvent({
    action: "ORDER_UPDATE",
    entityType: "Order",
    entityId: order.id,
    message: `Updated order ${order.orderNumber} to ${payload.status}.`,
    metadata: { paymentStatus: payload.paymentStatus },
  })

  revalidatePath("/admin/orders")
  await setFlashMessage({
    type: "success",
    title: "Order updated",
    message: `${order.orderNumber} is now ${payload.status.replaceAll("_", " ").toLowerCase()}.`,
  })
}

export async function moderateReviewAction(formData: FormData) {
  await requireAdminSession()

  const payload = reviewModerationSchema.parse({
    reviewId: formData.get("reviewId"),
    status: formData.get("status"),
  })

  const review = await prisma.review.update({
    where: { id: payload.reviewId },
    data: {
      status: payload.status,
    },
    include: {
      product: true,
    },
  })

  await refreshProductReviewSummary(review.productId)
  await recordAuditEvent({
    action: "REVIEW_MODERATE",
    entityType: "Review",
    entityId: review.id,
    message: `Review for ${review.product.name} set to ${payload.status}.`,
    metadata: { productSlug: review.product.slug },
  })

  revalidatePath("/admin/reviews")
  revalidatePath(`/products/${review.product.slug}`)
  await setFlashMessage({
    type: "success",
    title: "Review updated",
    message: `The review for ${review.product.name} is now ${payload.status.toLowerCase()}.`,
  })
}

export async function updateSiteSettingsAction(formData: FormData) {
  await requireAdminSession()

  const payload = siteSettingsFormSchema.parse({
    storeName: formData.get("storeName"),
    tagline: formData.get("tagline"),
    supportPhone: formData.get("supportPhone"),
    supportEmail: formData.get("supportEmail"),
    whatsappPhone: formData.get("whatsappPhone"),
    address: formData.get("address"),
    defaultDeliveryLead: formData.get("defaultDeliveryLead"),
    regions: formData.get("regions"),
  })

  const entries = [
    ["storeName", payload.storeName],
    ["tagline", payload.tagline],
    ["supportPhone", payload.supportPhone],
    ["supportEmail", payload.supportEmail],
    ["whatsappPhone", payload.whatsappPhone],
    ["address", payload.address],
    ["defaultDeliveryLead", payload.defaultDeliveryLead],
    ["regions", listFromMultiline(payload.regions)],
  ] as const

  for (const [key, value] of entries) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  }

  await recordAuditEvent({
    action: "SETTINGS_UPDATE",
    entityType: "SiteSetting",
    message: "Updated store contact and regional settings.",
  })

  revalidatePath("/admin/settings")
  revalidatePath("/")
  revalidatePath("/contact")
  revalidatePath("/checkout")
  await setFlashMessage({ type: "success", title: "Settings saved", message: "Store contacts and regional settings have been updated." })
}

export async function upsertCouponAction(formData: FormData) {
  await requireAdminSession()

  const payload = couponFormSchema.parse({
    code: formData.get("code"),
    name: formData.get("name"),
    description: formData.get("description"),
    discountType: formData.get("discountType"),
    discountValue: Number(formData.get("discountValue")),
    minOrderAmount: formData.get("minOrderAmount") ? parseCurrencyInput(formData.get("minOrderAmount")) : undefined,
    maxDiscountAmount: formData.get("maxDiscountAmount") ? parseCurrencyInput(formData.get("maxDiscountAmount")) : undefined,
    usageLimit: formData.get("usageLimit") ? Number(formData.get("usageLimit")) : undefined,
  })
  const originalCode = String(formData.get("originalCode") ?? payload.code).toUpperCase()
  const normalizedCode = payload.code.toUpperCase()

  const coupon = await prisma.coupon.upsert({
    where: { code: originalCode },
    update: {
      code: normalizedCode,
      name: payload.name,
      description: payload.description || null,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minOrderAmount: payload.minOrderAmount ?? null,
      maxDiscountAmount: payload.maxDiscountAmount ?? null,
      usageLimit: payload.usageLimit ?? null,
      startsAt: parseOptionalDate(formData.get("startsAt")),
      expiresAt: parseOptionalDate(formData.get("expiresAt")),
      active: formData.get("active") === "on",
    },
    create: {
      code: normalizedCode,
      name: payload.name,
      description: payload.description || null,
      discountType: payload.discountType,
      discountValue: payload.discountValue,
      minOrderAmount: payload.minOrderAmount ?? null,
      maxDiscountAmount: payload.maxDiscountAmount ?? null,
      usageLimit: payload.usageLimit ?? null,
      startsAt: parseOptionalDate(formData.get("startsAt")),
      expiresAt: parseOptionalDate(formData.get("expiresAt")),
      active: formData.get("active") === "on",
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Coupon",
    entityId: coupon.id,
    message: `Saved coupon ${coupon.code}.`,
  })

  revalidatePath("/admin/coupons")
  await setFlashMessage({ type: "success", title: "Coupon saved", message: `${coupon.code} is ready to use.` })
}

export async function deleteCouponAction(formData: FormData) {
  await requireAdminSession()

  const code = String(formData.get("code") ?? "").toUpperCase()
  if (!code) return

  const coupon = await prisma.coupon.findUnique({
    where: { code },
  })

  if (!coupon) {
    return
  }

  await prisma.coupon.delete({
    where: { code },
  })

  await recordAuditEvent({
    action: "DELETE",
    entityType: "Coupon",
    entityId: coupon.id,
    message: `Deleted coupon ${coupon.code}.`,
  })

  revalidatePath("/admin/coupons")
  await setFlashMessage({ type: "success", title: "Coupon deleted", message: `${coupon.code} has been removed.` })
}

export async function upsertBannerAction(formData: FormData) {
  await requireAdminSession()

  const payload = bannerFormSchema.parse({
    eyebrow: formData.get("eyebrow"),
    eyebrowSw: formData.get("eyebrowSw"),
    title: formData.get("title"),
    titleSw: formData.get("titleSw"),
    description: formData.get("description"),
    descriptionSw: formData.get("descriptionSw"),
    ctaLabel: formData.get("ctaLabel"),
    ctaLabelSw: formData.get("ctaLabelSw"),
    ctaHref: formData.get("ctaHref"),
  })

  const banner = await prisma.banner.upsert({
    where: { placement: "HOME_HERO" },
    update: {
      ...payload,
      active: formData.get("active") === "on",
      imageUrl:
        typeof formData.get("imageUrl") === "string" && String(formData.get("imageUrl")).trim()
          ? validateManagedImageUrl(String(formData.get("imageUrl")))
          : null,
    },
    create: {
      placement: "HOME_HERO",
      ...payload,
      active: formData.get("active") === "on",
      imageUrl:
        typeof formData.get("imageUrl") === "string" && String(formData.get("imageUrl")).trim()
          ? validateManagedImageUrl(String(formData.get("imageUrl")))
          : null,
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Banner",
    entityId: banner.id,
    message: "Updated the homepage hero banner.",
  })

  revalidatePath("/admin/content")
  revalidatePath("/")
  await setFlashMessage({ type: "success", title: "Homepage banner saved", message: "The homepage hero content is updated." })
}

export async function upsertTestimonialAction(formData: FormData) {
  await requireAdminSession()

  const payload = testimonialFormSchema.parse({
    id: formData.get("id"),
    name: formData.get("name"),
    city: formData.get("city"),
    role: formData.get("role"),
    roleSw: formData.get("roleSw"),
    quote: formData.get("quote"),
    quoteSw: formData.get("quoteSw"),
    rating: formData.get("rating"),
  })

  const testimonial = payload.id
    ? await prisma.testimonial.update({
        where: { id: payload.id },
        data: {
          name: payload.name,
          city: payload.city,
          role: payload.role,
          roleSw: payload.roleSw,
          quote: payload.quote,
          quoteSw: payload.quoteSw,
          rating: payload.rating,
          featured: formData.get("featured") === "on",
        },
      })
    : await prisma.testimonial.upsert({
        where: {
          name_city: {
            name: payload.name,
            city: payload.city,
          },
        },
        update: {
          role: payload.role,
          roleSw: payload.roleSw,
          quote: payload.quote,
          quoteSw: payload.quoteSw,
          rating: payload.rating,
          featured: formData.get("featured") === "on",
        },
        create: {
          name: payload.name,
          city: payload.city,
          role: payload.role,
          roleSw: payload.roleSw,
          quote: payload.quote,
          quoteSw: payload.quoteSw,
          rating: payload.rating,
          featured: formData.get("featured") === "on",
        },
      })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "Testimonial",
    entityId: testimonial.id,
    message: `Saved testimonial for ${testimonial.name}.`,
  })

  revalidatePath("/admin/content")
  revalidatePath("/")
  revalidatePath("/about")
  await setFlashMessage({ type: "success", title: "Testimonial saved", message: `Customer story for ${testimonial.name} has been updated.` })
}

export async function deleteTestimonialAction(formData: FormData) {
  await requireAdminSession()

  const id = String(formData.get("id") ?? "")
  if (!id) return

  const testimonial = await prisma.testimonial.findUnique({
    where: { id },
  })

  if (!testimonial) {
    return
  }

  await prisma.testimonial.delete({
    where: { id },
  })

  await recordAuditEvent({
    action: "DELETE",
    entityType: "Testimonial",
    entityId: testimonial.id,
    message: `Deleted testimonial for ${testimonial.name}.`,
  })

  revalidatePath("/admin/content")
  revalidatePath("/")
  revalidatePath("/about")
  await setFlashMessage({ type: "success", title: "Testimonial deleted", message: `Customer story for ${testimonial.name} has been removed.` })
}

export async function createManagedUserAction(formData: FormData) {
  await requireSuperAdminSession()

  const payload = managedUserCreateSchema.parse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    roleCode: formData.get("roleCode"),
    password: formData.get("password"),
  })

  const normalizedEmail = payload.email.toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true },
  })

  if (existingUser) {
    throw new Error("A user with this email already exists.")
  }

  const passwordHash = await hash(payload.password, 10)

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        name: payload.name,
        email: normalizedEmail,
        phone: payload.phone || null,
        passwordHash,
        emailVerifiedAt: new Date(),
        isActive: formData.get("isActive") === "on",
      },
    })

    if (payload.roleCode !== "CUSTOMER") {
      const role = await tx.role.findUniqueOrThrow({
        where: { code: payload.roleCode },
      })

      await tx.userRole.create({
        data: {
          userId: createdUser.id,
          roleId: role.id,
        },
      })
    }

    return createdUser
  })

  await recordAuditEvent({
    action: "CREATE",
    entityType: "User",
    entityId: user.id,
    message: `Created managed user ${normalizedEmail}.`,
    metadata: {
      roleCode: payload.roleCode,
      active: formData.get("isActive") === "on",
    },
  })

  revalidatePath("/admin/users")
  await setFlashMessage({ type: "success", title: "User created", message: `${normalizedEmail} can now access the website.` })
}

export async function updateManagedUserAction(formData: FormData) {
  await requireSuperAdminSession()

  const payload = managedUserUpdateSchema.parse({
    userId: formData.get("userId"),
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    roleCode: formData.get("roleCode"),
    password: formData.get("password"),
  })

  const normalizedEmail = payload.email.toLowerCase()
  const existingUser = await prisma.user.findUniqueOrThrow({
    where: { id: payload.userId },
  })

  const passwordHash = payload.password ? await hash(payload.password, 10) : null

  await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: payload.userId },
      data: {
        name: payload.name,
        email: normalizedEmail,
        phone: payload.phone || null,
        isActive: formData.get("isActive") === "on",
        ...(passwordHash ? { passwordHash } : {}),
      },
    })

    await tx.userRole.deleteMany({
      where: { userId: payload.userId },
    })

    if (payload.roleCode !== "CUSTOMER") {
      const role = await tx.role.findUniqueOrThrow({
        where: { code: payload.roleCode },
      })

      await tx.userRole.create({
        data: {
          userId: payload.userId,
          roleId: role.id,
        },
      })
    }
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "User",
    entityId: payload.userId,
    message: `Updated managed user ${existingUser.email}.`,
    metadata: {
      roleCode: payload.roleCode,
      active: formData.get("isActive") === "on",
      passwordReset: Boolean(payload.password),
    },
  })

  revalidatePath("/admin/users")
  await setFlashMessage({ type: "success", title: "User updated", message: `${normalizedEmail} has been updated.` })
}

export async function approvePendingSignupAction(formData: FormData) {
  await requireSuperAdminSession()

  const payload = pendingSignupApprovalSchema.parse({
    verificationId: formData.get("verificationId"),
  })

  const verification = await prisma.verificationCode.findUnique({
    where: { id: payload.verificationId },
  })

  if (!verification || !isSignupPayload(verification.payload)) {
    await setFlashMessage({
      type: "error",
      title: "Approval failed",
      message: "That signup request is missing or no longer valid.",
    })
    redirect("/admin/users")
  }

  let account: { user: { id: string; email: string }; customer: { id: string } }
  try {
    account = await prisma.$transaction(async (tx) => {
      const updatedVerification = await tx.verificationCode.update({
        where: { id: payload.verificationId },
        data: {
          consumedAt: new Date(),
        },
      })

      if (!isSignupPayload(updatedVerification.payload)) {
        throw new Error("The pending signup request payload is invalid.")
      }

      return provisionCustomerAccountFromSignupPayload(tx, updatedVerification.payload)
    })
  } catch (error) {
    await setFlashMessage({
      type: "error",
      title: "Approval failed",
      message: error instanceof Error ? error.message : "The pending signup could not be approved.",
    })
    redirect("/admin/users")
  }

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "SignupVerification",
    entityId: payload.verificationId,
    userId: account.user.id,
    message: `Manually approved signup for ${account.user.email}.`,
  })

  revalidatePath("/admin/users")
  revalidatePath("/login")
  await setFlashMessage({
    type: "success",
    title: "User verified",
    message: `${account.user.email} has been approved and can now sign in.`,
  })
}
