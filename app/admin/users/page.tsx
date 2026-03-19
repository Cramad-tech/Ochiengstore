import { ChangePasswordForm } from "@/components/store/change-password-form"
import { AdminShell } from "@/components/admin/admin-shell"
import { approvePendingSignupAction, createManagedUserAction, updateManagedUserAction } from "@/lib/admin-actions"
import { isSignupPayload } from "@/lib/account-provisioning"
import { requireSuperAdminSession } from "@/lib/auth-helpers"
import { prisma } from "@/lib/prisma"

export default async function AdminUsersPage() {
  await requireSuperAdminSession()

  const [users, roles, pendingVerifications] = await Promise.all([
    prisma.user.findMany({
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
        customer: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
      take: 40,
    }),
    prisma.role.findMany({
      orderBy: {
        name: "asc",
      },
    }),
    prisma.verificationCode.findMany({
      where: {
        purpose: "SIGNUP",
        consumedAt: null,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 20,
    }),
  ])

  const roleOptions = ["CUSTOMER", ...roles.map((role) => role.code)]
  const pendingRequests = pendingVerifications
    .flatMap((verification) =>
      isSignupPayload(verification.payload)
        ? [
            {
              id: verification.id,
              email: verification.email,
              expiresAt: verification.expiresAt,
              createdAt: verification.createdAt,
              payload: verification.payload,
            },
          ]
        : [],
    )

  return (
    <AdminShell
      title="Users"
      description="Manage customers, staff, and admin accounts from one responsive screen, including roles, active status, and password resets."
    >
      <div className="grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-8">
          <div className="admin-surface p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <h2 className="font-heading text-2xl font-semibold">Pending signup approvals</h2>
                <p className="mt-3 text-sm text-muted-foreground">
                  If email verification fails for a customer, Albert can approve the signup here and allow login immediately.
                </p>
              </div>
              <span className="rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">
                {pendingRequests.length} waiting
              </span>
            </div>

            <div className="mt-5 grid gap-4">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((request) => (
                  <form key={request.id} action={approvePendingSignupAction} className="rounded-[1.25rem] border border-border bg-card p-4">
                    <input type="hidden" name="verificationId" value={request.id} />
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2 text-sm">
                        <p className="font-semibold text-foreground">{request.payload.firstName} {request.payload.lastName}</p>
                        <p className="text-muted-foreground">{request.email}</p>
                        <p className="text-muted-foreground">{request.payload.phone}</p>
                        <p className="text-muted-foreground">
                          {request.payload.addressLine}, {request.payload.city}, {request.payload.region}
                        </p>
                        <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                          Requested {new Intl.DateTimeFormat("en-TZ", { dateStyle: "medium", timeStyle: "short" }).format(request.createdAt)}
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 lg:items-end">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${request.expiresAt < new Date() ? "bg-amber-100 text-amber-900" : "bg-secondary text-secondary-foreground"}`}>
                          {request.expiresAt < new Date() ? "Code expired" : "Code active"}
                        </span>
                        <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                          Approve customer manually
                        </button>
                      </div>
                    </div>
                  </form>
                ))
              ) : (
                <div className="rounded-[1.25rem] border border-border bg-card px-4 py-5 text-sm text-muted-foreground">
                  No pending customer signups need manual approval right now.
                </div>
              )}
            </div>
          </div>

          <form action={createManagedUserAction} className="admin-surface grid gap-4 p-6">
            <h2 className="font-heading text-2xl font-semibold">Add user or admin</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="name"
                placeholder="Full name"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
              <input
                name="email"
                type="email"
                placeholder="Email address"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                required
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <input
                name="phone"
                placeholder="Phone number"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              />
              <select
                name="roleCode"
                defaultValue="MANAGER"
                className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              >
                {roleOptions.map((roleCode) => (
                  <option key={roleCode} value={roleCode}>
                    {roleCode}
                  </option>
                ))}
              </select>
            </div>
            <input
              name="password"
              type="password"
              placeholder="Temporary password"
              className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
              required
            />
            <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
              <input type="checkbox" name="isActive" defaultChecked />
              Activate this user immediately
            </label>
            <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Create user
            </button>
          </form>

          <div className="admin-surface p-6">
            <h2 className="font-heading text-2xl font-semibold">Change my password</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Use this for your own admin account. For another user, use the update cards on the right.
            </p>
            <div className="mt-5">
              <ChangePasswordForm compact />
            </div>
          </div>
        </div>

        <div className="grid gap-5">
          {users.map((user) => {
            const currentRole = user.userRoles[0]?.role.code ?? "CUSTOMER"

            return (
              <form key={user.id} action={updateManagedUserAction} className="admin-surface grid gap-4 p-5 sm:p-6">
                <input type="hidden" name="userId" value={user.id} />
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <h3 className="font-heading text-xl font-semibold">{user.name}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full bg-secondary px-3 py-1 font-semibold text-secondary-foreground">{currentRole}</span>
                    <span className="rounded-full bg-accent/15 px-3 py-1 font-semibold text-accent-foreground">
                      {user.emailVerifiedAt ? "Verified" : "Pending verification"}
                    </span>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <input
                    name="name"
                    defaultValue={user.name}
                    className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                  <input
                    name="email"
                    type="email"
                    defaultValue={user.email}
                    className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                    required
                  />
                  <input
                    name="phone"
                    defaultValue={user.phone ?? user.customer?.phone ?? ""}
                    placeholder="Phone number"
                    className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  />
                  <select
                    name="roleCode"
                    defaultValue={currentRole}
                    className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                  >
                    {roleOptions.map((roleCode) => (
                      <option key={roleCode} value={roleCode}>
                        {roleCode}
                      </option>
                    ))}
                  </select>
                </div>

                <input
                  name="password"
                  type="password"
                  placeholder="Optional new password"
                  className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
                />

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <label className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <input type="checkbox" name="isActive" defaultChecked={user.isActive} />
                    Account active
                  </label>
                  <button className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                    Save user
                  </button>
                </div>
              </form>
            )
          })}
        </div>
      </div>
    </AdminShell>
  )
}
