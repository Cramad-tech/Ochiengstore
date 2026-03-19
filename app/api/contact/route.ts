import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { contactInquirySchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "contact"), 6, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = contactInquirySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid contact submission." }, { status: 400 })
  }

  try {
    await prisma.contactInquiry.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email,
        phone: parsed.data.phone || null,
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    })
  } catch {
    return NextResponse.json({ error: "Could not save your message right now." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
