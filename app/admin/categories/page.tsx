import { Trash2 } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { deleteCategoryAction, upsertCategoryAction } from "@/lib/admin-actions"
import { getCategories } from "@/lib/storefront"

export default async function AdminCategoriesPage() {
  await requireAdminSession()
  const categories = await getCategories()

  return (
    <AdminShell
      title="Categories"
      description="Manage the appliance taxonomy used across home, shop, navigation, and structured filtering."
    >
      <div className="grid gap-8 xl:grid-cols-[0.8fr_1.2fr]">
        <form action={upsertCategoryAction} className="admin-surface grid gap-4 p-6">
          <h2 className="font-heading text-2xl font-semibold">Add category</h2>
          <input name="name" placeholder="Category name" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <input name="nameSw" placeholder="Category name (Swahili)" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <input name="slug" placeholder="Slug" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <input name="icon" placeholder="Icon label" className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="description" placeholder="Description" rows={3} className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <textarea name="descriptionSw" placeholder="Description (Swahili)" rows={3} className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none" required />
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            Save category
          </button>
        </form>

        <div className="grid gap-4 md:grid-cols-2">
          {categories.map((category) => (
            <article key={category.slug} className="admin-surface p-6">
              <p className="text-xs uppercase tracking-[0.26em] text-primary">{category.icon}</p>
              <h2 className="mt-4 font-heading text-2xl font-semibold">{category.name}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{category.description}</p>
              <div className="mt-5 flex items-center justify-between">
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{category.slug}</span>
                <form action={deleteCategoryAction}>
                  <input type="hidden" name="slug" value={category.slug} />
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
