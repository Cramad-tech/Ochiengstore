import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { moderateReviewAction } from "@/lib/admin-actions"
import { prisma } from "@/lib/prisma"

export default async function AdminReviewsPage() {
  await requireAdminSession()

  const reviews = await prisma.review
    .findMany({
      include: {
        product: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })
    .catch(() => [])

  return (
    <AdminShell
      title="Reviews"
      description="Moderate product reviews before they are shown publicly and keep catalog trust signals healthy."
    >
      <div className="space-y-4">
        {reviews.length > 0 ? (
          reviews.map((review: (typeof reviews)[number]) => (
            <article key={review.id} className="admin-surface p-6">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{review.product.name}</p>
                  <h2 className="mt-2 font-heading text-2xl font-semibold">{review.title ?? review.name}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">{review.rating}/5 | {review.name}</p>
                </div>
                <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{review.status}</span>
              </div>
              <p className="mt-5 text-sm text-muted-foreground">{review.body}</p>
              <form action={moderateReviewAction} className="mt-6 flex flex-wrap items-center gap-3">
                <input type="hidden" name="reviewId" value={review.id} />
                <select name="status" defaultValue={review.status} className="rounded-full border border-border px-4 py-2 text-sm focus:border-primary focus:outline-none">
                  {["PENDING", "APPROVED", "REJECTED"].map((status) => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Update review</button>
              </form>
            </article>
          ))
        ) : (
          <div className="admin-surface p-10 text-center text-muted-foreground">No reviews are waiting for moderation yet.</div>
        )}
      </div>
    </AdminShell>
  )
}
