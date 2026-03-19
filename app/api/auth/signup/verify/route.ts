import { NextResponse } from "next/server"

import { provisionCustomerAccountFromSignupPayload, isSignupPayload } from "@/lib/account-provisioning"
import { consumeVerificationCode } from "@/lib/auth-codes"
import { recordAuditEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { verificationCodeSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "signup-verify"), 6, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const body = await request.json()
  const parsed = verificationCodeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid verification payload." }, { status: 400 })
  }

  const verification = await consumeVerificationCode({
    email: parsed.data.email,
    purpose: "SIGNUP",
    code: parsed.data.code,
  })

  if (!verification || !isSignupPayload(verification.payload)) {
    return NextResponse.json({ error: "Invalid or expired verification code." }, { status: 400 })
  }

  const signupPayload = verification.payload

  const account = await prisma.$transaction(async (tx) => {
    return provisionCustomerAccountFromSignupPayload(tx, signupPayload)
  })

  await recordAuditEvent({
    action: "CREATE",
    entityType: "CustomerAccount",
    entityId: account.customer.id,
    message: `Verified and created customer account for ${account.user.email}.`,
    userId: account.user.id,
  })

  return NextResponse.json({ ok: true })
}
