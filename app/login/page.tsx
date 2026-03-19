import type { Route } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AccountLoginForm } from "@/components/store/account-login-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { isAdminRole } from "@/lib/rbac"
import { getSiteSettings } from "@/lib/storefront"

export default async function LoginPage() {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()])

  if (session) {
    const hasAdminRole = session.user.roles.some((role) => isAdminRole(role))
    redirect((hasAdminRole ? "/admin/dashboard" : "/account") as Route)
  }

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Account access"
        title="Sign in once, then go where your role belongs."
        description="Customers and admins now use the same login page. Your email and role decide whether you enter the customer account area or the admin dashboard."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <AccountLoginForm />
        </div>
      </section>
    </StorefrontShell>
  )
}
