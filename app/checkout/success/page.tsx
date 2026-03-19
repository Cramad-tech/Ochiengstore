import Link from "next/link"

import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getSiteSettings } from "@/lib/storefront"

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams
  const settings = await getSiteSettings()
  const orderNumber = typeof params.order === "string" ? params.order : "Pending confirmation"
  const paymentInstructions = typeof params.payment === "string" ? params.payment : ""

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Order confirmed"
        title="Your order request has been received."
        description="We will confirm payment and delivery details shortly, with WhatsApp follow-up prioritized for direct order confirmation."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <div className="glass-card max-w-3xl p-8">
            <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Order number</p>
            <h2 className="mt-3 font-heading text-4xl font-semibold">{orderNumber}</h2>
            <p className="mt-5 text-muted-foreground">
              Keep this order number and the phone used at checkout for tracking, support, and warranty follow-up.
            </p>
            {paymentInstructions ? (
              <div className="mt-6 rounded-[1.3rem] border border-border bg-secondary/60 p-5">
                <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Payment instructions</p>
                <p className="mt-3 text-sm text-foreground">{paymentInstructions}</p>
              </div>
            ) : null}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="/order-tracking" className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Track order
              </Link>
              <Link href="/shop" className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground">
                Continue shopping
              </Link>
            </div>
          </div>
        </div>
      </section>
    </StorefrontShell>
  )
}
