import { cn } from "@/lib/utils"

const BRAND_BLUE = "#17316A"
const BRAND_GOLD = "#C69526"

export function BrandMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 160 144" fill="none" xmlns="http://www.w3.org/2000/svg" className={cn("h-12 w-12", className)} aria-hidden="true">
      <path
        d="M22 20H39C47 20 54 25 57 33L66 56H130"
        stroke={BRAND_BLUE}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 68C67 55 57 48 42 48C24 48 10 62 10 80C10 98 24 112 42 112C57 112 67 105 78 92"
        stroke={BRAND_BLUE}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M78 68C89 55 100 48 116 48C134 48 148 62 148 80C148 98 134 112 116 112C101 112 90 105 78 92"
        stroke={BRAND_GOLD}
        strokeWidth="12"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M74 122H112" stroke={BRAND_BLUE} strokeWidth="11" strokeLinecap="round" />
      <path
        d="M65 122C65 130 59 136 51 136C43 136 37 130 37 122C37 114 43 108 51 108"
        stroke={BRAND_BLUE}
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="118" cy="127" r="8" fill={BRAND_BLUE} />
    </svg>
  )
}

export function BrandLogo({
  className,
  compact = false,
  showTagline = true,
  light = false,
}: {
  className?: string
  compact?: boolean
  showTagline?: boolean
  light?: boolean
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <BrandMark className={compact ? "h-11 w-11" : "h-12 w-12"} />
      <div className="min-w-0">
        <p
          className={cn(
            "font-heading text-lg font-semibold uppercase tracking-[0.16em]",
            compact && "text-base",
            light ? "text-white" : "text-foreground",
          )}
        >
          Ochieng Store
        </p>
        {showTagline ? (
          <p className={cn("text-[10px] uppercase tracking-[0.32em] sm:text-xs", light ? "text-white/65" : "text-muted-foreground")}>
            Home Appliances & Supplies
          </p>
        ) : null}
      </div>
    </div>
  )
}
