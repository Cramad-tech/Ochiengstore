"use client"
import { Heart, MessageCircleMore, ShoppingCart } from "lucide-react"

import { buildWhatsAppLink } from "@/lib/format"
import type { StoreProduct } from "@/lib/store-types"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { useNotification } from "@/lib/notification-context"
import { useWishlist } from "@/lib/wishlist-context"
import { cn } from "@/lib/utils"

export function ProductActions({ product, whatsappPhone }: { product: StoreProduct; whatsappPhone: string }) {
  const { language } = useLanguage()
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const { isSaved, toggleItem } = useWishlist()

  const whatsappHref = buildWhatsAppLink(
    whatsappPhone,
    `Hello, I would like to ask about ${product.name} (${product.modelNumber}).`,
  )

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <a
        href={whatsappHref}
        target="_blank"
        rel="noreferrer"
        className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
      >
        <MessageCircleMore className="size-4" />
        {language === "en" ? "Order on WhatsApp" : "Agiza kwa WhatsApp"}
      </a>
      <button
        onClick={() => {
          addItem({
            slug: product.slug,
            name: product.name,
            nameSw: product.nameSw,
            image: product.image,
            price: product.price,
            discountPrice: product.discountPrice,
            stock: product.stock,
            warrantyMonths: product.warrantyMonths,
            categorySlug: product.categorySlug,
            brandSlug: product.brandSlug,
          })
          addNotification(language === "en" ? "Added to cart." : "Imeongezwa kwenye kikapu.", "success", 2000)
        }}
        disabled={product.stock < 1}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        <ShoppingCart className="size-4" />
        {language === "en" ? "Add to cart" : "Ongeza kwenye kikapu"}
      </button>
      <button
        onClick={() => toggleItem(product.slug)}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full border px-5 py-3 text-sm font-semibold transition",
          isSaved(product.slug) ? "border-primary bg-primary/8 text-primary" : "border-border bg-card text-foreground",
        )}
      >
        <Heart className={cn("size-4", isSaved(product.slug) && "fill-current")} />
        {language === "en" ? "Wishlist" : "Orodha ya kupenda"}
      </button>
    </div>
  )
}
