import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { orderTrackingSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "tracking"), 12, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = orderTrackingSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid tracking request." }, { status: 400 })
  }

  const orderResult = await prisma.order
    .findFirst({
      where: {
        orderNumber: parsed.data.orderNumber,
        OR: [
          { guestPhone: parsed.data.phone },
          {
            customer: {
              is: {
                phone: parsed.data.phone,
              },
            },
          },
          {
            shippingAddress: {
              is: {
                phone: parsed.data.phone,
              },
            },
          },
        ],
      },
      include: {
        items: true,
        payments: true,
      },
    })
    .catch(() => "__DB_ERROR__" as const)

  if (orderResult === "__DB_ERROR__") {
    return NextResponse.json({ error: "Could not look up this order right now." }, { status: 500 })
  }

  const order = orderResult

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 })
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.payments[0]?.status ?? "PENDING",
    total: order.grandTotal,
    items: order.items.map((item: (typeof order.items)[number]) => ({
      name: item.productName,
      quantity: item.quantity,
    })),
  })
}
