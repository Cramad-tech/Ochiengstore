import { auth } from "@/auth"
import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

type AuditPayload = {
  action: "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "PUBLISH" | "SETTINGS_UPDATE" | "ORDER_UPDATE" | "REVIEW_MODERATE"
  entityType: string
  entityId?: string | null
  message: string
  metadata?: Prisma.InputJsonValue
  userId?: string | null
}

export async function getCurrentAuditUserId() {
  try {
    const session = await auth()
    return session?.user?.id ?? null
  } catch {
    return null
  }
}

export async function recordAuditEvent(payload: AuditPayload) {
  try {
    const userId = payload.userId === undefined ? await getCurrentAuditUserId() : payload.userId

    await prisma.auditLog.create({
      data: {
        userId,
        action: payload.action,
        entityType: payload.entityType,
        entityId: payload.entityId ?? null,
        message: payload.message,
        metadata: payload.metadata ?? undefined,
      },
    })
  } catch {
    // Audit logging should never break the primary user action.
  }
}
