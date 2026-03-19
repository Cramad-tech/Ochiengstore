import { CookiePreferencesManager } from "@/components/cookie-preferences-manager"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { POLICY_CONTENT } from "@/lib/site-content"
import { getSiteSettings } from "@/lib/storefront"

export default async function CookiesPolicyPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero eyebrow="Cookies" title={POLICY_CONTENT.cookies.title} description={POLICY_CONTENT.cookies.intro} />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell space-y-6">
          <div className="glass-card p-6">
            <h2 className="font-heading text-2xl font-semibold">Manage your cookie choices</h2>
            <p className="mt-3 text-sm text-muted-foreground">
              You can accept all cookies, reject non-essential storage, or save custom preferences here at any time.
            </p>
            <div className="mt-5">
              <CookiePreferencesManager />
            </div>
          </div>
          {POLICY_CONTENT.cookies.sections.map((section) => (
            <article key={section} className="glass-card p-6 text-sm text-muted-foreground">
              {section}
            </article>
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
