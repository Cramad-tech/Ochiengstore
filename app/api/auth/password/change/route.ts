import { hash, compare } from "bcryptjs"
import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { recordAuditEvent } from "@/lib/audit"
import { prisma } from "@/lib/prisma"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"
import { passwordChangeSchema } from "@/lib/validation"

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "password-change"), 5, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many requests." }, { status: 429 })
  }

  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json({ error: "You must be signed in." }, { status: 401 })
  }

  const body = await request.json()
  const parsed = passwordChangeSchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid password change payload." }, { status: 400 })
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, passwordHash: true, email: true },
  })

  if (!user?.passwordHash) {
    return NextResponse.json({ error: "Password change is not available for this account." }, { status: 400 })
  }

  const isCurrentPasswordValid = await compare(parsed.data.currentPassword, user.passwordHash)
  if (!isCurrentPasswordValid) {
    return NextResponse.json({ error: "Current password is incorrect." }, { status: 400 })
  }

  const passwordHash = await hash(parsed.data.newPassword, 10)
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "UserSecurity",
    entityId: user.id,
    userId: user.id,
    message: `Changed password for ${user.email}.`,
  })

  return NextResponse.json({ ok: true })
}
