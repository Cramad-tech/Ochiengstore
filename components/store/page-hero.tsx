import type React from "react"

export function PageHero({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="pb-8 pt-10 sm:pb-10 sm:pt-14">
      <div className="page-shell">
        <div className="glass-card overflow-hidden bg-[linear-gradient(135deg,#17316a,#102552)] px-6 py-10 text-white md:px-10">
          <span className="eyebrow border-white/12 bg-white/8 text-white">{eyebrow}</span>
          <div className="mt-5 grid gap-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <h1 className="max-w-3xl text-4xl font-semibold leading-tight sm:text-5xl">{title}</h1>
              <p className="mt-4 max-w-2xl text-base text-white/78 sm:text-lg">{description}</p>
            </div>
            {children ? <div>{children}</div> : null}
          </div>
        </div>
      </div>
    </section>
  )
}
