import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { WHY_SHOP_WITH_US } from "@/lib/site-content"
import { getSiteSettings, getTestimonials } from "@/lib/storefront"

export default async function AboutPage() {
  const [testimonials, settings] = await Promise.all([getTestimonials(), getSiteSettings()])

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="About us"
        title="An owner-run Tanzania store built around trust, clarity, and WhatsApp service."
        description="Ochieng Store helps households and businesses buy the right home electricals with clearer specifications, reliable delivery support, and direct guidance from Albert Ochieng."
      >
        <div className="glass-card bg-white/10 p-5 text-sm text-white/82">
          <p>Based in Dar es Salaam and serving buyers across Tanzania.</p>
          <p className="mt-2">Managed directly by Albert Ochieng with no support staff yet, so phone and WhatsApp stay central.</p>
        </div>
      </PageHero>

      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card p-7">
            <span className="eyebrow">Our approach</span>
            <h2 className="mt-4 section-heading">Built to reduce doubt at the point of purchase.</h2>
            <div className="mt-5 space-y-4 text-sm text-muted-foreground">
              <p>
                Buying a fridge, washing machine, or cooker online should not feel risky. We focus on the information buyers need most: model numbers, warranty periods, delivery coverage, installation notes, and WhatsApp support before and after checkout.
              </p>
              <p>
                The business context is simple: support Tanzanian buyers with a clean, mobile-friendly catalog that feels trustworthy, fast, and manageable for a lean owner-led operation.
              </p>
              <p>
                Albert Ochieng currently handles store guidance, customer communication, and order follow-up personally, which is why WhatsApp ordering and support are intentionally front and center.
              </p>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {WHY_SHOP_WITH_US.map((item) => (
              <article key={item.title} className="glass-card p-6">
                <h3 className="font-heading text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm text-muted-foreground">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <div className="glass-card p-7">
            <span className="eyebrow">Customer trust</span>
            <h2 className="mt-4 section-heading">What Tanzanian buyers say after delivery.</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <article key={`${testimonial.name}-${testimonial.city}`} className="rounded-[1.2rem] border border-border bg-card p-5">
                  <p className="text-sm text-muted-foreground">&ldquo;{testimonial.quote}&rdquo;</p>
                  <div className="mt-5">
                    <p className="font-semibold text-foreground">{testimonial.name}</p>
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      {testimonial.role} | {testimonial.city}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
