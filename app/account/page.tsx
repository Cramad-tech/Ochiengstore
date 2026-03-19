import type { Route } from "next"
import Link from "next/link"

import { prisma } from "@/lib/prisma"
import { formatTzs } from "@/lib/format"
import { getSiteSettings } from "@/lib/storefront"
import { requireUserSession } from "@/lib/auth-helpers"
import { updateCustomerProfileAction } from "@/lib/customer-actions"
import { PageHero } from "@/components/store/page-hero"
import { ChangePasswordForm } from "@/components/store/change-password-form"
import { StorefrontShell } from "@/components/store/storefront-shell"

export default async function AccountPage() {
  const session = await requireUserSession()
  const [settings, user] = await Promise.all([
    getSiteSettings(),
    prisma.user.findUnique({
      where: { id: session.user.id },
      include: {
        customer: {
          include: {
            addresses: {
              where: { isDefault: true },
              take: 1,
            },
            orders: {
              orderBy: { createdAt: "desc" },
              take: 10,
            },
          },
        },
      },
    }),
  ])

  const [firstName = "", ...rest] = (user?.customer
    ? `${user.customer.firstName} ${user.customer.lastName}`
    : (session.user.name ?? "").trim()
  ).split(/\s+/)
  const lastName = user?.customer?.lastName ?? rest.join(" ")
  const defaultAddress = user?.customer?.addresses[0]

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="My account"
        title="Keep your profile and delivery details ready."
        description="Signed-in customers can save delivery information, review their recent orders, and move through checkout faster."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="glass-card p-7">
            <div className="mb-6">
              <span className="eyebrow">Profile</span>
              <h2 className="mt-4 font-heading text-2xl font-semibold">Customer details</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Update this information any time. Checkout can use these saved details automatically.
              </p>
            </div>

            <form action={updateCustomerProfileAction} className="grid gap-4 sm:grid-cols-2">
              <input
                name="firstName"
                defaultValue={user?.customer?.firstName ?? firstName}
                placeholder="First name"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="lastName"
                defaultValue={user?.customer?.lastName ?? lastName}
                placeholder="Last name"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="email"
                type="email"
                defaultValue={user?.email ?? session.user.email ?? ""}
                placeholder="Email address"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="phone"
                defaultValue={user?.customer?.phone ?? user?.phone ?? ""}
                placeholder="Phone number"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <select
                name="region"
                defaultValue={defaultAddress?.region ?? settings.regions[0] ?? "Dar es Salaam"}
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                {settings.regions.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
              <input
                name="city"
                defaultValue={defaultAddress?.city ?? ""}
                placeholder="City / town"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="district"
                defaultValue={defaultAddress?.district ?? ""}
                placeholder="District"
                className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <input
                name="addressLine"
                defaultValue={defaultAddress?.line1 ?? ""}
                placeholder="Street, estate, or landmark"
                className="sm:col-span-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />

              <button
                type="submit"
                className="sm:col-span-2 inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Save profile
              </button>
            </form>
          </div>

          <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="glass-card p-6">
                <span className="eyebrow">Profile status</span>
                <div className="mt-5 space-y-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span>Signed in as</span>
                    <span className="font-semibold text-foreground">{session.user.email}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Saved orders</span>
                    <span className="font-semibold text-foreground">{user?.customer?.orders.length ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <span>Default region</span>
                    <span className="font-semibold text-foreground">{defaultAddress?.region ?? "Not saved yet"}</span>
                  </div>
                </div>
            </div>

            <div className="glass-card p-6">
                <span className="eyebrow">Primary delivery address</span>
                <div className="mt-5 space-y-2 text-sm text-muted-foreground">
                  <p className="font-semibold text-foreground">{defaultAddress?.recipientName ?? "Not saved yet"}</p>
                  <p>{defaultAddress?.line1 ?? "Add an address in your profile form."}</p>
                  <p>
                    {[defaultAddress?.district, defaultAddress?.city, defaultAddress?.region].filter(Boolean).join(", ") || "No region saved yet"}
                  </p>
                  <p>{defaultAddress?.phone ?? user?.customer?.phone ?? "No phone saved yet"}</p>
              </div>
            </div>
          </div>

          <div className="glass-card p-6">
            <span className="eyebrow">Support</span>
            <h2 className="mt-4 font-heading text-2xl font-semibold">Secure customer room</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Need help with delivery, warranty, or your order? Open the account support room and talk directly with management.
            </p>
            <Link
              href={"/account/support" as Route}
              className="mt-5 inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
            >
              Open support room
            </Link>
          </div>

          <div className="glass-card p-7">
            <span className="eyebrow">Recent orders</span>
              <div className="mt-5 space-y-4">
                {user?.customer?.orders.length ? (
                  user.customer.orders.map((order) => (
                    <article key={order.id} className="rounded-[1.25rem] border border-border bg-card p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">Order number</p>
                          <h3 className="mt-2 font-heading text-lg font-semibold">{order.orderNumber}</h3>
                        </div>
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{order.status}</span>
                      </div>
                      <div className="mt-4 flex items-center justify-between gap-3 text-sm text-muted-foreground">
                        <span>{new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium" }).format(order.createdAt)}</span>
                        <span className="font-semibold text-foreground">{formatTzs(order.grandTotal)}</span>
                      </div>
                    </article>
                  ))
                ) : (
                  <div className="rounded-[1.25rem] border border-border bg-card p-5 text-sm text-muted-foreground">
                    No orders yet. Your orders will appear here after checkout.
                  </div>
                )}
              </div>
            </div>

            <div className="glass-card p-7">
              <span className="eyebrow">Security</span>
              <h2 className="mt-4 font-heading text-2xl font-semibold">Change password</h2>
              <p className="mt-3 text-sm text-muted-foreground">
                Keep your account secure by updating your password whenever you need to.
              </p>
              <div className="mt-5">
                <ChangePasswordForm compact />
              </div>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
