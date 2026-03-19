"use client"

import Link from "next/link"

import { useLanguage } from "@/lib/language-context"
import type { StoreCategory } from "@/lib/store-types"

export function CategoryGrid({ categories }: { categories: StoreCategory[] }) {
  const { language } = useLanguage()

  return (
    <section className="py-16 sm:py-20">
      <div className="page-shell">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="space-y-3">
            <span className="eyebrow">{language === "en" ? "Featured categories" : "Makundi maarufu"}</span>
            <h2 className="section-heading">{language === "en" ? "Shop by appliance type" : "Nunua kwa aina ya kifaa"}</h2>
          </div>
          <Link href="/categories" className="hidden text-sm font-semibold text-primary md:inline-flex">
            {language === "en" ? "View all categories" : "Tazama makundi yote"}
          </Link>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          {categories.map((category) => (
            <Link key={category.slug} href={`/categories/${category.slug}`} className="glass-card group flex min-h-52 flex-col justify-between p-6 transition hover:-translate-y-1">
              <div>
                <p className="text-xs uppercase tracking-[0.26em] text-primary">{category.icon}</p>
                <h3 className="mt-4 font-heading text-2xl font-semibold text-foreground transition group-hover:text-primary">
                  {language === "en" ? category.name : category.nameSw}
                </h3>
                <p className="mt-3 text-sm text-muted-foreground">
                  {language === "en" ? category.description : category.descriptionSw}
                </p>
              </div>
              <span className="mt-6 inline-flex items-center text-sm font-semibold text-foreground/80 transition group-hover:text-primary">
                {language === "en" ? "Browse collection" : "Vinjari mkusanyiko"}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
