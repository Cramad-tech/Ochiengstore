"use server"

import { revalidatePath } from "next/cache"

import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import { recordAuditEvent } from "@/lib/audit"
import { setFlashMessage } from "@/lib/flash"
import { customerProfileSchema } from "@/lib/validation"

export async function updateCustomerProfileAction(formData: FormData) {
  const session = await auth()

  if (!session?.user?.id) {
    throw new Error("You must be signed in to update your account.")
  }

  const payload = customerProfileSchema.parse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    region: formData.get("region"),
    city: formData.get("city"),
    district: formData.get("district"),
    addressLine: formData.get("addressLine"),
  })

  const fullName = `${payload.firstName} ${payload.lastName}`.trim()

  const customer = await prisma.$transaction(async (tx) => {
    await tx.user.update({
      where: { id: session.user.id },
      data: {
        name: fullName,
        email: payload.email,
        phone: payload.phone,
      },
    })

    const existingCustomer = await tx.customer.findUnique({
      where: { userId: session.user.id },
      include: {
        addresses: {
          where: { isDefault: true },
          take: 1,
        },
      },
    })

    const savedCustomer = existingCustomer
      ? await tx.customer.update({
          where: { id: existingCustomer.id },
          data: {
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            email: payload.email,
          },
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        })
      : await tx.customer.create({
          data: {
            userId: session.user.id,
            firstName: payload.firstName,
            lastName: payload.lastName,
            phone: payload.phone,
            email: payload.email,
          },
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
          },
        })

    const defaultAddress = savedCustomer.addresses[0]

    if (defaultAddress) {
      await tx.address.update({
        where: { id: defaultAddress.id },
        data: {
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
          customerId: savedCustomer.id,
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
      where: { customerId: savedCustomer.id },
      update: {},
      create: { customerId: savedCustomer.id },
    })

    await tx.wishlist.upsert({
      where: { customerId: savedCustomer.id },
      update: {},
      create: { customerId: savedCustomer.id },
    })

    return savedCustomer
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "CustomerAccount",
    entityId: customer.id,
    message: "Updated customer account profile.",
    userId: session.user.id,
  })

  revalidatePath("/account")
  revalidatePath("/checkout")
  await setFlashMessage({
    type: "success",
    title: "Profile saved",
    message: "Your account and delivery details have been updated successfully.",
  })
}
