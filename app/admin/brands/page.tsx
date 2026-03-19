import { Trash2 } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { deleteBrandAction, upsertBrandAction } from "@/lib/admin-actions"
import { getBrands } from "@/lib/storefront"

export default async function AdminBrandsPage() {
  await requireAdminSession()
  const brands = await getBrands()

  return (
    <AdminShell
      title="Brands"
      description="Organize catalog coverage by brand so customers can compare product lines, reputation, and pricing more quickly."
    >
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <form action={upsertBrandAction} className="admin-surface grid gap-4 p-6">
          <h2 className="font-heading text-2xl font-semibold">Add brand</h2>
          <input name="name" placeholder="Brand name" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <input name="slug" placeholder="Slug" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <input name="country" placeholder="Country" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="description" placeholder="Description" rows={3} className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Featured brand</label>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Save brand
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {brands.map((brand) => (
            <article key={brand.slug} className="admin-surface p-6">
              <div className="flex items-center gap-4">
                <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 font-heading font-semibold text-primary">
                  {brand.logoLabel}
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-semibold">{brand.name}</h2>
                  <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{brand.country}</p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">{brand.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{brand.slug}</span>
                <form action={deleteBrandAction}>
                  <input type="hidden" name="slug" value={brand.slug} />
                  <button className="inline-flex items-center gap-2 rounded-full border border-destructive/25 px-3 py-2 text-xs font-semibold text-destructive">
                    <Trash2 className="size-3" />
                    Delete
                  </button>
                </form>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AdminShell>
  )
}
