import { AdminShell } from "@/components/admin/admin-shell"
import { requireAdminSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function AdminCustomersPage() {
  await requireAdminSession()

  const [customers, inquiries] = await Promise.all([
    prisma.customer
      .findMany({
        include: {
          addresses: {
            orderBy: {
              updatedAt: "desc",
            },
            take: 1,
          },
          _count: {
            select: {
              orders: true,
              reviews: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        take: 30,
      })
      .catch(() => []),
    prisma.contactInquiry
      .findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 12,
      })
      .catch(() => []),
  ])

  return (
    <AdminShell
      title="Customers"
      description="Keep track of guest and repeat buyers, their saved delivery details, and recent support inquiries."
    >
      <div className="grid gap-8 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="admin-surface overflow-hidden">
          <div className="border-b border-border px-6 py-5">
            <h2 className="font-heading text-2xl font-semibold">Customer directory</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60 text-left">
                <tr>
                  <th className="px-6 py-3 font-semibold">Customer</th>
                  <th className="px-6 py-3 font-semibold">Phone</th>
                  <th className="px-6 py-3 font-semibold">Last region</th>
                  <th className="px-6 py-3 font-semibold">Orders</th>
                  <th className="px-6 py-3 font-semibold">Reviews</th>
                </tr>
              </thead>
              <tbody>
                {customers.length > 0 ? (
                  customers.map((customer: (typeof customers)[number]) => (
                    <tr key={customer.id} className="border-t border-border">
                      <td className="px-6 py-4">
                        <p className="font-semibold">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">{customer.email ?? "No email provided"}</p>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{customer.phone}</td>
                      <td className="px-6 py-4 text-muted-foreground">{customer.addresses[0]?.region ?? "Not set"}</td>
                      <td className="px-6 py-4">{customer._count.orders}</td>
                      <td className="px-6 py-4">{customer._count.reviews}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground">
                      Customer records will appear here after checkout or account creation.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="admin-surface p-6">
          <h2 className="font-heading text-2xl font-semibold">Recent inquiries</h2>
          <div className="mt-5 space-y-4">
            {inquiries.length > 0 ? (
              inquiries.map((inquiry: (typeof inquiries)[number]) => (
                <article key={inquiry.id} className="rounded-[1.2rem] border border-border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold">{inquiry.name}</p>
                      <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{inquiry.subject}</p>
                    </div>
                    <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">{inquiry.status}</span>
                  </div>
                  <p className="mt-3 text-sm text-muted-foreground">{inquiry.message}</p>
                  <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
                    <span>{inquiry.email}</span>
                    {inquiry.phone ? <span>{inquiry.phone}</span> : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[1.2rem] border border-dashed border-border p-6 text-sm text-muted-foreground">
                Contact form submissions will appear here for follow-up.
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminShell>
  )
}
