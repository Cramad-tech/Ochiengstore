import type { Route } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { AccountSignupForm } from "@/components/store/account-signup-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { isAdminRole } from "@/lib/rbac"
import { getSiteSettings } from "@/lib/storefront"

export default async function SignupPage() {
  const [session, settings] = await Promise.all([auth(), getSiteSettings()])

  if (session) {
    const hasAdminRole = session.user.roles.some((role) => isAdminRole(role))
    redirect((hasAdminRole ? "/admin/dashboard" : "/account") as Route)
  }

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Customer signup"
        title="Create your account, verify your email, and continue securely."
        description="New customers receive a verification code by email before they can sign in. If delivery fails, Albert can still approve the signup securely from the admin console."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <AccountSignupForm regions={settings.regions} />
        </div>
      </section>
    </StorefrontShell>
  )
}
