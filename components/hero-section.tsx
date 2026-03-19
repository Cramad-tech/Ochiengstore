"use client"

import type React from "react"
import type { Route } from "next"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { ArrowRight, MessageCircleMore, Search } from "lucide-react"
import { useState } from "react"

import { BrandMark } from "@/components/brand-logo"
import { buildWhatsAppLink, formatCompactNumber } from "@/lib/format"
import { useLanguage } from "@/lib/language-context"
import type { StoreBanner } from "@/lib/store-types"

export function HeroSection({
  banner,
  productCount,
  whatsappPhone,
}: {
  banner: StoreBanner
  productCount: number
  whatsappPhone: string
}) {
  const { language } = useLanguage()
  const [searchQuery, setSearchQuery] = useState("")
  const router = useRouter()
  const whatsappHref = buildWhatsAppLink(
    whatsappPhone,
    "Hello Albert Ochieng, I would like to place a home appliance order from Ochieng Store.",
  )

  const handleSearch = (event: React.FormEvent) => {
    event.preventDefault()
    router.push(`/shop?search=${encodeURIComponent(searchQuery)}`)
  }

  return (
    <section className="relative overflow-hidden pb-12 pt-10 sm:pb-16 sm:pt-14">
      <div className="page-shell">
        <div className="glass-card overflow-hidden border border-primary/10 p-0 shadow-[0_30px_80px_-40px_rgba(15,23,42,0.5)]">
          <div className="grid lg:grid-cols-[1.15fr_0.85fr]">
            <div className="relative overflow-hidden bg-[linear-gradient(145deg,#0c1f4a_0%,#17316a_52%,#102552_100%)] px-6 py-8 text-white md:px-10 xl:px-14 xl:py-12">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(212,161,43,0.24),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(255,255,255,0.14),transparent_24%)]" />
              <div className="relative space-y-7">
                <span className="eyebrow border-white/15 bg-white/10 text-white">
                  {language === "en" ? banner.eyebrow : banner.eyebrowSw}
                </span>

                <div className="max-w-3xl space-y-4">
                  <h1 className="max-w-2xl text-4xl font-semibold leading-tight sm:text-5xl xl:text-6xl">
                    {language === "en" ? banner.title : banner.titleSw}
                  </h1>
                  <p className="max-w-2xl text-base text-white/82 sm:text-lg">
                    {language === "en" ? banner.description : banner.descriptionSw}
                  </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <Link
                    href={banner.ctaHref as Route}
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-semibold text-accent-foreground transition hover:brightness-95"
                  >
                    {language === "en" ? banner.ctaLabel : banner.ctaLabelSw}
                    <ArrowRight className="size-4" />
                  </Link>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-full border border-white/18 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/14"
                  >
                    <MessageCircleMore className="size-4" />
                    {language === "en" ? "Order on WhatsApp" : "Agiza kwa WhatsApp"}
                  </a>
                </div>

                <form onSubmit={handleSearch} className="flex flex-col gap-3 rounded-[1.4rem] border border-white/12 bg-white/8 p-2 sm:flex-row sm:items-center">
                  <div className="relative flex-1">
                    <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-white/58" />
                    <input
                      value={searchQuery}
                      onChange={(event) => setSearchQuery(event.target.value)}
                      placeholder={language === "en" ? "Search TV, fridge, washer..." : "Tafuta TV, friji, mashine..."}
                      className="w-full rounded-[1rem] border border-white/10 bg-white/12 px-11 py-3.5 text-sm text-white placeholder:text-white/58 focus:border-accent/70 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-[1rem] bg-white px-6 py-3.5 text-sm font-semibold text-foreground transition hover:bg-white/90"
                  >
                    {language === "en" ? "Search catalog" : "Tafuta katalogi"}
                  </button>
                </form>

                <div className="flex flex-wrap gap-3 text-sm text-white/76">
                  {[
                    language === "en" ? "TZS pricing" : "Bei za TZS",
                    language === "en" ? "Delivery across Tanzania" : "Uwasilishaji Tanzania nzima",
                    language === "en" ? "Owner-run by Albert Ochieng" : "Inaendeshwa na Albert Ochieng",
                  ].map((item) => (
                    <span key={item} className="rounded-full border border-white/12 bg-white/8 px-4 py-2">
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-[radial-gradient(circle_at_top,rgba(212,161,43,0.18),transparent_36%),linear-gradient(180deg,#fbfaf6,#f2f5fb)] px-6 py-8 md:px-8 xl:px-10 xl:py-12">
              <div className="rounded-[1.6rem] border border-primary/10 bg-white/90 p-5 shadow-[0_20px_50px_-28px_rgba(15,23,42,0.35)]">
                <div className="flex items-center gap-4">
                  <BrandMark className="h-12 w-12" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.28em] text-primary">
                      {language === "en" ? "WhatsApp-first ordering" : "Agizo la WhatsApp kwanza"}
                    </p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {language === "en"
                        ? "Talk directly to Albert Ochieng for stock checks, delivery planning, and payment guidance."
                        : "Ongea moja kwa moja na Albert Ochieng kwa uhakiki wa stok, mipango ya delivery na mwongozo wa malipo."}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {[
                  {
                    title: language === "en" ? "Big appliances" : "Vifaa vikubwa",
                    detail: language === "en" ? "Fridges, freezers, washers, cookers" : "Friji, friza, mashine, cookers",
                  },
                  {
                    title: language === "en" ? "Small appliances" : "Vifaa vidogo",
                    detail: language === "en" ? "Microwaves, kettles, blenders, irons" : "Microwave, birika, blender, pasi",
                  },
                  {
                    title: language === "en" ? "Entertainment" : "Burudani",
                    detail: language === "en" ? "TVs, speakers, soundbars, home audio" : "TV, spika, soundbar, audio ya nyumbani",
                  },
                  {
                    title: language === "en" ? "Support" : "Msaada",
                    detail: language === "en" ? "WhatsApp, warranty, delivery, installation" : "WhatsApp, dhamana, delivery, usakinishaji",
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-[1.35rem] border border-primary/10 bg-white/90 p-5 shadow-sm">
                    <p className="text-sm font-semibold uppercase tracking-[0.26em] text-primary">{item.title}</p>
                    <p className="mt-3 text-sm text-muted-foreground">{item.detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 rounded-[1.5rem] bg-[linear-gradient(145deg,#17316a,#0c1f4a)] p-6 text-white shadow-[0_20px_50px_-30px_rgba(15,23,42,0.55)]">
                <p className="text-xs uppercase tracking-[0.3em] text-white/72">
                  {language === "en" ? "Ready stock" : "Bidhaa zilizopo"}
                </p>
                <p className="mt-3 text-3xl font-semibold">{formatCompactNumber(productCount)}</p>
                <p className="mt-2 text-sm text-white/74">
                  {language === "en"
                    ? "Appliance options ready to compare in TZS with delivery support across Tanzania."
                    : "Chaguzi za vifaa tayari kulinganishwa kwa TZS zikiwa na msaada wa delivery Tanzania nzima."}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
