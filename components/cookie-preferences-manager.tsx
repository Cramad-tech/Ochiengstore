"use client"

import { useEffect, useState, useSyncExternalStore } from "react"

import {
  readCookiePreferences,
  saveCookiePreferences,
  subscribeToCookiePreferences,
  type CookieConsentStatus,
} from "@/lib/cookie-consent"

export function CookiePreferencesManager({ compact = false }: { compact?: boolean }) {
  const preferences = useSyncExternalStore(subscribeToCookiePreferences, readCookiePreferences, () => null)
  const [functional, setFunctional] = useState(true)
  const [analytics, setAnalytics] = useState(false)

  useEffect(() => {
    if (!preferences) {
      setFunctional(true)
      setAnalytics(false)
      return
    }

    setFunctional(preferences.functional)
    setAnalytics(preferences.analytics)
  }, [preferences])

  const savePreferences = (status: CookieConsentStatus) => {
    saveCookiePreferences({
      essential: true,
      functional,
      analytics,
      status,
    })
  }

  return (
    <div className="space-y-4">
      <div className="rounded-[1.3rem] border border-border bg-card px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-semibold text-foreground">Essential cookies</p>
            <p className="mt-1 text-sm text-muted-foreground">Required for secure sign-in, policy choices, and session protection.</p>
          </div>
          <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">Always on</span>
        </div>
      </div>

      <label className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-border bg-card px-4 py-4">
        <div>
          <p className="font-semibold text-foreground">Functional storage</p>
          <p className="mt-1 text-sm text-muted-foreground">Remember cart, wishlist, and language preferences on this device.</p>
        </div>
        <input type="checkbox" checked={functional} onChange={(event) => setFunctional(event.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
      </label>

      <label className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-border bg-card px-4 py-4">
        <div>
          <p className="font-semibold text-foreground">Analytics</p>
          <p className="mt-1 text-sm text-muted-foreground">Help us understand performance and improve the shopping experience.</p>
        </div>
        <input type="checkbox" checked={analytics} onChange={(event) => setAnalytics(event.target.checked)} className="mt-1 size-4 accent-[var(--primary)]" />
      </label>

      <div className={`flex ${compact ? "flex-col gap-3" : "flex-col gap-3 sm:flex-row sm:flex-wrap"}`}>
        <button
          type="button"
          onClick={() => savePreferences("custom")}
          className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
        >
          Save preferences
        </button>
        <button
          type="button"
          onClick={() => {
            setFunctional(false)
            setAnalytics(false)
            saveCookiePreferences({
              essential: true,
              functional: false,
              analytics: false,
              status: "rejected",
            })
          }}
          className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
        >
          Reject non-essential
        </button>
        <button
          type="button"
          onClick={() =>
            saveCookiePreferences({
              essential: true,
              functional: true,
              analytics: true,
              status: "accepted",
            })
          }
          className="inline-flex items-center justify-center rounded-full border border-primary/20 bg-primary/8 px-5 py-3 text-sm font-semibold text-primary"
        >
          Accept all
        </button>
      </div>
    </div>
  )
}
