import { NextResponse } from "next/server"

import { issueVerificationCode } from "@/lib/auth-codes"
import { recordAuditEvent } from "@/lib/audit"
import { sendVerificationCodeEmail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { passwordResetRequestSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "password-reset-request"), 4, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = passwordResetRequestSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email." }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true },
  })

  if (user) {
    const verification = await issueVerificationCode({
      email,
      purpose: "PASSWORD_RESET",
      userId: user.id,
    })

    const delivery = await sendVerificationCodeEmail({
      to: email,
      code: verification.code,
      title: "Reset your Ochieng Store password",
      message: "Use this code to choose a new password for your account.",
    })

    await recordAuditEvent({
      action: "UPDATE",
      entityType: "PasswordReset",
      entityId: user.id,
      message: `Issued password reset code for ${email}.`,
      userId: user.id,
      metadata: {
        deliveryMode: delivery.mode,
      },
    })

    return NextResponse.json({
      ok: true,
      previewCode: delivery.mode === "preview" ? delivery.previewCode : undefined,
    })
  }

  return NextResponse.json({ ok: true })
}
