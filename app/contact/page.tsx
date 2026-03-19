import { MessageCircleMore, Phone, Store, UserRound } from "lucide-react"

import { ContactForm } from "@/components/store/contact-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getSiteSettings } from "@/lib/storefront"

export default async function ContactPage() {
  const settings = await getSiteSettings()
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "Store",
    name: settings.storeName,
    image: `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/catalog/refrigerator.svg`,
    telephone: settings.supportPhone,
    email: settings.supportEmail,
    address: {
      "@type": "PostalAddress",
      streetAddress: settings.address,
      addressLocality: "Dar es Salaam",
      addressCountry: "TZ",
    },
    areaServed: settings.regions,
    currenciesAccepted: "TZS",
  }

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Contact us"
        title="Talk directly to Albert Ochieng about stock, delivery, or installation."
        description="Customers can reach the store for product recommendations, WhatsApp orders, delivery confirmations, after-sales support, and bulk or business purchases."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="grid gap-4">
            {[
              { icon: Phone, title: "Phone & WhatsApp", detail: settings.supportPhone },
              { icon: UserRound, title: "Owner", detail: "Albert Ochieng" },
              { icon: Store, title: "Store location", detail: settings.address },
              { icon: MessageCircleMore, title: "Email", detail: settings.supportEmail },
            ].map((item) => (
              <div key={item.title} className="glass-card p-6">
                <item.icon className="size-5 text-primary" />
                <h2 className="mt-4 font-heading text-xl font-semibold">{item.title}</h2>
                <p className="mt-2 text-sm text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
          <ContactForm />
        </div>
      </section>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }} />
    </StorefrontShell>
  )
}
