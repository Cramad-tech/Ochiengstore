import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { POLICY_CONTENT } from "@/lib/site-content"
import { getSiteSettings } from "@/lib/storefront"

export default async function PrivacyPolicyPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero eyebrow="Privacy" title={POLICY_CONTENT.privacy.title} description={POLICY_CONTENT.privacy.intro} />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell space-y-4">
          {POLICY_CONTENT.privacy.sections.map((section) => (
            <article key={section} className="glass-card p-6 text-sm text-muted-foreground">
              {section}
            </article>
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
