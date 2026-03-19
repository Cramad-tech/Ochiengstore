"use client"

import type React from "react"

import type { Route } from "next"
import Link from "next/link"
import { useMemo, useState } from "react"
import { LoaderCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { formatTzs } from "@/lib/format"
import { useCart } from "@/lib/cart-context"
import { useNotification } from "@/lib/notification-context"

const PAYMENT_METHODS = [
  { value: "WHATSAPP_CONFIRMATION", label: "WhatsApp Order Confirmation" },
  { value: "CASH_ON_DELIVERY", label: "Cash on Delivery" },
  { value: "BANK_TRANSFER", label: "Bank Transfer" },
  { value: "MOBILE_MONEY_MANUAL", label: "Mobile Money Confirmation" },
] as const

type PaymentMethod = (typeof PAYMENT_METHODS)[number]["value"]

type CheckoutFormState = {
  customerName: string
  email: string
  phone: string
  region: string
  city: string
  district: string
  addressLine: string
  notes: string
  paymentMethod: PaymentMethod
  acceptPolicies: boolean
}

type CheckoutInitialValues = Partial<Omit<CheckoutFormState, "paymentMethod">>

export function CheckoutForm({
  regions,
  paymentAccounts,
  initialValues,
}: {
  regions: string[]
  paymentAccounts: {
    selcom: string
    equity: string
    yasLipa: string
  }
  initialValues?: CheckoutInitialValues
}) {
  const router = useRouter()
  const { state, subtotal, clearCart } = useCart()
  const { addNotification } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState<CheckoutFormState>({
    customerName: initialValues?.customerName ?? "",
    email: initialValues?.email ?? "",
    phone: initialValues?.phone ?? "",
    region: initialValues?.region ?? regions[0] ?? "Dar es Salaam",
    city: initialValues?.city ?? "",
    district: initialValues?.district ?? "",
    addressLine: initialValues?.addressLine ?? "",
    notes: initialValues?.notes ?? "",
    paymentMethod: PAYMENT_METHODS[0].value,
    acceptPolicies: false,
  })

  const deliveryFee = useMemo(() => (formData.region.toLowerCase().includes("dar") ? 15000 : 25000), [formData.region])
  const total = subtotal + deliveryFee
  const showTransferDetails = formData.paymentMethod === "BANK_TRANSFER" || formData.paymentMethod === "MOBILE_MONEY_MANUAL"

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()

    if (state.items.length === 0) {
      addNotification("Your cart is empty.", "error", 2500)
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          items: state.items.map((item) => ({
            slug: item.product.slug,
            name: item.product.name,
            price: item.product.price,
            discountPrice: item.product.discountPrice,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Checkout failed.")
      }

      clearCart()
      const nextUrl = new URLSearchParams({
        order: data.orderNumber,
      })

      if (typeof data.paymentInstructions === "string" && data.paymentInstructions.length > 0) {
        nextUrl.set("payment", data.paymentInstructions)
      }

      router.push(`/checkout/success?${nextUrl.toString()}`)
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Checkout failed.", "error", 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="admin-surface grid gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={formData.customerName}
            onChange={(event) => setFormData((current) => ({ ...current, customerName: event.target.value }))}
            placeholder="Full name"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone number"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
          <select
            value={formData.region}
            onChange={(event) => setFormData((current) => ({ ...current, region: event.target.value }))}
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          >
            {regions.map((region) => (
              <option key={region} value={region}>
                {region}
              </option>
            ))}
          </select>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={formData.city}
            onChange={(event) => setFormData((current) => ({ ...current, city: event.target.value }))}
            placeholder="City / town"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            value={formData.district}
            onChange={(event) => setFormData((current) => ({ ...current, district: event.target.value }))}
            placeholder="District"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          />
        </div>
        <input
          value={formData.addressLine}
          onChange={(event) => setFormData((current) => ({ ...current, addressLine: event.target.value }))}
          placeholder="Street, estate, landmark or delivery address"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
        <select
          value={formData.paymentMethod}
          onChange={(event) => setFormData((current) => ({ ...current, paymentMethod: event.target.value as PaymentMethod }))}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
        >
          {PAYMENT_METHODS.map((method) => (
            <option key={method.value} value={method.value}>
              {method.label}
            </option>
          ))}
        </select>
        <p className="text-sm text-muted-foreground">
          Recommended: WhatsApp confirmation keeps stock, delivery timing, and payment follow-up in one direct conversation.
        </p>
        {showTransferDetails ? (
          <div className="rounded-[1.5rem] border border-accent/30 bg-accent/10 p-4 text-sm text-foreground">
            <p className="font-semibold text-foreground">Payment accounts</p>
            <div className="mt-3 grid gap-2">
              <p>
                <span className="font-semibold">SELCOM:</span> {paymentAccounts.selcom}
              </p>
              <p>
                <span className="font-semibold">EQUITY:</span> {paymentAccounts.equity}
              </p>
              <p>
                <span className="font-semibold">Yas LIPA:</span> {paymentAccounts.yasLipa}
              </p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">After payment, share the transaction reference on WhatsApp so the order can be confirmed quickly.</p>
          </div>
        ) : null}
        <textarea
          value={formData.notes}
          onChange={(event) => setFormData((current) => ({ ...current, notes: event.target.value }))}
          placeholder="Optional notes about delivery access, building floor, or installation."
          rows={4}
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <label className="rounded-[1.35rem] border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
          <span className="flex items-start gap-3">
            <input
              type="checkbox"
              checked={formData.acceptPolicies}
              onChange={(event) => setFormData((current) => ({ ...current, acceptPolicies: event.target.checked }))}
              className="mt-0.5 size-4 accent-[var(--primary)]"
              required
            />
            <span>
              I have read and agree to the{" "}
              <Link href={"/privacy-policy" as Route} className="font-semibold text-primary">
                Privacy Policy
              </Link>
              ,{" "}
              <Link href={"/terms-and-conditions" as Route} className="font-semibold text-primary">
                Terms & Conditions
              </Link>
              ,{" "}
              <Link href={"/cookies-policy" as Route} className="font-semibold text-primary">
                Cookies Policy
              </Link>
              , and{" "}
              <Link href={"/session-policy" as Route} className="font-semibold text-primary">
                Session Policy
              </Link>
              .
            </span>
          </span>
        </label>
      </div>

      <div className="admin-surface h-fit space-y-4 p-6">
        <h3 className="font-heading text-xl font-semibold">Order summary</h3>
        <div className="space-y-3">
          {state.items.map((item) => (
            <div key={item.product.slug} className="flex items-start justify-between gap-4 text-sm">
              <div>
                <p className="font-medium">{item.product.name}</p>
                <p className="text-muted-foreground">Qty {item.quantity}</p>
              </div>
              <p className="font-semibold">{formatTzs((item.product.discountPrice ?? item.product.price) * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="space-y-2 border-t border-border pt-4 text-sm">
          <div className="flex justify-between">
            <span>Subtotal</span>
            <span>{formatTzs(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span>Delivery</span>
            <span>{formatTzs(deliveryFee)}</span>
          </div>
          <div className="flex justify-between text-base font-semibold">
            <span>Total</span>
            <span>{formatTzs(total)}</span>
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting || state.items.length === 0}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
          Submit order request
        </button>
      </div>
    </form>
  )
}
