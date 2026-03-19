import { NextResponse } from "next/server"

import { recordAuditEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { reviewSubmissionSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "review"), 5, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = reviewSubmissionSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid review submission." }, { status: 400 })
  }

  const productResult = await prisma.product
    .findUnique({
      where: { slug: parsed.data.productSlug },
    })
    .catch(() => "__DB_ERROR__" as const)

  if (productResult === "__DB_ERROR__") {
    return NextResponse.json({ error: "Could not look up that product right now." }, { status: 500 })
  }

  const product = productResult

  if (!product) {
    return NextResponse.json({ error: "Product not found." }, { status: 404 })
  }

  try {
    const review = await prisma.review.create({
      data: {
        productId: product.id,
        name: parsed.data.name,
        title: parsed.data.title || null,
        rating: parsed.data.rating,
        body: parsed.data.body,
        status: "PENDING",
        verifiedPurchase: false,
      },
    })

    await recordAuditEvent({
      action: "CREATE",
      entityType: "Review",
      entityId: review.id,
      message: `Review submitted for ${product.name}.`,
      metadata: { productSlug: product.slug },
      userId: null,
    })
  } catch {
    return NextResponse.json({ error: "Could not submit your review right now." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
