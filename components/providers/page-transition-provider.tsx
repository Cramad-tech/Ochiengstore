"use client"

import { usePathname, useSearchParams } from "next/navigation"
import { useMemo } from "react"

export function PageTransitionProvider() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const routeKey = useMemo(() => `${pathname}?${searchParams.toString()}`, [pathname, searchParams])

  return (
    <div className="pointer-events-none fixed inset-x-0 top-0 z-[120]">
      <div
        key={routeKey}
        className="route-progress-bar h-1 bg-[linear-gradient(90deg,#102552_0%,#d3a63d_55%,#f3cf72_100%)] shadow-[0_10px_28px_-12px_rgba(211,166,61,0.85)]"
      />
    </div>
  )
}
