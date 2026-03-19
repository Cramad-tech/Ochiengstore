"use client"

import Link from "next/link"

import { ProductCard } from "@/components/product-card"
import type { StoreProduct } from "@/lib/store-types"
import { useWishlist } from "@/lib/wishlist-context"

export function WishlistView({ products }: { products: StoreProduct[] }) {
  const { items } = useWishlist()
  const savedProducts = products.filter((product) => items.includes(product.slug))

  if (savedProducts.length === 0) {
    return (
      <div className="glass-card p-12 text-center">
        <h2 className="font-heading text-3xl font-semibold">Your wishlist is empty.</h2>
        <p className="mt-3 text-muted-foreground">Save appliances while you compare models, pricing, and warranty coverage.</p>
        <Link href="/shop" className="mt-6 inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
          Browse products
        </Link>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
      {savedProducts.map((product) => (
        <ProductCard key={product.slug} product={product} />
      ))}
    </div>
  )
}
