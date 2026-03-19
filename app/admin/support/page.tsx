import type { Route } from "next"
import Link from "next/link"
import { MessageSquareMore, ShieldCheck } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { decryptSecureMessage } from "@/lib/secure-messages"
import { replyToSupportConversationAction, updateSupportConversationStatusAction } from "@/lib/support-actions"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminSupportPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminSession()

  const params = await searchParams
  const conversationId = typeof params.conversation === "string" ? params.conversation : undefined

  const conversations = await prisma.supportConversation.findMany({
    include: {
      customer: true,
      messages: {
        orderBy: { createdAt: "asc" },
        include: {
          senderUser: {
            select: { name: true, email: true },
          },
        },
      },
    },
    orderBy: [{ lastMessageAt: "desc" }, { updatedAt: "desc" }],
  })

  const activeConversation =
    conversations.find((conversation) => conversation.id === conversationId) ?? conversations[0] ?? null

  return (
    <AdminShell
      title="Support"
      description="Review customer conversations, reply from management, and keep every support decision visible inside one secure workspace."
    >
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <aside className="admin-surface overflow-hidden">
          <div className="border-b border-border bg-[linear-gradient(135deg,rgba(23,49,106,0.1),rgba(212,161,43,0.16))] p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Inbox</p>
                <h2 className="mt-3 font-heading text-2xl font-semibold">Customer support rooms</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Messages are stored encrypted and only open inside authenticated account sessions.
                </p>
              </div>
            </div>
          </div>
          <div className="grid gap-3 p-4">
            {conversations.length > 0 ? (
              conversations.map((conversation) => (
                <Link
                  key={conversation.id}
                  href={{
                    pathname: "/admin/support" as Route,
                    query: { conversation: conversation.id },
                  }}
                  className={`rounded-[1.25rem] border px-4 py-4 transition ${
                    activeConversation?.id === conversation.id
                      ? "border-primary bg-primary/8"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-foreground">{conversation.subject}</p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {conversation.customer.firstName} {conversation.customer.lastName}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-secondary-foreground">
                      {conversation.status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    {new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium", timeStyle: "short" }).format(conversation.lastMessageAt)}
                  </p>
                </Link>
              ))
            ) : (
              <div className="rounded-[1.25rem] border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                No support conversations yet.
              </div>
            )}
          </div>
        </aside>

        <div className="admin-surface p-5 sm:p-6 lg:p-7">
          {activeConversation ? (
            <>
              <div className="flex flex-col gap-4 border-b border-border pb-5 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Selected room</p>
                  <h2 className="mt-3 font-heading text-3xl font-semibold">{activeConversation.subject}</h2>
                  <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted-foreground">
                    <span>{activeConversation.customer.firstName} {activeConversation.customer.lastName}</span>
                    <span>{activeConversation.customer.email ?? "No email saved"}</span>
                    <span>{activeConversation.customer.phone}</span>
                  </div>
                </div>

                <form action={updateSupportConversationStatusAction} className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <input type="hidden" name="conversationId" value={activeConversation.id} />
                  <select
                    name="status"
                    defaultValue={activeConversation.status}
                    className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  >
                    <option value="OPEN">Open</option>
                    <option value="WAITING_ON_ADMIN">Waiting on admin</option>
                    <option value="WAITING_ON_CUSTOMER">Waiting on customer</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                  <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                    Update status
                  </button>
                </form>
              </div>

              <div className="mt-6 space-y-4">
                {activeConversation.messages.map((message) => {
                  const isAdminMessage = message.senderRole === "ADMIN"

                  return (
                    <article
                      key={message.id}
                      className={`max-w-4xl rounded-[1.35rem] px-4 py-4 ${
                        isAdminMessage ? "ml-auto bg-primary text-primary-foreground" : "border border-border bg-card"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]">
                        <span>{isAdminMessage ? "Management" : message.senderUser.name ?? message.senderUser.email}</span>
                        <span className={isAdminMessage ? "text-primary-foreground/75" : "text-muted-foreground"}>
                          {new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}
                        </span>
                      </div>
                      <p className={`mt-3 whitespace-pre-wrap text-sm leading-6 ${isAdminMessage ? "text-primary-foreground" : "text-foreground"}`}>
                        {decryptSecureMessage(message.bodyEncrypted)}
                      </p>
                    </article>
                  )
                })}
              </div>

              <form action={replyToSupportConversationAction} className="mt-6 grid gap-4 border-t border-border pt-6">
                <input type="hidden" name="conversationId" value={activeConversation.id} />
                <textarea
                  name="message"
                  rows={4}
                  placeholder="Reply as management"
                  className="rounded-[1.35rem] border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  required
                />
                <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                  Send management reply
                </button>
              </form>
            </>
          ) : (
            <div className="grid min-h-[420px] place-items-center text-center">
              <div>
                <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <MessageSquareMore className="size-6" />
                </div>
                <h2 className="mt-5 font-heading text-3xl font-semibold">No conversation selected</h2>
                <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                  Customer support rooms will appear here once shoppers start messaging management.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminShell>
  )
}
