import { loadEnvConfig } from "@next/env"
import { PrismaClient } from "@prisma/client"

loadEnvConfig(process.cwd())

const prisma = new PrismaClient()

const REQUIRED_ENV_VARS = [
  "DATABASE_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_SITE_URL",
  "WHATSAPP_PHONE",
  "SUPPORT_PHONE",
  "SUPPORT_EMAIL",
] as const

function fail(message: string) {
  console.error(`ERROR: ${message}`)
  process.exitCode = 1
}

async function main() {
  const missing = REQUIRED_ENV_VARS.filter((key) => !process.env[key] || !process.env[key]?.trim())

  if (missing.length > 0) {
    fail(`Missing required environment variables: ${missing.join(", ")}`)
    return
  }

  const adminEmail = (process.env.ADMIN_SEED_EMAIL ?? "Albert@ochiengstore.co.tz").toLowerCase()
  const customerEmail = (process.env.CUSTOMER_SEED_EMAIL ?? "customer@ochiengstore.co.tz").toLowerCase()

  await prisma.$connect()

  const [
    categoryCount,
    brandCount,
    productCount,
    roleCount,
    siteSettingCount,
    supportRoomCount,
    adminUser,
    customerUser,
  ] = await Promise.all([
    prisma.category.count(),
    prisma.brand.count(),
    prisma.product.count(),
    prisma.role.count(),
    prisma.siteSetting.count(),
    prisma.supportConversation.count(),
    prisma.user.findUnique({
      where: { email: adminEmail },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    }),
    prisma.user.findUnique({
      where: { email: customerEmail },
      include: {
        customer: true,
      },
    }),
  ])

  const checks = [
    { label: "Categories seeded", ok: categoryCount > 0, detail: `${categoryCount}` },
    { label: "Brands seeded", ok: brandCount > 0, detail: `${brandCount}` },
    { label: "Products seeded", ok: productCount > 0, detail: `${productCount}` },
    { label: "Roles seeded", ok: roleCount >= 4, detail: `${roleCount}` },
    { label: "Site settings seeded", ok: siteSettingCount > 0, detail: `${siteSettingCount}` },
    { label: "Support room tables available", ok: supportRoomCount >= 0, detail: `${supportRoomCount}` },
    {
      label: "Admin test account exists",
      ok: Boolean(adminUser),
      detail: adminUser?.email ?? "missing",
    },
    {
      label: "Admin test account has an admin role",
      ok: adminUser?.userRoles?.some((entry) => ["SUPER_ADMIN", "MANAGER", "EDITOR", "SUPPORT"].includes(entry.role.code)) ?? false,
      detail: adminUser?.userRoles.map((entry) => entry.role.code).join(", ") || "missing",
    },
    {
      label: "Customer test account exists",
      ok: Boolean(customerUser),
      detail: customerUser?.email ?? "missing",
    },
    {
      label: "Customer profile exists",
      ok: Boolean(customerUser?.customer),
      detail: customerUser?.customer?.id ?? "missing",
    },
  ]

  console.log("Backend verification summary")
  console.log("--------------------------------")
  console.log(`Database URL host: ${new URL(process.env.DATABASE_URL!).host}`)
  console.log(`Support phone: ${process.env.SUPPORT_PHONE}`)
  console.log(`WhatsApp phone: ${process.env.WHATSAPP_PHONE}`)

  let hasFailures = false
  for (const check of checks) {
    const prefix = check.ok ? "PASS" : "FAIL"
    console.log(`${prefix}: ${check.label} (${check.detail})`)
    if (!check.ok) {
      hasFailures = true
    }
  }

  if (hasFailures) {
    fail("One or more backend verification checks failed.")
    return
  }

  console.log("All backend verification checks passed.")
}

main()
  .catch((error) => {
    fail(error instanceof Error ? error.message : "Unexpected backend verification failure.")
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
