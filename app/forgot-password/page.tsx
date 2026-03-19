import { ForgotPasswordForm } from "@/components/store/forgot-password-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getSiteSettings } from "@/lib/storefront"

export default async function ForgotPasswordPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Recover access"
        title="Forgot your password? Reset it with an email code."
        description="Enter your email, receive a verification code, and choose a new password without losing your order history or saved delivery details."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <ForgotPasswordForm />
        </div>
      </section>
    </StorefrontShell>
  )
}
