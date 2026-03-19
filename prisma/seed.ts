import { hash } from "bcryptjs"
import type { Prisma } from "@prisma/client"

import { prisma } from "../lib/prisma"
import { HOME_BANNER, STORE_BRANDS, STORE_CATEGORIES, STORE_PRODUCTS, STORE_TESTIMONIALS } from "../lib/demo-store"
import { FAQ_ITEMS, SITE_SETTINGS_FALLBACK, WHY_SHOP_WITH_US } from "../lib/site-content"

function titleFromSlug(slug: string) {
  return slug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}

async function main() {
  const permissions = [
    { code: "catalog.manage", name: "Manage catalog", description: "Create and update products, categories, and brands." },
    { code: "orders.manage", name: "Manage orders", description: "Review and update order/payment status." },
    { code: "reviews.manage", name: "Manage reviews", description: "Approve or reject product reviews." },
    { code: "content.manage", name: "Manage content", description: "Update banners, FAQs, and site settings." },
    { code: "users.manage", name: "Manage users", description: "Manage admins, support staff, and customers." },
  ]

  for (const permission of permissions) {
    await prisma.permission.upsert({
      where: { code: permission.code },
      update: permission,
      create: permission,
    })
  }

  const roles = [
    { code: "SUPER_ADMIN", name: "Super Admin", permissionCodes: permissions.map((permission) => permission.code) },
    { code: "MANAGER", name: "Manager", permissionCodes: ["catalog.manage", "orders.manage", "reviews.manage", "content.manage"] },
    { code: "EDITOR", name: "Editor", permissionCodes: ["catalog.manage", "content.manage"] },
    { code: "SUPPORT", name: "Support", permissionCodes: ["orders.manage", "reviews.manage"] },
  ]

  for (const role of roles) {
    const savedRole = await prisma.role.upsert({
      where: { code: role.code },
      update: { name: role.name },
      create: {
        code: role.code,
        name: role.name,
      },
    })

    for (const permissionCode of role.permissionCodes) {
      const permission = await prisma.permission.findUniqueOrThrow({
        where: { code: permissionCode },
      })

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: savedRole.id,
            permissionId: permission.id,
          },
        },
        update: {},
        create: {
          roleId: savedRole.id,
          permissionId: permission.id,
        },
      })
    }
  }

  const adminPassword = process.env.ADMIN_SEED_PASSWORD ?? "Ochieng@2026#"
  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? "Albert@ochiengstore.co.tz").toLowerCase()
  const passwordHash = await hash(adminPassword, 10)

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "Albert Ochieng",
      passwordHash,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
    create: {
      name: "Albert Ochieng",
      email: adminEmail,
      passwordHash,
      emailVerifiedAt: new Date(),
      isActive: true,
      phone: process.env.SUPPORT_PHONE ?? "+255 656 844 497",
    },
  })

  const superAdminRole = await prisma.role.findUniqueOrThrow({
    where: { code: "SUPER_ADMIN" },
  })

  await prisma.userRole.upsert({
    where: {
      userId_roleId: {
        userId: admin.id,
        roleId: superAdminRole.id,
      },
    },
    update: {},
    create: {
      userId: admin.id,
      roleId: superAdminRole.id,
    },
  })

  const customerPassword = process.env.CUSTOMER_SEED_PASSWORD ?? "Customer123!"
  const customerEmail = (process.env.CUSTOMER_SEED_EMAIL ?? "customer@ochiengstore.co.tz").toLowerCase()
  const customerPhone = process.env.CUSTOMER_SEED_PHONE ?? "+255 744 000 111"
  const customerPasswordHash = await hash(customerPassword, 10)

  const customerUser = await prisma.user.upsert({
    where: { email: customerEmail },
    update: {
      name: "Test Customer",
      phone: customerPhone,
      passwordHash: customerPasswordHash,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
    create: {
      name: "Test Customer",
      email: customerEmail,
      phone: customerPhone,
      passwordHash: customerPasswordHash,
      emailVerifiedAt: new Date(),
      isActive: true,
    },
  })

  const customerAccount = await prisma.customer.upsert({
    where: { userId: customerUser.id },
    update: {
      firstName: "Test",
      lastName: "Customer",
      phone: customerPhone,
      email: customerEmail,
    },
    create: {
      userId: customerUser.id,
      firstName: "Test",
      lastName: "Customer",
      phone: customerPhone,
      email: customerEmail,
    },
  })

  const existingDefaultAddress = await prisma.address.findFirst({
    where: {
      customerId: customerAccount.id,
      isDefault: true,
    },
  })

  if (existingDefaultAddress) {
    await prisma.address.update({
      where: { id: existingDefaultAddress.id },
      data: {
        recipientName: "Test Customer",
        phone: customerPhone,
        line1: "Sinza Mori Road",
        city: "Dar es Salaam",
        region: "Dar es Salaam",
        district: "Kinondoni",
        isDefault: true,
      },
    })
  } else {
    await prisma.address.create({
      data: {
        customerId: customerAccount.id,
        label: "Primary delivery address",
        recipientName: "Test Customer",
        phone: customerPhone,
        line1: "Sinza Mori Road",
        city: "Dar es Salaam",
        region: "Dar es Salaam",
        district: "Kinondoni",
        isDefault: true,
      },
    })
  }

  await prisma.cart.upsert({
    where: { customerId: customerAccount.id },
    update: {},
    create: { customerId: customerAccount.id },
  })

  await prisma.wishlist.upsert({
    where: { customerId: customerAccount.id },
    update: {},
    create: { customerId: customerAccount.id },
  })

  for (const category of STORE_CATEGORIES) {
    await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        nameSw: category.nameSw,
        description: category.description,
        descriptionSw: category.descriptionSw,
        icon: category.icon,
        featured: category.featured,
      },
      create: {
        slug: category.slug,
        name: category.name,
        nameSw: category.nameSw,
        description: category.description,
        descriptionSw: category.descriptionSw,
        icon: category.icon,
        featured: category.featured,
      },
    })
  }

  const uniqueSubcategories = new Map<string, { categorySlug: string; slug: string }>()
  for (const product of STORE_PRODUCTS) {
    uniqueSubcategories.set(product.subcategorySlug, {
      categorySlug: product.categorySlug,
      slug: product.subcategorySlug,
    })
  }

  for (const subcategory of uniqueSubcategories.values()) {
    const category = await prisma.category.findUniqueOrThrow({
      where: { slug: subcategory.categorySlug },
    })

    await prisma.subcategory.upsert({
      where: { slug: subcategory.slug },
      update: {
        name: titleFromSlug(subcategory.slug),
        nameSw: titleFromSlug(subcategory.slug),
        categoryId: category.id,
      },
      create: {
        slug: subcategory.slug,
        name: titleFromSlug(subcategory.slug),
        nameSw: titleFromSlug(subcategory.slug),
        categoryId: category.id,
      },
    })
  }

  for (const brand of STORE_BRANDS) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        description: brand.description,
        country: brand.country,
        featured: brand.featured,
      },
      create: {
        slug: brand.slug,
        name: brand.name,
        description: brand.description,
        country: brand.country,
        featured: brand.featured,
      },
    })
  }

  for (const product of STORE_PRODUCTS) {
    const brand = await prisma.brand.findUniqueOrThrow({ where: { slug: product.brandSlug } })
    const category = await prisma.category.findUniqueOrThrow({ where: { slug: product.categorySlug } })
    const subcategory = await prisma.subcategory.findUnique({ where: { slug: product.subcategorySlug } })

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        nameSw: product.nameSw,
        sku: product.sku,
        brandId: brand.id,
        categoryId: category.id,
        subcategoryId: subcategory?.id,
        modelNumber: product.modelNumber,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        availabilityStatus: product.availability,
        warrantyPeriodMonths: product.warrantyMonths,
        shortDescription: product.shortDescription,
        shortDescriptionSw: product.shortDescriptionSw,
        fullDescription: product.description,
        fullDescriptionSw: product.descriptionSw,
        keyFeatures: product.keyFeatures,
        keyFeaturesSw: product.keyFeaturesSw,
        energyDetails: product.energyDetails,
        dimensions: product.dimensions,
        weightKg: product.weightKg,
        videoUrl: product.videoUrl ?? null,
        featured: product.featured,
        trending: product.trending,
        newArrival: product.newArrival,
        averageRating: product.rating,
        reviewCount: product.reviewCount,
        deliveryEligible: product.deliveryEligible,
        installationInfo: product.installationInfo,
        published: true,
      },
      create: {
        slug: product.slug,
        name: product.name,
        nameSw: product.nameSw,
        sku: product.sku,
        brandId: brand.id,
        categoryId: category.id,
        subcategoryId: subcategory?.id,
        modelNumber: product.modelNumber,
        price: product.price,
        discountPrice: product.discountPrice ?? null,
        availabilityStatus: product.availability,
        warrantyPeriodMonths: product.warrantyMonths,
        shortDescription: product.shortDescription,
        shortDescriptionSw: product.shortDescriptionSw,
        fullDescription: product.description,
        fullDescriptionSw: product.descriptionSw,
        keyFeatures: product.keyFeatures,
        keyFeaturesSw: product.keyFeaturesSw,
        energyDetails: product.energyDetails,
        dimensions: product.dimensions,
        weightKg: product.weightKg,
        videoUrl: product.videoUrl ?? null,
        featured: product.featured,
        trending: product.trending,
        newArrival: product.newArrival,
        averageRating: product.rating,
        reviewCount: product.reviewCount,
        deliveryEligible: product.deliveryEligible,
        installationInfo: product.installationInfo,
        published: true,
      },
    })

    const savedProduct = await prisma.product.findUniqueOrThrow({
      where: { slug: product.slug },
    })

    await prisma.productImage.deleteMany({
      where: { productId: savedProduct.id },
    })
    await prisma.productSpecification.deleteMany({
      where: { productId: savedProduct.id },
    })

    await prisma.productImage.createMany({
      data: product.gallery.map((imageUrl, index) => ({
        productId: savedProduct.id,
        url: imageUrl,
        isPrimary: index === 0,
        position: index,
      })),
    })

    await prisma.productSpecification.createMany({
      data: product.technicalSpecifications.map((specification, index) => ({
        productId: savedProduct.id,
        groupName: specification.group,
        label: specification.label,
        value: specification.value,
        sortOrder: index,
      })),
    })

    await prisma.inventory.upsert({
      where: { productId: savedProduct.id },
      update: {
        quantity: product.stock,
        reservedQuantity: 0,
      },
      create: {
        productId: savedProduct.id,
        quantity: product.stock,
        reservedQuantity: 0,
        reorderLevel: 3,
      },
    })
  }

  for (const testimonial of STORE_TESTIMONIALS) {
    await prisma.testimonial.upsert({
      where: {
        name_city: {
          name: testimonial.name,
          city: testimonial.city,
        },
      },
      update: {
        role: testimonial.role,
        roleSw: testimonial.roleSw,
        quote: testimonial.quote,
        quoteSw: testimonial.quoteSw,
        rating: testimonial.rating,
      },
      create: {
        name: testimonial.name,
        city: testimonial.city,
        role: testimonial.role,
        roleSw: testimonial.roleSw,
        quote: testimonial.quote,
        quoteSw: testimonial.quoteSw,
        rating: testimonial.rating,
      },
    })
  }

  const starterCoupons = [
    {
      code: "KARIBU50",
      name: "Karibu savings",
      description: "Starter offer for qualifying appliance orders.",
      discountType: "FIXED_AMOUNT",
      discountValue: 50000,
      minOrderAmount: 500000,
      usageLimit: 200,
    },
    {
      code: "TVWEEK10",
      name: "TV week promo",
      description: "Limited television promotion.",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 800000,
      usageLimit: 75,
    },
  ]

  for (const coupon of starterCoupons) {
    await prisma.coupon.upsert({
      where: { code: coupon.code },
      update: coupon,
      create: coupon,
    })
  }

  await prisma.banner.upsert({
    where: { placement: "HOME_HERO" },
    update: {
      eyebrow: HOME_BANNER.eyebrow,
      eyebrowSw: HOME_BANNER.eyebrowSw,
      title: HOME_BANNER.title,
      titleSw: HOME_BANNER.titleSw,
      description: HOME_BANNER.description,
      descriptionSw: HOME_BANNER.descriptionSw,
      ctaLabel: HOME_BANNER.ctaLabel,
      ctaLabelSw: HOME_BANNER.ctaLabelSw,
      ctaHref: HOME_BANNER.ctaHref,
      active: true,
      sortOrder: 0,
    },
    create: {
      placement: "HOME_HERO",
      eyebrow: HOME_BANNER.eyebrow,
      eyebrowSw: HOME_BANNER.eyebrowSw,
      title: HOME_BANNER.title,
      titleSw: HOME_BANNER.titleSw,
      description: HOME_BANNER.description,
      descriptionSw: HOME_BANNER.descriptionSw,
      ctaLabel: HOME_BANNER.ctaLabel,
      ctaLabelSw: HOME_BANNER.ctaLabelSw,
      ctaHref: HOME_BANNER.ctaHref,
      active: true,
      sortOrder: 0,
    },
  })

  const siteSettings = {
    storeName: SITE_SETTINGS_FALLBACK.storeName,
    tagline: SITE_SETTINGS_FALLBACK.tagline,
    supportPhone: process.env.SUPPORT_PHONE ?? SITE_SETTINGS_FALLBACK.supportPhone,
    supportEmail: process.env.SUPPORT_EMAIL ?? SITE_SETTINGS_FALLBACK.supportEmail,
    whatsappPhone: process.env.WHATSAPP_PHONE ?? SITE_SETTINGS_FALLBACK.whatsappPhone,
    address: process.env.STORE_ADDRESS ?? SITE_SETTINGS_FALLBACK.address,
    defaultDeliveryLead: process.env.DEFAULT_DELIVERY_LEAD ?? SITE_SETTINGS_FALLBACK.defaultDeliveryLead,
    regions: SITE_SETTINGS_FALLBACK.regions,
    whyShopWithUs: WHY_SHOP_WITH_US,
    faqs: FAQ_ITEMS,
  }

  for (const [key, value] of Object.entries(siteSettings)) {
    await prisma.siteSetting.upsert({
      where: { key },
      update: { value: value as Prisma.InputJsonValue },
      create: { key, value: value as Prisma.InputJsonValue },
    })
  }

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: "CREATE",
      entityType: "Seed",
      message: "Initial Tanzania home appliances catalog seeded.",
    },
  })
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (error) => {
    console.error(error)
    await prisma.$disconnect()
    process.exit(1)
  })
