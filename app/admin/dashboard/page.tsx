import Link from "next/link"
import type { Route } from "next"
import { ArrowRight, Boxes, MessageSquareText, Package, ShoppingBag, Tag, TicketPercent, Users } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"
import { getBrands, getCategories, getProducts } from "@/lib/storefront"

export default async function AdminDashboardPage() {
  await requireAdminSession()

  const [products, categories, brands] = await Promise.all([getProducts(), getCategories(), getBrands()])

  const [orderCount, pendingReviews, inquiryCount, customerCount, couponCount, supportRoomCount] = await Promise.all([
    prisma.order.count().catch(() => 0),
    prisma.review.count({ where: { status: "PENDING" } }).catch(() => 0),
    prisma.contactInquiry.count().catch(() => 0),
    prisma.customer.count().catch(() => 0),
    prisma.coupon.count().catch(() => 0),
    prisma.supportConversation.count().catch(() => 0),
  ])

  const stats = [
    { label: "Products", value: products.length, icon: Package },
    { label: "Categories", value: categories.length, icon: Boxes },
    { label: "Brands", value: brands.length, icon: Tag },
    { label: "Orders", value: orderCount, icon: ShoppingBag },
    { label: "Customers", value: customerCount, icon: Users },
    { label: "Coupons", value: couponCount, icon: TicketPercent },
    { label: "Pending reviews", value: pendingReviews, icon: MessageSquareText },
    { label: "Support rooms", value: supportRoomCount, icon: MessageSquareText },
    { label: "Inquiries", value: inquiryCount, icon: ArrowRight },
  ]
  const quickLinks: Array<{ href: Route; label: string }> = [
    { href: "/admin/products", label: "Manage products" },
    { href: "/admin/categories", label: "Manage categories" },
    { href: "/admin/brands", label: "Manage brands" },
    { href: "/admin/orders", label: "Manage orders" },
    { href: "/admin/customers", label: "View customers" },
    { href: "/admin/users", label: "Approve users & staff" },
    { href: "/admin/support" as Route, label: "Open support inbox" },
    { href: "/admin/coupons", label: "Manage coupons" },
    { href: "/admin/content", label: "Manage homepage content" },
  ]

  return (
    <AdminShell
      title="Dashboard"
      description="A quick view of catalog, order, review, and customer-support activity across the Tanzania appliance storefront."
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => (
          <article key={stat.label} className="admin-surface p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">{stat.label}</p>
                <p className="mt-3 font-heading text-4xl font-semibold">{stat.value}</p>
              </div>
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <stat.icon className="size-6" />
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        <div className="admin-surface p-6">
          <h2 className="font-heading text-2xl font-semibold">Catalog quick links</h2>
          <div className="mt-5 grid gap-3">
            {quickLinks.map((item) => (
              <Link key={item.href} href={item.href} className="flex items-center justify-between rounded-2xl border border-border px-4 py-3 text-sm font-medium transition hover:border-primary/35">
                {item.label}
                <ArrowRight className="size-4" />
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-surface p-6">
          <h2 className="font-heading text-2xl font-semibold">Launch notes</h2>
          <ul className="mt-5 space-y-3 text-sm text-muted-foreground">
            <li>Use seeded admin credentials from `.env` to authenticate.</li>
            <li>Catalog mutations are server-side and Prisma-backed.</li>
            <li>Guest checkout writes real orders and payment records.</li>
            <li>Review moderation and settings now flow through database-backed actions.</li>
            <li>Pending signups can be approved manually if email delivery fails.</li>
          </ul>
        </div>
      </div>
    </AdminShell>
  )
}
