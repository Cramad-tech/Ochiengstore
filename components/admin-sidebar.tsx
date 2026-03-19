"use client"

import type { Route } from "next"
import type { ComponentType } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ArrowLeft, BarChart3, FolderTree, ImagePlus, LayoutDashboard, LogOut, Menu, MessageSquareText, Package, Settings, ShoppingBag, ShieldCheck, Tag, TicketPercent, Users, X } from "lucide-react"
import { signOut } from "next-auth/react"
import { useState } from "react"

import { cn } from "@/lib/utils"

const navItems: Array<{ label: string; href: Route; icon: ComponentType<{ className?: string }> }> = [
  { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Categories", href: "/admin/categories", icon: FolderTree },
  { label: "Brands", href: "/admin/brands", icon: Tag },
  { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Users", href: "/admin/users" as Route, icon: ShieldCheck },
  { label: "Coupons", href: "/admin/coupons", icon: TicketPercent },
  { label: "Reviews", href: "/admin/reviews", icon: MessageSquareText },
  { label: "Support", href: "/admin/support" as Route, icon: MessageSquareText },
  { label: "Content", href: "/admin/content", icon: ImagePlus },
  { label: "Settings", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      <button
        onClick={() => setIsOpen((value) => !value)}
        className="fixed left-4 top-4 z-50 rounded-full border border-white/10 bg-sidebar px-3 py-2 text-sidebar-foreground shadow-[0_18px_40px_-20px_rgba(4,7,24,0.75)] md:hidden"
        aria-label="Toggle admin navigation"
      >
        {isOpen ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex h-screen w-72 flex-col overflow-hidden border-r border-sidebar-border bg-[linear-gradient(180deg,#10224c_0%,#0a1737_100%)] px-5 py-6 text-sidebar-foreground transition-transform duration-300",
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className="rounded-[1.6rem] border border-white/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(212,161,43,0.08))] p-5 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.45)]">
          <div className="flex items-center gap-3">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-sidebar-primary text-sidebar-primary-foreground shadow-sm">
              <BarChart3 className="size-5" />
            </div>
            <div>
              <p className="font-heading text-lg font-semibold">Admin Console</p>
              <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">Ochieng Home</p>
            </div>
          </div>
          <div className="mt-5 rounded-[1.2rem] border border-white/10 bg-black/10 px-4 py-3 text-sm text-sidebar-foreground/75">
            Albert-led storefront controls for catalog, users, orders, support, and launch safety.
          </div>
        </div>

        <div className="mt-8 flex min-h-0 flex-1 flex-col">
          <nav className="grid gap-2 overflow-y-auto pr-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-medium transition",
                    isActive
                      ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-[0_16px_36px_-22px_rgba(212,161,43,0.95)]"
                      : "border border-transparent text-sidebar-foreground/85 hover:border-white/8 hover:bg-white/6 hover:text-sidebar-foreground",
                  )}
                >
                  <item.icon className="size-5" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <div className="mt-5 space-y-3 border-t border-white/10 pt-5">
            <Link
              href={"/" as Route}
              onClick={() => setIsOpen(false)}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-white/12 bg-white/6 px-4 py-2.5 text-sm font-medium text-sidebar-foreground transition hover:bg-white/12"
            >
              <ArrowLeft className="size-4" />
              Return to website
            </Link>

            <div className="rounded-[1.4rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(255,255,255,0.03))] p-4">
              <p className="text-xs uppercase tracking-[0.24em] text-sidebar-foreground/60">Security</p>
              <p className="mt-3 text-sm text-sidebar-foreground/85">
                Server-protected admin area with database-backed credentials, rate limits, audit logs, and role checks.
              </p>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-white/8 px-4 py-2 text-sm font-medium text-sidebar-foreground transition hover:bg-white/14"
              >
                <LogOut className="size-4" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </aside>

      {isOpen ? <div onClick={() => setIsOpen(false)} className="fixed inset-0 z-30 bg-black/45 md:hidden" /> : null}
    </>
  )
}
