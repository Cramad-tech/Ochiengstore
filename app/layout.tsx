import type React from "react"
import type { Metadata } from "next"
import { Manrope, Space_Grotesk } from "next/font/google"
import { cookies } from "next/headers"

import { AnalyticsGate } from "@/components/analytics-gate"
import { AppProviders } from "@/components/providers/app-providers"
import { FLASH_COOKIE_NAME, parseFlashMessage } from "@/lib/flash"
import "./globals.css"

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
})

const headingFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-heading",
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Ochieng Store",
    template: "%s | Ochieng Store",
  },
  description:
    "Tanzania-focused home appliance and general supplies store with WhatsApp-first ordering, TZS pricing, and delivery support across the country.",
  applicationName: "Ochieng Store",
  keywords: [
    "Tanzania home appliances",
    "buy fridge Tanzania",
    "smart TV Tanzania",
    "washing machine Dar es Salaam",
    "home appliances TZS",
  ],
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
  openGraph: {
    title: "Ochieng Store",
    description: "Trustworthy appliance shopping with blue-and-gold branding, WhatsApp ordering, and delivery across Tanzania.",
    type: "website",
    locale: "en_TZ",
    siteName: "Ochieng Store",
  },
  twitter: {
    card: "summary_large_image",
    title: "Ochieng Store",
    description: "Modern appliance ecommerce built for Tanzanian households.",
  },
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const cookieStore = await cookies()
  const flash = parseFlashMessage(cookieStore.get(FLASH_COOKIE_NAME)?.value)

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${bodyFont.variable} ${headingFont.variable} font-sans antialiased`}>
        <AppProviders initialNotifications={flash ? [{ ...flash, duration: 3400 }] : []}>{children}</AppProviders>
        <AnalyticsGate />
      </body>
    </html>
  )
}
