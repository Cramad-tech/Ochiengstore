export const COOKIE_PREFERENCES_KEY = "ochieng_cookie_preferences"
export const COOKIE_CONSENT_EVENT = "ochieng-cookie-consent-change"

export type CookieConsentStatus = "accepted" | "rejected" | "custom"

export type CookiePreferences = {
  essential: true
  functional: boolean
  analytics: boolean
  status: CookieConsentStatus
}

export const NON_ESSENTIAL_STORAGE_KEYS = ["ochieng_cart", "ochieng_wishlist", "app_language"] as const

let cachedPreferencesRaw: string | null | undefined
let cachedPreferencesSnapshot: CookiePreferences | null = null

export function subscribeToCookiePreferences(callback: () => void) {
  if (typeof window === "undefined") {
    return () => undefined
  }

  const handleChange = () => callback()

  window.addEventListener("storage", handleChange)
  window.addEventListener(COOKIE_CONSENT_EVENT, handleChange)

  return () => {
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(COOKIE_CONSENT_EVENT, handleChange)
  }
}

export function readCookiePreferences(): CookiePreferences | null {
  if (typeof window === "undefined") {
    return null
  }

  const raw = window.localStorage.getItem(COOKIE_PREFERENCES_KEY)
  if (raw === cachedPreferencesRaw) {
    return cachedPreferencesSnapshot
  }

  cachedPreferencesRaw = raw
  cachedPreferencesSnapshot = parseCookiePreferences(raw)
  return cachedPreferencesSnapshot
}

export function saveCookiePreferences(preferences: CookiePreferences) {
  if (typeof window === "undefined") {
    return
  }

  const serialized = JSON.stringify(preferences)
  cachedPreferencesRaw = serialized
  cachedPreferencesSnapshot = preferences
  window.localStorage.setItem(COOKIE_PREFERENCES_KEY, serialized)

  if (!preferences.functional) {
    clearNonEssentialStorage()
  }

  window.dispatchEvent(new Event(COOKIE_CONSENT_EVENT))
}

export function clearNonEssentialStorage() {
  if (typeof window === "undefined") {
    return
  }

  for (const key of NON_ESSENTIAL_STORAGE_KEYS) {
    window.localStorage.removeItem(key)
  }
}

export function areFunctionalCookiesAllowed() {
  return readCookiePreferences()?.functional ?? false
}

export function areAnalyticsCookiesAllowed() {
  return readCookiePreferences()?.analytics ?? false
}

function parseCookiePreferences(raw: string | null): CookiePreferences | null {
  if (!raw) {
    return null
  }

  try {
    const parsed = JSON.parse(raw) as Partial<CookiePreferences>
    if (
      parsed.essential !== true ||
      typeof parsed.functional !== "boolean" ||
      typeof parsed.analytics !== "boolean" ||
      !parsed.status
    ) {
      return null
    }

    if (!["accepted", "rejected", "custom"].includes(parsed.status)) {
      return null
    }

    return {
      essential: true,
      functional: parsed.functional,
      analytics: parsed.analytics,
      status: parsed.status,
    }
  } catch {
    return null
  }
}
