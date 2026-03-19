"use client"

import type React from "react"
import { createContext, useContext, useEffect, useMemo, useState, useSyncExternalStore } from "react"

import { areFunctionalCookiesAllowed, subscribeToCookiePreferences } from "@/lib/cookie-consent"

interface WishlistContextValue {
  items: string[]
  toggleItem: (slug: string) => void
  isSaved: (slug: string) => boolean
  clearWishlist: () => void
}

const WishlistContext = createContext<WishlistContextValue | null>(null)

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<string[]>([])
  const functionalCookiesAllowed = useSyncExternalStore(
    subscribeToCookiePreferences,
    areFunctionalCookiesAllowed,
    () => false,
  )

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem("ochieng_wishlist")
      return
    }

    const savedWishlist = localStorage.getItem("ochieng_wishlist")
    if (!savedWishlist) {
      return
    }

    try {
      setItems(JSON.parse(savedWishlist) as string[])
    } catch {
      localStorage.removeItem("ochieng_wishlist")
    }
  }, [functionalCookiesAllowed])

  useEffect(() => {
    if (!functionalCookiesAllowed) {
      localStorage.removeItem("ochieng_wishlist")
      return
    }

    localStorage.setItem("ochieng_wishlist", JSON.stringify(items))
  }, [functionalCookiesAllowed, items])

  const value = useMemo<WishlistContextValue>(
    () => ({
      items,
      toggleItem: (slug) =>
        setItems((current) => (current.includes(slug) ? current.filter((item) => item !== slug) : [...current, slug])),
      isSaved: (slug) => items.includes(slug),
      clearWishlist: () => setItems([]),
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
