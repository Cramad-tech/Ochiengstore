"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react"

import { areFunctionalCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

interface WishlistContextValue {
  items: string[]
  toggleItem: (slug: string) => void
  isSaved: (slug: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

const WISHLIST_STORAGE_KEY = "ochieng_wishlist"
const WISHLIST_CHANGE_EVENT = "ochieng-wishlist-change"

function readWishlistSnapshot(): string[] {
  if (typeof window === "undefined" || !areFunctionalCookiesAllowed()) {
    return []
  }

  const savedWishlist = window.localStorage.getItem(WISHLIST_STORAGE_KEY)
  if (!savedWishlist) {
    return []
  }

  try {
    const parsed = JSON.parse(savedWishlist) as unknown
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : []
  } catch {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY)
    return []
  }
}

function subscribeToWishlistStore(callback: () => void) {
  const unsubscribeCookies = subscribeToCookiePreferences(callback)

  if (typeof window === "undefined") {
    return unsubscribeCookies
  }

  const handleChange = (event: Event) => {
    if (event instanceof StorageEvent && event.key && event.key !== WISHLIST_STORAGE_KEY) {
      return
    }

    callback()
  }

  window.addEventListener("storage", handleChange)
  window.addEventListener(WISHLIST_CHANGE_EVENT, handleChange)

  return () => {
    unsubscribeCookies()
    window.removeEventListener("storage", handleChange)
    window.removeEventListener(WISHLIST_CHANGE_EVENT, handleChange)
  }
}

function writeWishlist(items: string[]) {
  if (typeof window === "undefined") {
    return
  }

  if (!areFunctionalCookiesAllowed()) {
    window.localStorage.removeItem(WISHLIST_STORAGE_KEY)
  } else {
    window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(items))
  }

  window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT))
}

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const functionalCookiesAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areFunctionalCookiesAllowed,
    () => false,
  )
  const items = useSyncExternalStore(
    subscribeToWishlistStore,
    readWishlistSnapshot,
    () => [],
  )

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem(WISHLIST_STORAGE_KEY)
      window.dispatchEvent(new Event(WISHLIST_CHANGE_EVENT))
    }
  }, [functionalCookiesAllowed])

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      toggleItem: (slug) =>
        writeWishlist(items.includes(slug) ? items.filter((item) => item !== slug) : [...items, slug]),
      isSaved: (slug) => items.includes(slug),
      clearWishlist: () => writeWishlist([]),
    }),
    [items],
  )

  return <WishlistContext.Provider value={value}>{children}</WishlistContext.Provider>
}

export function useWishlist() {
  const context = useContext(WishlistContext)
  if (!context) {
    throw new Error("useWishlist must be used within WishlistProvider")
  }
  return context
}
