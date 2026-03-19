import { NextResponse } from "next/server"

import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { newsletterSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "newsletter"), 10, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = newsletterSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email address." }, { status: 400 })
  }

  try {
    await prisma.newsletter.upsert({
      where: { email: parsed.data.email.toLowerCase() },
      update: {},
      create: { email: parsed.data.email.toLowerCase() },
    })
  } catch {
    return NextResponse.json({ error: "Could not subscribe right now." }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
