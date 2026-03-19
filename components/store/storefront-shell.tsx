import type React from "react"

import { CookieConsentBanner } from "@/components/cookie-consent-banner"
import { Header } from "@/components/header"
import { SiteFooter } from "@/components/site-footer"
import { SITE_SETTINGS_FALLBACK } from "@/lib/site-content"
import type { SiteSettingsShape } from "@/lib/store-types"

export function StorefrontShell({
  children,
  settings,
}: {
  children: React.ReactNode
  settings?: SiteSettingsShape
}) {
  const resolvedSettings = settings ?? SITE_SETTINGS_FALLBACK

  return (
    <div className="min-h-screen">
      <Header settings={resolvedSettings} />
      <main>{children}</main>
      <SiteFooter settings={resolvedSettings} />
      <CookieConsentBanner />
    </div>
  )
}
