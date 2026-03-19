"use client"

import type React from "react"
import { Suspense } from "react"
import { SessionProvider } from "next-auth/react"

import { PageTransitionProvider } from "@/components/providers/page-transition-provider"
import { ThemeProvider } from "@/components/theme-provider"
import { NotificationToast } from "@/components/notification-toast"
import { CartProvider } from "@/lib/cart-context"
import { LanguageProvider } from "@/lib/language-context"
import type { Notification } from "@/lib/notification-context"
import { NotificationProvider } from "@/lib/notification-context"
import { WishlistProvider } from "@/lib/wishlist-context"

export function AppProviders({
  children,
  initialNotifications = [],
}: {
  children: React.ReactNode
  initialNotifications?: Notification[]
}) {
  return (
    <SessionProvider>
      <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
        <Suspense fallback={null}>
          <PageTransitionProvider />
        </Suspense>
        <NotificationProvider initialNotifications={initialNotifications}>
          <LanguageProvider>
            <WishlistProvider>
              <CartProvider>
                {children}
                <NotificationToast />
              </CartProvider>
            </WishlistProvider>
          </LanguageProvider>
        </NotificationProvider>
      </ThemeProvider>
    </SessionProvider>
  )
}
