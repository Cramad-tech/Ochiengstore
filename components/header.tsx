"use client"

import { useMemo, useState } from "react"
import type { Route } from "next"
import Link from "next/link"
import { Heart, LogOut, Menu, MessageCircleMore, ShoppingCart, X } from "lucide-react"
import { signOut, useSession } from "next-auth/react"
import { usePathname } from "next/navigation"

import { BrandLogo } from "@/components/brand-logo"
import { buildWhatsAppLink } from "@/lib/format"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { isAdminRole } from "@/lib/rbac"
import type { SiteSettingsShape } from "@/lib/store-types"
import { useWishlist } from "@/lib/wishlist-context"
import { cn } from "@/lib/utils"

export function Header({ settings }: { settings: SiteSettingsShape }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const pathname = usePathname()
  const { language, setLanguage } = useLanguage()
  const { itemCount } = useCart()
  const { items } = useWishlist()
  const { data: session } = useSession()
  const hasAdminRole = session?.user?.roles?.some((role: string) => isAdminRole(role)) ?? false

  const navItems = useMemo(
    (): Array<{ label: string; href: Route }> => [
      { label: language === "en" ? "Home" : "Nyumbani", href: "/" },
      { label: language === "en" ? "Shop" : "Duka", href: "/shop" },
      { label: language === "en" ? "Categories" : "Makundi", href: "/categories" },
      { label: language === "en" ? "Deals" : "Ofa", href: "/deals" },
      { label: language === "en" ? "Brands" : "Chapa", href: "/brands" },
      { label: language === "en" ? "About" : "Kuhusu", href: "/about" },
      { label: language === "en" ? "Contact" : "Wasiliana", href: "/contact" },
    ],
    [language],
  )

  return (
    <header className="sticky top-0 z-50 border-b border-white/60 bg-background/85 backdrop-blur-xl">
      <div className="page-shell">
        <div className="hidden items-center justify-between py-3 text-xs text-muted-foreground lg:flex">
          <p>
            {language === "en"
              ? "Owner-run appliance ordering across Tanzania with WhatsApp-first confirmations and support."
              : "Uagizaji wa vifaa unaoendeshwa moja kwa moja Tanzania nzima kwa uthibitisho na msaada wa WhatsApp kwanza."}
          </p>
          <div className="flex items-center gap-4">
            <span>{settings.supportPhone}</span>
            <span>{settings.supportEmail}</span>
          </div>
        </div>

        <div className="flex items-center justify-between py-4">
          <Link href="/" className="flex items-center gap-3">
            <BrandLogo compact />
          </Link>

          <nav className="hidden items-center gap-6 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  pathname === item.href ? "text-primary" : "text-foreground/85",
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setLanguage(language === "en" ? "sw" : "en")}
              className="rounded-full border border-border bg-card px-3 py-2 text-xs font-semibold text-foreground transition hover:border-primary/35 hover:text-primary"
            >
              {language === "en" ? "SWA" : "ENG"}
            </button>

            <a
              href={buildWhatsAppLink(settings.whatsappPhone, "Hello, I need help choosing a home appliance.")}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:brightness-95 md:inline-flex md:items-center md:gap-2"
            >
              <MessageCircleMore className="size-4" />
              Order on WhatsApp
            </a>

            <Link href="/cart" className="relative rounded-full border border-border bg-card p-2.5 transition hover:border-primary/30">
              <ShoppingCart className="size-5" />
              {itemCount > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground">
                  {itemCount}
                </span>
              )}
            </Link>

            <Link href="/wishlist" className="relative hidden rounded-full border border-border bg-card p-2.5 sm:block transition hover:border-primary/30">
              <Heart className="size-5" />
              {items.length > 0 && (
                <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-semibold text-accent-foreground">
                  {items.length}
                </span>
              )}
            </Link>

            {session ? (
              <>
                <Link
                  href={(hasAdminRole ? "/admin/dashboard" : "/account") as Route}
                  className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary md:inline-flex"
                >
                  {hasAdminRole ? "Dashboard" : "Account"}
                </Link>
                {!hasAdminRole ? (
                  <Link href={"/account/support" as Route} className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary lg:inline-flex">
                    Support room
                  </Link>
                ) : null}
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary lg:inline-flex"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href={"/login" as Route} className="hidden rounded-full border border-border px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/35 hover:text-primary md:inline-flex">
                  Login
                </Link>
                <Link href={"/signup" as Route} className="hidden rounded-full bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/90 md:inline-flex">
                  Sign up
                </Link>
              </>
            )}

            <button
              onClick={() => setIsMenuOpen((value) => !value)}
              className="rounded-full border border-border bg-card p-2.5 lg:hidden"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="space-y-4 border-t border-border pb-5 pt-4 lg:hidden">
            <div className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={cn(
                    "rounded-2xl px-4 py-3 text-sm font-medium",
                    pathname === item.href ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                  )}
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href="/wishlist"
                onClick={() => setIsMenuOpen(false)}
                className={cn(
                  "rounded-2xl px-4 py-3 text-sm font-medium",
                  pathname === "/wishlist" ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                )}
              >
                {language === "en" ? "Wishlist" : "Orodha ya kupenda"}
              </Link>
              {session ? (
                <>
                  <Link
                    href={(hasAdminRole ? "/admin/dashboard" : "/account") as Route}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium",
                      pathname === (hasAdminRole ? "/admin/dashboard" : "/account") ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                    )}
                  >
                    {hasAdminRole ? (language === "en" ? "Admin dashboard" : "Dashibodi ya admin") : language === "en" ? "My account" : "Akaunti yangu"}
                  </Link>
                  {!hasAdminRole ? (
                    <Link
                      href={"/account/support" as Route}
                      onClick={() => setIsMenuOpen(false)}
                      className={cn(
                        "rounded-2xl px-4 py-3 text-sm font-medium",
                        pathname === "/account/support" ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                      )}
                    >
                      {language === "en" ? "Support room" : "Chumba cha msaada"}
                    </Link>
                  ) : null}
                </>
              ) : !session ? (
                <>
                  <Link
                    href={"/login" as Route}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium",
                      pathname === "/login" ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                    )}
                  >
                    {language === "en" ? "Login" : "Ingia"}
                  </Link>
                  <Link
                    href={"/signup" as Route}
                    onClick={() => setIsMenuOpen(false)}
                    className={cn(
                      "rounded-2xl px-4 py-3 text-sm font-medium",
                      pathname === "/signup" ? "bg-primary/10 text-primary" : "bg-card text-foreground",
                    )}
                  >
                    {language === "en" ? "Sign up" : "Jisajili"}
                  </Link>
                </>
              ) : null}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <a
                href={buildWhatsAppLink(settings.whatsappPhone, "Hello, I need help choosing a home appliance.")}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground"
              >
                <MessageCircleMore className="size-4" />
                Order on WhatsApp
              </a>
              {session ? (
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium"
                >
                  <LogOut className="size-4" />
                  Logout
                </button>
              ) : (
                <Link href={"/login" as Route} className="inline-flex items-center justify-center gap-2 rounded-2xl border border-border px-4 py-3 text-sm font-medium">
                  Sign in
                </Link>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}
