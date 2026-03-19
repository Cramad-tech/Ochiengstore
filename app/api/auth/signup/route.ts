import { hash } from "bcryptjs"
import type { Prisma } from "@prisma/client"
import { NextResponse } from "next/server"

import { issueVerificationCode } from "@/lib/auth-codes"
import { recordAuditEvent } from "@/lib/audit"
import { sendVerificationCodeEmail } from "@/lib/mailer"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { customerSignupSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "signup-request"), 4, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = customerSignupSchema.safeParse(body)

  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0]?.message ?? "Invalid signup payload."
    return NextResponse.json({ error: firstIssue }, { status: 400 })
  }

  const email = parsed.data.email.toLowerCase()
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true, emailVerifiedAt: true },
  })

  if (existingUser?.emailVerifiedAt) {
    return NextResponse.json({ error: "An account with this email already exists." }, { status: 409 })
  }

  const passwordHash = await hash(parsed.data.password, 10)
  const verification = await issueVerificationCode({
    email,
    purpose: "SIGNUP",
    payload: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      email,
      phone: parsed.data.phone,
      region: parsed.data.region,
      city: parsed.data.city,
      district: parsed.data.district || "",
      addressLine: parsed.data.addressLine,
      passwordHash,
    } satisfies Prisma.InputJsonValue,
  })

  try {
    const delivery = await sendVerificationCodeEmail({
      to: email,
      code: verification.code,
      title: "Verify your Ochieng Store account",
      message: "Use this code to finish your account registration and continue to the login page.",
    })

    await recordAuditEvent({
      action: "CREATE",
      entityType: "SignupVerification",
      message: `Issued signup verification code for ${email}.`,
      metadata: {
        email,
        deliveryMode: delivery.mode,
      },
    })

    return NextResponse.json({
      ok: true,
      previewCode: delivery.mode === "preview" ? delivery.previewCode : undefined,
      manualApprovalRequired: false,
    })
  } catch (error) {
    await recordAuditEvent({
      action: "CREATE",
      entityType: "SignupVerification",
      message: `Signup verification email delivery failed for ${email}; manual approval required.`,
      metadata: {
        email,
        manualApprovalRequired: true,
        error: error instanceof Error ? error.message : "Email delivery failed.",
      },
    })

    return NextResponse.json({
      ok: true,
      manualApprovalRequired: true,
      message: "If Google will not send verification, wait for Albert Ochieng to verify you.",
    })
  }
}
