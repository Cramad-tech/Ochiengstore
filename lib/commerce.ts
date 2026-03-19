import type { z } from "zod"

import { formatTzs } from "@/lib/format"
import { checkoutSchema } from "@/lib/validation"

export type CheckoutInput = z.infer<typeof checkoutSchema>

export function getDeliveryFee(region: string) {
  const normalizedRegion = region.toLowerCase()
  if (normalizedRegion.includes("dar")) return 15000
  if (normalizedRegion.includes("zanzibar")) return 35000
  return 25000
}

export function calculateCheckoutTotals(input: CheckoutInput) {
  const subtotal = input.items.reduce((sum, item) => sum + (item.discountPrice ?? item.price) * item.quantity, 0)
  const deliveryFee = getDeliveryFee(input.region)
  const taxTotal = 0
  const grandTotal = subtotal + deliveryFee + taxTotal

  return {
    subtotal,
    deliveryFee,
    taxTotal,
    grandTotal,
  }
}

export function generateOrderNumber() {
  const timestamp = Date.now().toString().slice(-8)
  const randomSuffix = Math.floor(Math.random() * 900 + 100)
  return `OHA-${timestamp}-${randomSuffix}`
}

export function buildPaymentInstructions(method: CheckoutInput["paymentMethod"], grandTotal: number) {
  const selcomNumber = process.env.SELCOM_ACCOUNT_NUMBER ?? "5525103937323"
  const equityNumber = process.env.EQUITY_ACCOUNT_NUMBER ?? "3007111936105"
  const yasLipaNumber = process.env.YAS_LIPA_ACCOUNT_NUMBER ?? "8431835"
  const bankAccountName = process.env.BANK_ACCOUNT_NAME ?? "Ochieng Store"

  switch (method) {
    case "BANK_TRANSFER":
      return `Transfer ${formatTzs(grandTotal)} using Equity ${equityNumber} (${bankAccountName}) and share the payment reference on WhatsApp for confirmation.`
    case "MOBILE_MONEY_MANUAL":
      return `Send ${formatTzs(grandTotal)} using mobile money through SELCOM ${selcomNumber} or Yas Lipa ${yasLipaNumber}, then share the transaction reference on WhatsApp for manual confirmation.`
    case "WHATSAPP_CONFIRMATION":
      return "Submit the order now and our team will confirm payment instructions with you on WhatsApp."
    default:
      return "Cash on delivery is available for eligible regions and products after order confirmation."
  }
}
