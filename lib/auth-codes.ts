import { createHash, randomInt } from "node:crypto"

import type { AuthCodePurpose, Prisma } from "@prisma/client"

import { prisma } from "@/lib/prisma"

const AUTH_CODE_TTL_MS = 15 * 60 * 1000

function normalizeEmail(email: string) {
  return email.trim().toLowerCase()
}

function hashCode(code: string) {
  return createHash("sha256")
    .update(`${code}:${process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? "ochieng-auth-code"}`)
    .digest("hex")
}

export function generateVerificationCode() {
  return randomInt(0, 1_000_000)
    .toString()
    .padStart(6, "0")
}

export async function issueVerificationCode({
  email,
  purpose,
  payload,
  userId,
}: {
  email: string
  purpose: AuthCodePurpose
  payload?: Prisma.InputJsonValue
  userId?: string | null
}) {
  const normalizedEmail = normalizeEmail(email)
  const code = generateVerificationCode()

  await prisma.verificationCode.updateMany({
    where: {
      email: normalizedEmail,
      purpose,
      consumedAt: null,
    },
    data: {
      consumedAt: new Date(),
    },
  })

  const record = await prisma.verificationCode.create({
    data: {
      email: normalizedEmail,
      purpose,
      codeHash: hashCode(code),
      payload,
      userId: userId ?? null,
      expiresAt: new Date(Date.now() + AUTH_CODE_TTL_MS),
    },
  })

  return {
    code,
    record,
  }
}

export async function consumeVerificationCode({
  email,
  purpose,
  code,
}: {
  email: string
  purpose: AuthCodePurpose
  code: string
}) {
  const normalizedEmail = normalizeEmail(email)
  const hashed = hashCode(code.trim())
  const now = new Date()

  const matches = await prisma.verificationCode.findMany({
    where: {
      email: normalizedEmail,
      purpose,
      consumedAt: null,
      expiresAt: {
        gt: now,
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: 10,
  })

  const match = matches.find((entry) => entry.codeHash === hashed)

  if (!match) {
    return null
  }

  return prisma.verificationCode.update({
    where: { id: match.id },
    data: {
      consumedAt: now,
    },
  })
}
