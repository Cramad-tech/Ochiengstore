import type { Prisma } from "@prisma/client"

export type SignupPayload = {
  firstName: string
  lastName: string
  email: string
  phone: string
  region: string
  city: string
  district: string
  addressLine: string
  passwordHash: string
}

export function isSignupPayload(value: Prisma.JsonValue | null): value is SignupPayload {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false
  }

  return [
    "firstName",
    "lastName",
    "email",
    "phone",
    "region",
    "city",
    "addressLine",
    "passwordHash",
  ].every((key) => typeof (value as Record<string, unknown>)[key] === "string")
}

export async function provisionCustomerAccountFromSignupPayload(
  tx: Prisma.TransactionClient,
  payload: SignupPayload,
) {
  const fullName = `${payload.firstName} ${payload.lastName}`.trim()
  const normalizedEmail = payload.email.toLowerCase()

  const existingVerifiedUser = await tx.user.findUnique({
    where: { email: normalizedEmail },
    select: { id: true, emailVerifiedAt: true },
  })

  if (existingVerifiedUser?.emailVerifiedAt) {
    throw new Error("This email is already registered.")
  }

  const user = existingVerifiedUser
    ? await tx.user.update({
        where: { id: existingVerifiedUser.id },
        data: {
          name: fullName,
          phone: payload.phone,
          passwordHash: payload.passwordHash,
          emailVerifiedAt: new Date(),
          isActive: true,
        },
      })
    : await tx.user.create({
        data: {
          name: fullName,
          email: normalizedEmail,
          phone: payload.phone,
          passwordHash: payload.passwordHash,
          emailVerifiedAt: new Date(),
          isActive: true,
        },
      })

  const customer = await tx.customer.upsert({
    where: { userId: user.id },
    update: {
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      email: normalizedEmail,
    },
    create: {
      userId: user.id,
      firstName: payload.firstName,
      lastName: payload.lastName,
      phone: payload.phone,
      email: normalizedEmail,
    },
  })

  const existingDefaultAddress = await tx.address.findFirst({
    where: {
      customerId: customer.id,
      isDefault: true,
    },
    select: { id: true },
  })

  if (existingDefaultAddress) {
    await tx.address.update({
      where: { id: existingDefaultAddress.id },
      data: {
        label: "Primary delivery address",
        recipientName: fullName,
        phone: payload.phone,
        line1: payload.addressLine,
        city: payload.city,
        region: payload.region,
        district: payload.district || null,
        isDefault: true,
      },
    })
  } else {
    await tx.address.create({
      data: {
        customerId: customer.id,
        label: "Primary delivery address",
        recipientName: fullName,
        phone: payload.phone,
        line1: payload.addressLine,
        city: payload.city,
        region: payload.region,
        district: payload.district || null,
        isDefault: true,
      },
    })
  }

  await tx.cart.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  })

  await tx.wishlist.upsert({
    where: { customerId: customer.id },
    update: {},
    create: { customerId: customer.id },
  })

  return { user, customer }
}
