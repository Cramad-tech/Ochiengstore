import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { updateOrderStatusAction } from "@/lib/admin-actions"
import { prisma } from "@/lib/prisma"

export default async function AdminOrdersPage() {
  await requireAdminSession()

  const orders = await prisma.order
    .findMany({
      include: {
        items: true,
        payments: true,
        customer: true,
        shippingAddress: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    })
    .catch(() => [])

  return (
    <AdminShell
      title="Orders"
      description="Review incoming orders, confirm payment progress, and update fulfillment milestones for customer tracking."
    >
      <div className="admin-surface overflow-hidden">
        <div className="border-b border-border px-6 py-5">
          <h2 className="font-heading text-2xl font-semibold">Recent orders</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-secondary/60 text-left">
              <tr>
                <th className="px-6 py-3 font-semibold">Order</th>
                <th className="px-6 py-3 font-semibold">Customer</th>
                <th className="px-6 py-3 font-semibold">Region</th>
                <th className="px-6 py-3 font-semibold">Status</th>
                <th className="px-6 py-3 font-semibold">Payment</th>
                <th className="px-6 py-3 font-semibold">Update</th>
              </tr>
            </thead>
            <tbody>
              {orders.length > 0 ? (
                orders.map((order: (typeof orders)[number]) => (
                  <tr key={order.id} className="border-t border-border align-top">
                    <td className="px-6 py-4">
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{order.items.length} items</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">
                      <p>{order.guestName ?? (`${order.customer?.firstName ?? ""} ${order.customer?.lastName ?? ""}`.trim() || "Guest checkout")}</p>
                      <p className="text-xs">{order.guestPhone ?? order.customer?.phone ?? order.shippingAddress?.phone ?? "No phone"}</p>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground">{order.deliveryRegion}</td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{order.status}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                        {order.payments[0]?.status ?? "PENDING"}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <form action={updateOrderStatusAction} className="grid gap-2">
                        <input type="hidden" name="orderId" value={order.id} />
                        <select name="status" defaultValue={order.status} className="rounded-full border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none">
                          {["PENDING", "PAYMENT_REVIEW", "CONFIRMED", "PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED", "CANCELLED", "REFUNDED"].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <select
                          name="paymentStatus"
                          defaultValue={order.payments[0]?.status ?? "PENDING"}
                          className="rounded-full border border-border px-3 py-2 text-xs focus:border-primary focus:outline-none"
                        >
                          {["PENDING", "AWAITING_CONFIRMATION", "PAID", "FAILED", "REFUNDED", "CANCELLED"].map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>
                        <button className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground">Save</button>
                      </form>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-muted-foreground">
                    No orders found yet. Submit a checkout to seed live order activity.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  )
}
