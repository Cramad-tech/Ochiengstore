import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { FAQ_ITEMS } from "@/lib/site-content"
import { getSiteSettings } from "@/lib/storefront"

export default async function FaqPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="FAQ"
        title="Common questions about delivery, warranty, and appliance orders."
        description="These answers help shoppers understand how the store handles fulfillment, payment confirmation, installation notes, and after-sales support."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell space-y-4">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="glass-card p-6">
              <h2 className="font-heading text-xl font-semibold">{item.question}</h2>
              <p className="mt-3 text-sm text-muted-foreground">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </StorefrontShell>
  )
}
