import { NextResponse } from "next/server"
import type { Prisma } from "@prisma/client"

import { auth } from "@/auth"
import { calculateCheckoutTotals, generateOrderNumber, buildPaymentInstructions } from "@/lib/commerce"
import { recordAuditEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { checkoutSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "checkout"), 4, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = checkoutSchema.safeParse(body)
  const session = await auth()

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid checkout payload."
    return NextResponse.json({ error: firstIssue }, { status: 400 })
  }

  const totals = calculateCheckoutTotals(parsed.data)
  const orderNumber = generateOrderNumber()
  const productSlugs = parsed.data.items.map((item) => item.slug)

  const order = await prisma
    .$transaction(async (tx: Prisma.TransactionClient) => {
      const [products, existingCustomer] = await Promise.all([
        tx.product.findMany({
          where: {
            slug: {
              in: productSlugs,
            },
          },
          select: {
            id: true,
            slug: true,
            sku: true,
            warrantyPeriodMonths: true,
          },
        }),
        tx.customer.findFirst({
          where: {
            OR: [
              ...(session?.user?.id ? [{ userId: session.user.id }] : []),
              { phone: parsed.data.phone },
              ...(parsed.data.email ? [{ email: parsed.data.email }] : []),
            ],
          },
        }),
      ])

      const [firstName, ...rest] = parsed.data.customerName.trim().split(/\s+/)
      const lastName = rest.join(" ") || firstName

      if (session?.user?.id) {
        await tx.user.update({
          where: { id: session.user.id },
          data: {
            name: parsed.data.customerName,
            phone: parsed.data.phone,
            ...(parsed.data.email ? { email: parsed.data.email } : {}),
          },
        })
      }

      const customer = existingCustomer
        ? await tx.customer.update({
            where: { id: existingCustomer.id },
            data: {
              userId: existingCustomer.userId ?? session?.user?.id ?? null,
              firstName,
              lastName,
              phone: parsed.data.phone,
              email: parsed.data.email || null,
            },
          })
        : await tx.customer.create({
            data: {
              userId: session?.user?.id ?? null,
              firstName,
              lastName,
              phone: parsed.data.phone,
              email: parsed.data.email || null,
            },
          })

      await Promise.all([
        tx.cart.upsert({
          where: { customerId: customer.id },
          update: {},
          create: { customerId: customer.id },
        }),
        tx.wishlist.upsert({
          where: { customerId: customer.id },
          update: {},
          create: { customerId: customer.id },
        }),
      ])

      const address = await tx.address.create({
        data: {
          customerId: customer.id,
          label: "Checkout delivery address",
          recipientName: parsed.data.customerName,
          phone: parsed.data.phone,
          line1: parsed.data.addressLine,
          city: parsed.data.city,
          region: parsed.data.region,
          district: parsed.data.district || null,
          isDefault: existingCustomer ? false : true,
        },
      })

      const productMap = new Map<string, (typeof products)[number]>(products.map((product: (typeof products)[number]) => [product.slug, product]))

      return tx.order.create({
        data: {
          orderNumber,
          customerId: customer.id,
          shippingAddressId: address.id,
          billingAddressId: address.id,
          guestName: parsed.data.customerName,
          guestEmail: parsed.data.email || null,
          guestPhone: parsed.data.phone,
          deliveryRegion: parsed.data.region,
          notes: parsed.data.notes || null,
          paymentMethod: parsed.data.paymentMethod,
          subtotal: totals.subtotal,
          deliveryFee: totals.deliveryFee,
          taxTotal: totals.taxTotal,
          grandTotal: totals.grandTotal,
          isWhatsappFollowUp: parsed.data.paymentMethod === "WHATSAPP_CONFIRMATION",
          items: {
            create: parsed.data.items.map((item) => {
              const product = productMap.get(item.slug)

              return {
                productId: product?.id,
                productName: item.name,
                productSlug: item.slug,
                sku: product?.sku ?? item.slug.toUpperCase(),
                quantity: item.quantity,
                unitPrice: item.discountPrice ?? item.price,
                totalPrice: (item.discountPrice ?? item.price) * item.quantity,
                warrantyMonths: product?.warrantyPeriodMonths ?? null,
              }
            }),
          },
          payments: {
            create: {
              amount: totals.grandTotal,
              method: parsed.data.paymentMethod,
              status: parsed.data.paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "AWAITING_CONFIRMATION",
              instructions: buildPaymentInstructions(parsed.data.paymentMethod, totals.grandTotal),
            },
          },
        },
        include: {
          payments: true,
        },
      })
    })
    .catch(() => null)

  if (!order) {
    return NextResponse.json({ error: "Could not create the order right now." }, { status: 500 })
  }

  await recordAuditEvent({
    action: "CREATE",
    entityType: "Order",
    entityId: order.id,
    message: `Created order ${order.orderNumber} from checkout.`,
    metadata: {
      paymentMethod: parsed.data.paymentMethod,
      itemCount: parsed.data.items.length,
    },
    userId: session?.user?.id ?? null,
  })

  return NextResponse.json({
    ok: true,
    orderNumber: order.orderNumber,
    paymentInstructions: order.payments[0]?.instructions,
  })
}
