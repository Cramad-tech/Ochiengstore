import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { POLICY_CONTENT } from "@/lib/site-content"
import { getSiteSettings } from "@/lib/storefront"

export default async function WarrantyPolicyPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero eyebrow="Warranty policy" title={POLICY_CONTENT.warranty.title} description={POLICY_CONTENT.warranty.intro} />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell space-y-4">
          {POLICY_CONTENT.warranty.sections.map((section) => (
            <article key={section} className="glass-card p-6 text-sm text-muted-foreground">
              {section}
            </article>
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
