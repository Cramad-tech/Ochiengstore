"use client"

import { Analytics } from "@vercel/analytics/react"
import { useSyncExternalStore } from "react"

import { areAnalyticsCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

export function AnalyticsGate() {
  const analyticsAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areAnalyticsCookiesAllowed,
    () => false,
  )

  if (!analyticsAllowed) {
    return null
  }

  return <Analytics />
}
