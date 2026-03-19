import type { Route } from "next"
import Link from "next/link"
import { MessageSquareMore, ShieldCheck } from "lucide-react"

import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { requireUserSession } from "@/lib/auth-helpers"
import { decryptSecureMessage } from "@/lib/secure-messages"
import { createSupportConversationAction, replyToSupportConversationAction } from "@/lib/support-actions"
import { getSiteSettings } from "@/lib/storefront"
import { prisma } from "@/lib/prisma"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AccountSupportPage({ searchParams }: { searchParams: SearchParams }) {
  const [session, settings, params] = await Promise.all([requireUserSession(), getSiteSettings(), searchParams])
  const conversationId = typeof params.conversation === "string" ? params.conversation : undefined

  const customer = await prisma.customer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  })

  const conversations = customer
    ? await prisma.supportConversation.findMany({
        where: { customerId: customer.id },
        include: {
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
    : []

  const activeConversation =
    conversations.find((conversation) => conversation.id === conversationId) ?? conversations[0] ?? null

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Support room"
        title="Talk directly with management inside your account."
        description="Use this secure support room for delivery questions, warranty follow-up, order help, and account assistance."
      />

      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[320px_1fr]">
          <aside className="glass-card h-fit p-6">
            <div className="flex items-start gap-3">
              <div className="flex size-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <h2 className="font-heading text-2xl font-semibold">Start a new request</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Management will see your message in the admin console and can reply from there.
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Messages are encrypted in storage and only visible inside authenticated customer and admin sessions.
                </p>
              </div>
            </div>

            <form action={createSupportConversationAction} className="mt-6 grid gap-4">
              <input
                name="subject"
                placeholder="Subject, for example Delivery update"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <textarea
                name="message"
                placeholder="Write your message here"
                rows={5}
                className="rounded-[1.35rem] border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Open support room
              </button>
            </form>

            <div className="mt-8">
              <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Previous conversations</p>
              <div className="mt-4 grid gap-3">
                {conversations.length > 0 ? (
                  conversations.map((conversation) => (
                    <Link
                      key={conversation.id}
                      href={{
                        pathname: "/account/support" as Route,
                        query: { conversation: conversation.id },
                      }}
                      className={`rounded-[1.25rem] border px-4 py-4 text-sm transition ${
                        activeConversation?.id === conversation.id
                          ? "border-primary bg-primary/8 text-primary"
                          : "border-border bg-card hover:border-primary/25"
                      }`}
                    >
                      <p className="font-semibold">{conversation.subject}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.2em] text-muted-foreground">
                        {conversation.status.replaceAll("_", " ")}
                      </p>
                    </Link>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                    No support conversations yet.
                  </div>
                )}
              </div>
            </div>
          </aside>

          <div className="glass-card p-6 sm:p-7">
            {activeConversation ? (
              <>
                <div className="flex flex-col gap-4 border-b border-border pb-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Active conversation</p>
                    <h2 className="mt-3 font-heading text-3xl font-semibold">{activeConversation.subject}</h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                      Status: <span className="font-semibold text-foreground">{activeConversation.status.replaceAll("_", " ")}</span>
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last update{" "}
                    {new Intl.DateTimeFormat("en-TZ", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(activeConversation.lastMessageAt)}
                  </p>
                </div>

                <div className="mt-6 space-y-4">
                  {activeConversation.messages.map((message) => {
                    const isAdminMessage = message.senderRole === "ADMIN"

                    return (
                      <article
                        key={message.id}
                        className={`max-w-3xl rounded-[1.35rem] px-4 py-4 ${
                          isAdminMessage ? "border border-border bg-card" : "ml-auto bg-primary text-primary-foreground"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-3 text-xs uppercase tracking-[0.18em]">
                          <span>{isAdminMessage ? "Management" : "You"}</span>
                          <span className={isAdminMessage ? "text-muted-foreground" : "text-primary-foreground/75"}>
                            {new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium", timeStyle: "short" }).format(message.createdAt)}
                          </span>
                        </div>
                        <p className={`mt-3 whitespace-pre-wrap text-sm leading-6 ${isAdminMessage ? "text-foreground" : "text-primary-foreground"}`}>
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
                    placeholder="Reply to management"
                    className="rounded-[1.35rem] border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                  <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                    Send message
                  </button>
                </form>
              </>
            ) : (
              <div className="grid min-h-[360px] place-items-center text-center">
                <div>
                  <div className="mx-auto flex size-16 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <MessageSquareMore className="size-6" />
                  </div>
                  <h2 className="mt-5 font-heading text-3xl font-semibold">No conversation selected</h2>
                  <p className="mt-3 max-w-lg text-sm text-muted-foreground">
                    Start a new support request on the left, then the full conversation will appear here.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
