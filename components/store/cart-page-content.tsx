"use client"

import Image from "next/image"
import Link from "next/link"
import { MessageCircleMore, Minus, Plus, ShieldCheck, Trash2 } from "lucide-react"

import { buildWhatsAppLink, formatTzs } from "@/lib/format"
import { useCart } from "@/lib/cart-context"
import type { SiteSettingsShape } from "@/lib/store-types"

export function CartPageContent({ settings }: { settings: SiteSettingsShape }) {
  const { state, subtotal, updateQuantity, removeItem } = useCart()
  const deliveryFee = subtotal > 0 ? 15000 : 0
  const total = subtotal + deliveryFee

  const whatsappMessage =
    state.items.length === 0
      ? "Hello Albert Ochieng, I need help choosing home appliances from Ochieng Store."
      : [
          "Hello Albert Ochieng, I would like to place this order from Ochieng Store:",
          "",
          ...state.items.map((item, index) => {
            const lineTotal = (item.product.discountPrice ?? item.product.price) * item.quantity
            return `${index + 1}. ${item.product.name} x${item.quantity} - ${formatTzs(lineTotal)}`
          }),
          "",
          `Subtotal: ${formatTzs(subtotal)}`,
          `Estimated delivery: ${formatTzs(deliveryFee)}`,
          `Order total: ${formatTzs(total)}`,
          "",
          "Please confirm stock, delivery area, and payment steps.",
        ].join("\n")

  const whatsappHref = buildWhatsAppLink(settings.whatsappPhone, whatsappMessage)

  return (
    <section className="pb-16 pt-10 sm:pb-20 sm:pt-14">
      <div className="page-shell">
        <div className="mb-8">
          <span className="eyebrow">Shopping cart</span>
          <h1 className="mt-4 section-heading">Review your appliance selection.</h1>
          <p className="mt-3 max-w-3xl text-muted-foreground">
            WhatsApp ordering is the primary process here. Send your cart directly for stock confirmation, delivery planning, and payment guidance.
          </p>
        </div>

        {state.items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <h2 className="font-heading text-3xl font-semibold">Your cart is empty.</h2>
            <p className="mt-3 text-muted-foreground">Start with the appliance catalog and compare products that fit your home.</p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Link href="/shop" className="inline-flex rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
                Continue shopping
              </Link>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
              >
                <MessageCircleMore className="size-4" />
                Ask on WhatsApp
              </a>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div className="space-y-4">
              {state.items.map((item) => (
                <article key={item.product.slug} className="glass-card flex flex-col gap-5 p-5 sm:flex-row sm:items-center">
                  <div className="overflow-hidden rounded-[1.2rem] bg-secondary/70 sm:w-32">
                    <Image src={item.product.image} alt={item.product.name} width={320} height={320} className="aspect-square w-full object-cover" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-heading text-2xl font-semibold">{item.product.name}</h2>
                    <p className="mt-1 text-sm uppercase tracking-[0.2em] text-muted-foreground">{item.product.brandSlug}</p>
                    <p className="mt-4 text-sm font-semibold text-foreground">{formatTzs(item.product.discountPrice ?? item.product.price)}</p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                    <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-2 py-2">
                      <button onClick={() => updateQuantity(item.product.slug, item.quantity - 1)} className="rounded-full bg-secondary p-2">
                        <Minus className="size-4" />
                      </button>
                      <span className="w-10 text-center text-sm font-semibold">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.product.slug, item.quantity + 1)} className="rounded-full bg-secondary p-2">
                        <Plus className="size-4" />
                      </button>
                    </div>
                    <button onClick={() => removeItem(item.product.slug)} className="inline-flex items-center gap-2 text-sm font-semibold text-destructive">
                      <Trash2 className="size-4" />
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <aside className="glass-card h-fit p-6">
              <div className="rounded-[1.4rem] border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 size-4 text-accent" />
                  <p>Primary ordering path: send this cart to WhatsApp for direct confirmation from Albert Ochieng.</p>
                </div>
              </div>

              <h2 className="mt-6 font-heading text-2xl font-semibold">Order summary</h2>
              <div className="mt-6 space-y-3 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatTzs(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Estimated delivery</span>
                  <span>{formatTzs(deliveryFee)}</span>
                </div>
                <div className="flex justify-between border-t border-border pt-3 text-base font-semibold">
                  <span>Total</span>
                  <span>{formatTzs(total)}</span>
                </div>
              </div>
              <a
                href={whatsappHref}
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-accent px-5 py-3 text-sm font-semibold text-accent-foreground"
              >
                <MessageCircleMore className="size-4" />
                Order on WhatsApp
              </a>
              <Link href="/checkout" className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground">
                Use checkout form instead
              </Link>
            </aside>
          </div>
        )}
      </div>
    </section>
  )
}
