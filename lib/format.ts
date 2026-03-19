export const CURRENCY_CODE = "TZS"
export const COUNTRY_NAME = "Tanzania"

export function formatTzs(value: number) {
  return `${CURRENCY_CODE} ${new Intl.NumberFormat("en-TZ", {
    maximumFractionDigits: 0,
  }).format(value)}`
}

export function formatCompactNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value)
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export function parseCurrencyInput(value: string | FormDataEntryValue | null | undefined) {
  if (typeof value !== "string") {
    return 0
  }

  const parsed = Number(value.replace(/,/g, ""))
  return Number.isFinite(parsed) ? parsed : 0
}

export function buildWhatsAppLink(phone: string, message: string) {
  const numericPhone = phone.replace(/\D/g, "")
  return `https://wa.me/${numericPhone}?text=${encodeURIComponent(message)}`
}

export function toSentenceCase(value: string) {
  return value
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ")
}
