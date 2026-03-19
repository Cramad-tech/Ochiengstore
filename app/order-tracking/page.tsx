import { OrderTrackingForm } from "@/components/store/order-tracking-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { getSiteSettings } from "@/lib/storefront"

export default async function OrderTrackingPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Order tracking"
        title="Track delivery and payment confirmation using your order number."
        description="Enter the order number and checkout phone number to view the latest order and payment status."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <OrderTrackingForm />
        </div>
      </section>
    </StorefrontShell>
  )
}
