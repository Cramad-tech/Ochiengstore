import type React from "react"

import { AdminSidebar } from "@/components/admin-sidebar"

export function AdminShell({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,rgba(23,49,106,0.12),transparent_24%),radial-gradient(circle_at_top_left,rgba(212,161,43,0.16),transparent_22%),linear-gradient(180deg,#f8f7f2_0%,#eef3fb_100%)]">
      <AdminSidebar />
      <div className="pt-16 md:pl-72 md:pt-0">
        <div className="border-b border-border/80 bg-white/70 px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8 md:px-8">
          <div className="admin-surface overflow-hidden rounded-[1.8rem] border-primary/10 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(23,49,106,0.06)_55%,rgba(212,161,43,0.12))] p-6 sm:p-8">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.28em] text-muted-foreground">Admin</p>
                <h1 className="mt-3 font-heading text-3xl font-semibold sm:text-4xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-sm text-muted-foreground">{description}</p>
              </div>
              <div className="grid gap-2 text-sm text-muted-foreground sm:grid-cols-2">
                <div className="rounded-[1.2rem] border border-white/60 bg-white/75 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Control focus</p>
                  <p className="mt-2 font-semibold text-foreground">Catalog, users, support, and orders</p>
                </div>
                <div className="rounded-[1.2rem] border border-white/60 bg-white/75 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Protection</p>
                  <p className="mt-2 font-semibold text-foreground">Role checks, audit trails, and secure sessions</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="px-4 py-6 sm:px-6 sm:py-8 md:px-8">{children}</div>
      </div>
    </main>
  )
}
