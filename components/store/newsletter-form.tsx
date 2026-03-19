"use client"

import type React from "react"

import { useState } from "react"
import { LoaderCircle, Mail } from "lucide-react"

import { useNotification } from "@/lib/notification-context"

export function NewsletterForm() {
  const { addNotification } = useNotification()
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        throw new Error("Could not save your subscription.")
      }

      addNotification("Subscription received. We will share product drops and trusted deals.", "success", 2800)
      setEmail("")
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Subscription failed.", "error", 2800)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 sm:flex-row">
      <div className="relative flex-1">
        <Mail className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          type="email"
          placeholder="Enter your email"
          className="w-full rounded-full border border-border bg-card px-11 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
      </div>
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        Subscribe
      </button>
    </form>
  )
}
