import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { deleteTestimonialAction, upsertBannerAction, upsertTestimonialAction } from "@/lib/admin-actions"
import { requireAdminSession } from "@/lib/auth-helpers"
import { HOME_BANNER } from "@/lib/demo-store"
import { prisma } from "@/lib/prisma"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminContentPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminSession()

  const params = await searchParams
  const editId = typeof params.edit === "string" ? params.edit : undefined

  const [banner, testimonials, editTestimonial] = await Promise.all([
    prisma.banner
      .findUnique({
        where: { placement: "HOME_HERO" },
      })
      .catch(() => null),
    prisma.testimonial
      .findMany({
        orderBy: [{ rating: "desc" }, { updatedAt: "desc" }],
      })
      .catch(() => []),
    editId
      ? prisma.testimonial
          .findUnique({
            where: { id: editId },
          })
          .catch(() => null)
      : Promise.resolve(null),
  ])

  const resolvedBanner = banner ?? {
    ...HOME_BANNER,
    active: true,
    imageUrl: "",
  }

  return (
    <AdminShell
      title="Content"
      description="Manage hero messaging and testimonial proof so the storefront stays fresh, trustworthy, and conversion-focused."
    >
      <div className="grid gap-8">
        <div className="grid gap-8 xl:grid-cols-[1fr_1fr]">
          <form action={upsertBannerAction} className="admin-surface grid gap-4 p-6">
            <h2 className="font-heading text-2xl font-semibold">Homepage hero banner</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="eyebrow"
                defaultValue={resolvedBanner.eyebrow}
                placeholder="Eyebrow"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="eyebrowSw"
                defaultValue={resolvedBanner.eyebrowSw}
                placeholder="Eyebrow (Swahili)"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <textarea
                name="title"
                defaultValue={resolvedBanner.title}
                rows={3}
                placeholder="Title"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <textarea
                name="titleSw"
                defaultValue={resolvedBanner.titleSw}
                rows={3}
                placeholder="Title (Swahili)"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <textarea
                name="description"
                defaultValue={resolvedBanner.description}
                rows={4}
                placeholder="Description"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <textarea
                name="descriptionSw"
                defaultValue={resolvedBanner.descriptionSw}
                rows={4}
                placeholder="Description (Swahili)"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="ctaLabel"
                defaultValue={resolvedBanner.ctaLabel}
                placeholder="CTA label"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="ctaLabelSw"
                defaultValue={resolvedBanner.ctaLabelSw}
                placeholder="CTA label (Swahili)"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="ctaHref"
                defaultValue={resolvedBanner.ctaHref}
                placeholder="CTA href"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="imageUrl"
                defaultValue={"imageUrl" in resolvedBanner ? resolvedBanner.imageUrl ?? "" : ""}
                placeholder="Optional image URL"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="active" defaultChecked={"active" in resolvedBanner ? resolvedBanner.active : true} />
              Banner active
            </label>
            <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Save hero banner
            </button>
          </form>

          <form action={upsertTestimonialAction} className="admin-surface grid gap-4 p-6">
            <h2 className="font-heading text-2xl font-semibold">{editTestimonial ? `Edit ${editTestimonial.name}` : "Customer testimonial"}</h2>
            <input type="hidden" name="id" value={editTestimonial?.id ?? ""} />
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="name"
                defaultValue={editTestimonial?.name}
                placeholder="Customer name"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="city"
                defaultValue={editTestimonial?.city}
                placeholder="City"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="role"
                defaultValue={editTestimonial?.role}
                placeholder="Role"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="roleSw"
                defaultValue={editTestimonial?.roleSw}
                placeholder="Role (Swahili)"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
              <textarea
                name="quote"
                defaultValue={editTestimonial?.quote}
                rows={4}
                placeholder="Quote"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="rating"
                defaultValue={editTestimonial?.rating ?? 5}
                placeholder="Rating"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <textarea
              name="quoteSw"
              defaultValue={editTestimonial?.quoteSw}
              rows={4}
              placeholder="Quote (Swahili)"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="featured" defaultChecked={editTestimonial?.featured ?? true} />
              Show on storefront
            </label>
            <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              {editTestimonial ? "Update testimonial" : "Save testimonial"}
            </button>
          </form>
        </div>

        <div className="admin-surface overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading text-2xl font-semibold">Testimonials</h2>
          </div>
          <div className="grid gap-4 p-6 md:grid-cols-2 xl:grid-cols-3">
            {testimonials.length > 0 ? (
              testimonials.map((testimonial: (typeof testimonials)[number]) => (
                <article key={testimonial.id} className="rounded-[1.3rem] border border-border p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-heading text-xl font-semibold">{testimonial.name}</h3>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                        {testimonial.role} | {testimonial.city}
                      </p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{testimonial.rating}/5</span>
                  </div>
                  <p className="mt-4 text-sm text-muted-foreground">{testimonial.quote}</p>
                  <div className="mt-5 flex items-center gap-3">
                    <Link href={`/admin/content?edit=${testimonial.id}`} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold">
                      <Pencil className="size-3" />
                      Edit
                    </Link>
                    <form action={deleteTestimonialAction}>
                      <input type="hidden" name="id" value={testimonial.id} />
                      <button className="inline-flex items-center gap-2 rounded-full border border-destructive/25 px-3 py-2 text-xs font-semibold text-destructive">
                        <Trash2 className="size-3" />
                        Delete
                      </button>
                    </form>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                Seed or add testimonials to strengthen trust on the storefront.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
