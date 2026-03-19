"use client"

import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart, Star } from "lucide-react"

import { formatTzs } from "@/lib/format"
import type { StoreProduct } from "@/lib/store-types"
import { useCart } from "@/lib/cart-context"
import { useLanguage } from "@/lib/language-context"
import { useNotification } from "@/lib/notification-context"
import { useWishlist } from "@/lib/wishlist-context"
import { cn } from "@/lib/utils"

interface ProductCardProps {
  product: StoreProduct
}

export function ProductCard({ product }: ProductCardProps) {
  const { language } = useLanguage()
  const { addItem } = useCart()
  const { addNotification } = useNotification()
  const { isSaved, toggleItem } = useWishlist()

  const name = language === "en" ? product.name : product.nameSw
  const description = language === "en" ? product.shortDescription : product.shortDescriptionSw
  const activePrice = product.discountPrice ?? product.price

  const handleAddToCart = () => {
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

    addNotification(
      language === "en" ? `${product.name} added to cart.` : `${product.nameSw} imeongezwa kwenye kikapu.`,
      "success",
      2200,
    )
  }

  return (
    <article className="group glass-card overflow-hidden">
      <Link href={`/products/${product.slug}`} className="relative block overflow-hidden bg-secondary/70">
        <Image
          src={product.image}
          alt={name}
          width={720}
          height={720}
          className="aspect-square w-full object-cover transition duration-500 group-hover:scale-[1.03]"
        />
        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {product.discountPrice ? (
            <span className="rounded-full bg-accent px-3 py-1 text-xs font-semibold text-accent-foreground">
              {language === "en" ? "Deal" : "Ofa"}
            </span>
          ) : null}
          {product.newArrival ? (
            <span className="rounded-full bg-primary px-3 py-1 text-xs font-semibold text-primary-foreground">
              {language === "en" ? "New" : "Mpya"}
            </span>
          ) : null}
        </div>
      </Link>

      <div className="space-y-3 p-4 sm:space-y-4 sm:p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-muted-foreground">{product.brandSlug}</p>
            <Link href={`/products/${product.slug}`} className="mt-1 block font-heading text-base font-semibold leading-tight text-foreground transition group-hover:text-primary sm:text-lg">
              {name}
            </Link>
          </div>
          <button
            onClick={() => toggleItem(product.slug)}
            className={cn(
              "rounded-full border p-2 transition",
              isSaved(product.slug) ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-muted-foreground",
            )}
            aria-label="Toggle wishlist"
          >
            <Heart className={cn("size-4", isSaved(product.slug) && "fill-current")} />
          </button>
        </div>

        <p className="line-clamp-2 text-xs text-muted-foreground sm:text-sm">{description}</p>

        <div className="flex items-center gap-2 text-sm">
          <div className="flex items-center gap-1 text-accent">
            <Star className="size-4 fill-current" />
            <span className="font-semibold text-foreground">{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-muted-foreground">({product.reviewCount})</span>
          <span className="ml-auto rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
            {product.warrantyMonths}m warranty
          </span>
        </div>

        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-lg font-bold text-foreground sm:text-xl">{formatTzs(activePrice)}</p>
            {product.discountPrice ? <p className="text-sm text-muted-foreground line-through">{formatTzs(product.price)}</p> : null}
          </div>
          <button
            onClick={handleAddToCart}
            disabled={product.stock < 1}
            className="inline-flex items-center gap-2 rounded-full bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4 sm:text-sm"
          >
            <ShoppingCart className="size-4" />
            {language === "en" ? "Add" : "Ongeza"}
          </button>
        </div>
      </div>
    </article>
  )
}
