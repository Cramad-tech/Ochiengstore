"use client"

import Link from "next/link"
import { useState, useSyncExternalStore } from "react"
import { ShieldCheck } from "lucide-react"

import { CookiePreferencesManager } from "@/components/cookie-preferences-manager"
import { readCookiePreferences, saveCookiePreferences, subscribeToCookiePreferences } from "@/lib/cookie-consent"

export function CookieConsentBanner() {
  const preferences = useSyncExternalStore(subscribeToCookiePreferences, readCookiePreferences, () => null)
  const isReady = useSyncExternalStore(
    () => () => undefined,
    () => true,
    () => false,
  )
  const [isManaging, setIsManaging] = useState(false)

  if (!isReady || preferences) {
    return null
  }

  return (
    <div className="fixed inset-x-0 bottom-4 z-[120] px-4">
      <div className="mx-auto max-w-5xl overflow-hidden rounded-[1.75rem] border border-primary/15 bg-white/96 shadow-[0_28px_80px_-30px_rgba(15,23,42,0.52)] backdrop-blur">
        <div className="flex flex-col gap-5 px-5 py-5 sm:px-6 sm:py-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <ShieldCheck className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">Cookie and session choices</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Essential cookies stay on for security. You can accept, reject, or manage the rest before continuing.
                  </p>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                By continuing, you confirm that you have read our{" "}
                <Link href="/privacy-policy" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Privacy Policy
                </Link>
                ,{" "}
                <Link href="/terms-and-conditions" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Terms & Conditions
                </Link>
                ,{" "}
                <Link href="/cookies-policy" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Cookies Policy
                </Link>
                , and{" "}
                <Link href="/session-policy" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Session Policy
                </Link>
                .
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row md:flex-col">
              <button
                type="button"
                onClick={() => setIsManaging((current) => !current)}
                className="inline-flex items-center justify-center rounded-full border border-border px-4 py-2.5 text-sm font-semibold text-foreground"
              >
                {isManaging ? "Hide controls" : "Manage cookies"}
              </button>
            </div>
          </div>

          {isManaging ? (
            <div className="rounded-[1.5rem] border border-border bg-secondary/35 p-4 sm:p-5">
              <CookiePreferencesManager compact />
            </div>
          ) : (
            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
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
                className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
              >
                Accept all
              </button>
              <button
                type="button"
                onClick={() =>
                  saveCookiePreferences({
                    essential: true,
                    functional: false,
                    analytics: false,
                    status: "rejected",
                  })
                }
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
              >
                Reject non-essential
              </button>
              <button
                type="button"
                onClick={() => setIsManaging(true)}
                className="inline-flex items-center justify-center rounded-full border border-primary/18 bg-primary/6 px-5 py-3 text-sm font-semibold text-primary"
              >
                Manage cookies
              </button>
              <Link
                href="/cookies-policy"
                className="inline-flex items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
              >
                Read policy first
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
