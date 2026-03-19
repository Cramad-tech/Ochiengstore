"use server"

import { revalidatePath } from "next/cache"
import type { Route } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { recordAuditEvent } from "@/lib/audit"
import { requireAdminSession, requireUserSession } from "@/lib/auth-helpers"
import { setFlashMessage } from "@/lib/flash"
import { prisma } from "@/lib/prisma"
import { isAdminRole } from "@/lib/rbac"
import { encryptSecureMessage } from "@/lib/secure-messages"
import {
  supportConversationCreateSchema,
  supportConversationReplySchema,
  supportConversationStatusSchema,
} from "@/lib/validation"

async function ensureCustomerProfile(userId: string) {
  const existing = await prisma.customer.findUnique({
    where: { userId },
  })

  if (existing) {
    return existing
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  })

  const [firstName = "Customer", ...rest] = (user.name || "Customer").split(/\s+/)
  return prisma.customer.create({
    data: {
      userId,
      firstName,
      lastName: rest.join(" "),
      phone: user.phone ?? "",
      email: user.email,
    },
  })
}

export async function createSupportConversationAction(formData: FormData) {
  const session = await requireUserSession()
  const payload = supportConversationCreateSchema.parse({
    subject: formData.get("subject"),
    message: formData.get("message"),
  })

  const customer = await ensureCustomerProfile(session.user.id)

  const conversation = await prisma.$transaction(async (tx) => {
    const createdConversation = await tx.supportConversation.create({
      data: {
        customerId: customer.id,
        subject: payload.subject,
        status: "WAITING_ON_ADMIN",
      },
    })

    await tx.supportMessage.create({
      data: {
        conversationId: createdConversation.id,
        senderUserId: session.user.id,
        senderRole: "CUSTOMER",
        bodyEncrypted: encryptSecureMessage(payload.message),
      },
    })

    await tx.supportConversation.update({
      where: { id: createdConversation.id },
      data: {
        lastMessageAt: new Date(),
      },
    })

    return createdConversation
  })

  await recordAuditEvent({
    action: "CREATE",
    entityType: "SupportConversation",
    entityId: conversation.id,
    userId: session.user.id,
    message: `Created support conversation ${conversation.subject}.`,
  })

  revalidatePath("/account")
  revalidatePath("/account/support")
  revalidatePath("/admin/support")
  await setFlashMessage({
    type: "success",
    title: "Support room created",
    message: "Your secure message room is open. Management can reply from the admin console.",
  })
  redirect(`/account/support?conversation=${conversation.id}` as Route)
}

export async function replyToSupportConversationAction(formData: FormData) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error("You must be signed in to reply.")
  }

  const payload = supportConversationReplySchema.parse({
    conversationId: formData.get("conversationId"),
    message: formData.get("message"),
  })

  const hasAdminRole = session.user.roles.some((role) => isAdminRole(role))

  const conversation = await prisma.supportConversation.findUnique({
    where: { id: payload.conversationId },
    include: {
      customer: true,
    },
  })

  if (!conversation) {
    throw new Error("Support conversation not found.")
  }

  if (!hasAdminRole && conversation.customer.userId !== session.user.id) {
    throw new Error("You do not have access to this support conversation.")
  }

  await prisma.$transaction(async (tx) => {
    await tx.supportMessage.create({
      data: {
        conversationId: payload.conversationId,
        senderUserId: session.user.id,
        senderRole: hasAdminRole ? "ADMIN" : "CUSTOMER",
        bodyEncrypted: encryptSecureMessage(payload.message),
      },
    })

    await tx.supportConversation.update({
      where: { id: payload.conversationId },
      data: {
        lastMessageAt: new Date(),
        status: hasAdminRole ? "WAITING_ON_CUSTOMER" : "WAITING_ON_ADMIN",
      },
    })
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "SupportConversation",
    entityId: payload.conversationId,
    userId: session.user.id,
    message: hasAdminRole ? "Admin replied in support room." : "Customer replied in support room.",
  })

  revalidatePath("/account")
  revalidatePath("/account/support")
  revalidatePath("/admin/support")
  await setFlashMessage({
    type: "success",
    title: "Message sent",
    message: hasAdminRole
      ? "Your reply has been delivered to the customer room."
      : "Your message has been sent to management.",
  })
  redirect(
    `${hasAdminRole ? "/admin/support" : "/account/support"}?conversation=${payload.conversationId}` as Route,
  )
}

export async function updateSupportConversationStatusAction(formData: FormData) {
  await requireAdminSession()

  const payload = supportConversationStatusSchema.parse({
    conversationId: formData.get("conversationId"),
    status: formData.get("status"),
  })

  await prisma.supportConversation.update({
    where: { id: payload.conversationId },
    data: {
      status: payload.status,
    },
  })

  await recordAuditEvent({
    action: "UPDATE",
    entityType: "SupportConversation",
    entityId: payload.conversationId,
    message: `Support conversation moved to ${payload.status}.`,
  })

  revalidatePath("/admin/support")
  revalidatePath("/account/support")
  await setFlashMessage({
    type: "success",
    title: "Conversation updated",
    message: `Support status changed to ${payload.status.replaceAll("_", " ").toLowerCase()}.`,
  })
  redirect(`/admin/support?conversation=${payload.conversationId}` as Route)
}
