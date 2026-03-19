import Link from "next/link"
import { Pencil, Trash2 } from "lucide-react"

import { AdminShell } from "@/components/admin/admin-shell"
import { deleteCouponAction, upsertCouponAction } from "@/lib/admin-actions"
import { requireAdminSession } from "@/lib/auth-helpers"
import { formatTzs } from "@/lib/format"
import { prisma } from "@/lib/prisma"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function AdminCouponsPage({ searchParams }: { searchParams: SearchParams }) {
  await requireAdminSession()

  const params = await searchParams
  const editCode = typeof params.edit === "string" ? params.edit.toUpperCase() : undefined

  const [coupons, editCoupon] = await Promise.all([
    prisma.coupon
      .findMany({
        orderBy: {
          updatedAt: "desc",
        },
      })
      .catch(() => []),
    editCode
      ? prisma.coupon
          .findUnique({
            where: { code: editCode },
          })
          .catch(() => null)
      : Promise.resolve(null),
  ])

  return (
    <AdminShell
      title="Coupons"
      description="Create discount codes for promotions, controlled deal campaigns, and sales support follow-up."
    >
      <div className="grid gap-8 xl:grid-cols-[0.86fr_1.14fr]">
        <form action={upsertCouponAction} className="admin-surface grid gap-4 p-6">
          <h2 className="font-heading text-2xl font-semibold">{editCoupon ? `Edit ${editCoupon.code}` : "Create coupon"}</h2>
          <input type="hidden" name="originalCode" value={editCoupon?.code ?? ""} />
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              name="code"
              defaultValue={editCoupon?.code}
              placeholder="Coupon code"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
            <input
              name="name"
              defaultValue={editCoupon?.name}
              placeholder="Campaign name"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <textarea
            name="description"
            defaultValue={editCoupon?.description ?? ""}
            rows={3}
            placeholder="Description"
            className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <select
              name="discountType"
              defaultValue={editCoupon?.discountType ?? "FIXED_AMOUNT"}
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            >
              <option value="FIXED_AMOUNT">Fixed amount (TZS)</option>
              <option value="PERCENTAGE">Percentage</option>
            </select>
            <input
              name="discountValue"
              defaultValue={editCoupon?.discountValue ?? ""}
              placeholder="Discount value"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <input
              name="minOrderAmount"
              defaultValue={editCoupon?.minOrderAmount ?? ""}
              placeholder="Minimum order"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="maxDiscountAmount"
              defaultValue={editCoupon?.maxDiscountAmount ?? ""}
              placeholder="Max discount"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <input
              name="usageLimit"
              defaultValue={editCoupon?.usageLimit ?? ""}
              placeholder="Usage limit"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <input
              type="date"
              name="startsAt"
              defaultValue={editCoupon?.startsAt ? editCoupon.startsAt.toISOString().slice(0, 10) : ""}
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
            <input
              type="date"
              name="expiresAt"
              defaultValue={editCoupon?.expiresAt ? editCoupon.expiresAt.toISOString().slice(0, 10) : ""}
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
            />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="active" defaultChecked={editCoupon?.active ?? true} />
            Active coupon
          </label>
          <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
            {editCoupon ? "Update coupon" : "Save coupon"}
          </button>
        </form>

        <div className="admin-surface overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading text-2xl font-semibold">Coupon library</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold">Code</th>
                  <th className="px-6 py-3 font-semibold">Discount</th>
                  <th className="px-6 py-3 font-semibold">Usage</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {coupons.length > 0 ? (
                  coupons.map((coupon: (typeof coupons)[number]) => (
                    <tr key={coupon.id} className="border-t border-border">
                      <td className="px-6 py-4">
                        <p className="font-semibold">{coupon.code}</p>
                        <p className="text-xs text-muted-foreground">{coupon.name}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {coupon.discountType === "PERCENTAGE" ? `${coupon.discountValue}%` : formatTzs(coupon.discountValue)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {coupon.usedCount}
                        {coupon.usageLimit ? ` / ${coupon.usageLimit}` : ""}
                      </td>
                      <td className="px-6 py-4">
                        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                          {coupon.active ? "ACTIVE" : "INACTIVE"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <Link href={`/admin/coupons?edit=${coupon.code}`} className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-2 text-xs font-semibold">
                            <Pencil className="size-3" />
                            Edit
                          </Link>
                          <form action={deleteCouponAction}>
                            <input type="hidden" name="code" value={coupon.code} />
                            <button className="inline-flex items-center gap-2 rounded-full border border-destructive/25 px-3 py-2 text-xs font-semibold text-destructive">
                              <Trash2 className="size-3" />
                              Delete
                            </button>
                          </form>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      No coupons have been created yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
