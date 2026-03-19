import { hash } from "bcryptjs"
import { NextResponse } from "next/server"

import { consumeVerificationCode } from "@/lib/auth-codes"
import { recordAuditEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { passwordResetSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "password-reset"), 5, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = passwordResetSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid reset payload." }, { status: 400 })
  }

  const verification = await consumeVerificationCode({
    email: parsed.data.email,
    purpose: "PASSWORD_RESET",
    code: parsed.data.code,
  })

  if (!verification) {
    return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 })
  }

  const passwordHash = await hash(parsed.data.password, 10)
  const email = parsed.data.email.toLowerCase()

  const user = await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      emailVerifiedAt: {
        set: new Date(),
      },
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "PasswordReset",
    entityId: user.id,
    userId: user.id,
    message: `Reset password for ${email}.`,
  })

  return NextResponse.json({ ok: true })
}
