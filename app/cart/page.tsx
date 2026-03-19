import { StorefrontShell } from "@/components/store/storefront-shell"
import { CartPageContent } from "@/components/store/cart-page-content"
import { getSiteSettings } from "@/lib/storefront"

export default async function CartPage() {
  const settings = await getSiteSettings()

  return (
    <StorefrontShell settings={settings}>
      <CartPageContent settings={settings} />
    </StorefrontShell>
  )
}
