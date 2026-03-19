"use client"

import { BadgePercent, ShieldCheck, Truck } from "lucide-react"

import { ProductCard } from "@/components/product-card"
import { useLanguage } from "@/lib/language-context"
import type { StoreProduct } from "@/lib/store-types"

export function OffersSection({ deals }: { deals: StoreProduct[] }) {
  const { language } = useLanguage()

  if (deals.length === 0) {
    return null
  }

  return (
    <section className="py-16 sm:py-20">
      <div className="page-shell space-y-8">
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="glass-card bg-[linear-gradient(135deg,#17316a,#102552)] p-8 text-white">
            <span className="eyebrow border-white/10 bg-white/10 text-white">
              {language === "en" ? "Featured deals" : "Ofa maalum"}
            </span>
            <h2 className="mt-5 section-heading text-white">
              {language === "en"
                ? "Promotions that keep your appliance budget under control."
                : "Ofa zinazosaidia bajeti yako ya vifaa kukaa sawa."}
            </h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                {
                  icon: BadgePercent,
                  title: language === "en" ? "Deal pricing" : "Bei za ofa",
                },
                {
                  icon: Truck,
                  title: language === "en" ? "Regional delivery" : "Uwasilishaji wa mikoa",
                },
                {
                  icon: ShieldCheck,
                  title: language === "en" ? "Warranty clarity" : "Uwazi wa dhamana",
                },
              ].map((item) => (
                <div key={item.title} className="rounded-[1.2rem] border border-white/10 bg-white/6 p-4">
                  <item.icon className="size-5" />
                  <p className="mt-4 text-sm font-semibold">{item.title}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {deals.slice(0, 2).map((product) => (
              <ProductCard key={product.slug} product={product} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
