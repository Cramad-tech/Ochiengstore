import { auth } from "@/auth"
import { CheckoutForm } from "@/components/store/checkout-form"
import { PageHero } from "@/components/store/page-hero"
import { StorefrontShell } from "@/components/store/storefront-shell"
import { prisma } from "@/lib/prisma"
import { getSiteSettings } from "@/lib/storefront"

export default async function CheckoutPage() {
  const [settings, session] = await Promise.all([getSiteSettings(), auth()])
  const customer = session?.user?.id
    ? await prisma.customer.findUnique({
        where: { userId: session.user.id },
        include: {
          addresses: {
            where: { isDefault: true },
            take: 1,
          },
        },
      })
    : null
  const defaultAddress = customer?.addresses[0]
  const customerName = customer ? `${customer.firstName} ${customer.lastName}`.trim() : (session?.user?.name ?? "")

  return (
    <StorefrontShell settings={settings}>
      <PageHero
        eyebrow="Checkout"
        title="Complete your order with delivery details and WhatsApp-friendly confirmation."
        description="Checkout is phone-first, region-aware, and optimized for Tanzania-friendly ordering with WhatsApp confirmation as the recommended process."
      />
      <section className="pb-16 sm:pb-20">
        <div className="page-shell">
          <CheckoutForm
            regions={settings.regions}
            paymentAccounts={{
              selcom: process.env.SELCOM_ACCOUNT_NUMBER ?? "5525103937323",
              equity: process.env.EQUITY_ACCOUNT_NUMBER ?? "3007111936105",
              yasLipa: process.env.YAS_LIPA_ACCOUNT_NUMBER ?? "8431835",
            }}
            initialValues={{
              customerName,
              email: customer?.email ?? session?.user?.email ?? "",
              phone: customer?.phone ?? "",
              region: defaultAddress?.region ?? settings.regions[0] ?? "Dar es Salaam",
              city: defaultAddress?.city ?? "",
              district: defaultAddress?.district ?? "",
              addressLine: defaultAddress?.line1 ?? "",
            }}
          />
        </div>
      </section>
    </StorefrontShell>
  )
}
