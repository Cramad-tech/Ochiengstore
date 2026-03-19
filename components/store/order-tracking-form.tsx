"use client"

import type React from "react"

import { useState } from "react"
import { LoaderCircle, Search } from "lucide-react"

import { formatTzs } from "@/lib/format"
import { useNotification } from "@/lib/notification-context"

type TrackingResponse = {
  orderNumber: string
  status: string
  paymentStatus: string
  total: number
  items: Array<{ name: string; quantity: number }>
}

export function OrderTrackingForm() {
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState({ orderNumber: "", phone: "" })
  const [result, setResult] = useState<TrackingResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsLoading(true)
    setResult(null)

    try {
      const response = await fetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not find order.")
      }

      setResult(data)
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Could not find order.", "error", 2800)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid gap-6">
      <form onSubmit={handleSubmit} className="admin-surface grid gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <input
            value={formData.orderNumber}
            onChange={(event) => setFormData((current) => ({ ...current, orderNumber: event.target.value }))}
            placeholder="Order number"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            value={formData.phone}
            onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
            placeholder="Phone used at checkout"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
        </div>
        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isLoading ? <LoaderCircle className="size-4 animate-spin" /> : <Search className="size-4" />}
          Track order
        </button>
      </form>

      {result ? (
        <div className="glass-card p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.26em] text-muted-foreground">Order</p>
              <h3 className="font-heading text-2xl font-semibold">{result.orderNumber}</h3>
            </div>
            <div className="flex gap-2">
              <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">{result.status}</span>
              <span className="rounded-full bg-secondary px-3 py-1 text-xs font-semibold text-secondary-foreground">
                {result.paymentStatus}
              </span>
            </div>
          </div>
          <div className="mt-5 space-y-3 text-sm text-muted-foreground">
            {result.items.map((item) => (
              <div key={item.name} className="flex items-center justify-between border-b border-border pb-3 last:border-b-0 last:pb-0">
                <span>{item.name}</span>
                <span>Qty {item.quantity}</span>
              </div>
            ))}
          </div>
          <p className="mt-5 text-sm font-semibold text-foreground">Total: {formatTzs(result.total)}</p>
        </div>
      ) : null}
    </div>
  )
}
