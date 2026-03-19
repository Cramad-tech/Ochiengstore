import type { Route } from "next"
import Link from "next/link"
import { Mail, MapPin, MessageCircleMore, Phone } from "lucide-react"

import { BrandLogo } from "@/components/brand-logo"
import { buildWhatsAppLink } from "@/lib/format"
import type { SiteSettingsShape } from "@/lib/store-types"

export function SiteFooter({ settings }: { settings: SiteSettingsShape }) {
  const whatsappHref = buildWhatsAppLink(
    settings.whatsappPhone,
    "Hello, I would like help with a home appliance order.",
  )

  return (
    <footer className="border-t border-border bg-foreground pt-14 text-white">
      <div className="page-shell grid gap-12 pb-10 lg:grid-cols-[1fr_0.8fr_0.8fr_0.9fr]">
        <div className="space-y-4">
          <BrandLogo showTagline={false} light />
          <p className="max-w-md text-sm text-white/70">
            Owner-run appliance shopping for Tanzanian homes with clear specs, TZS pricing, WhatsApp ordering, and practical delivery support.
          </p>
          <p className="text-sm text-white/70">Managed directly by Albert Ochieng.</p>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground"
          >
            <MessageCircleMore className="size-4" />
            WhatsApp support
          </a>
        </div>

        <div>
          <p className="font-heading text-lg font-semibold">Shop</p>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            <Link href="/shop">Shop all</Link>
            <Link href="/categories">Categories</Link>
            <Link href="/deals">Deals</Link>
            <Link href="/brands">Brands</Link>
            <Link href="/order-tracking">Order tracking</Link>
          </div>
        </div>

        <div>
          <p className="font-heading text-lg font-semibold">Policies</p>
          <div className="mt-4 grid gap-2 text-sm text-white/70">
            <Link href={"/faq" as Route}>FAQ</Link>
            <Link href={"/warranty-policy" as Route}>Warranty Policy</Link>
            <Link href={"/delivery-policy" as Route}>Delivery Policy</Link>
            <Link href={"/return-refund-policy" as Route}>Return & Refund Policy</Link>
            <Link href={"/cookies-policy" as Route}>Cookies Policy</Link>
            <Link href={"/session-policy" as Route}>Session Policy</Link>
            <Link href={"/privacy-policy" as Route}>Privacy Policy</Link>
            <Link href={"/terms-and-conditions" as Route}>Terms & Conditions</Link>
          </div>
        </div>

        <div>
          <p className="font-heading text-lg font-semibold">Contact</p>
          <div className="mt-4 grid gap-4 text-sm text-white/70">
            <div className="flex items-start gap-3">
              <Phone className="mt-0.5 size-4 text-accent" />
              <span>{settings.supportPhone}</span>
            </div>
            <div className="flex items-start gap-3">
              <Mail className="mt-0.5 size-4 text-accent" />
              <span>{settings.supportEmail}</span>
            </div>
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-4 text-accent" />
              <span>{settings.address}</span>
            </div>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10 py-5">
        <div className="page-shell flex flex-col gap-2 text-xs text-white/55 sm:flex-row sm:items-center sm:justify-between">
          <p>&copy; 2026 Ochieng Store. Built for households across Tanzania.</p>
          <p>Prices in TZS. Delivery timelines depend on stock location and region.</p>
        </div>
      </div>
    </footer>
  )
}
