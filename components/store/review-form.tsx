"use client"

import type React from "react"

import { useState } from "react"
import { LoaderCircle, Star } from "lucide-react"

import { useNotification } from "@/lib/notification-context"

export function ReviewForm({ productSlug }: { productSlug: string }) {
  const { addNotification } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    rating: 5,
    body: "",
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          productSlug,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Could not submit review.")
      }

      addNotification("Review received. It will appear after moderation.", "success", 2500)
      setFormData({ name: "", title: "", rating: 5, body: "" })
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Review submission failed.", "error", 2500)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          placeholder="Your name"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          value={formData.title}
          onChange={(event) => setFormData((current) => ({ ...current, title: event.target.value }))}
          placeholder="Review title"
          className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
      </div>
      <label className="text-sm font-medium text-foreground">
        Rating
        <div className="mt-2 flex gap-2">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              type="button"
              onClick={() => setFormData((current) => ({ ...current, rating }))}
              className="rounded-full border border-border p-2"
            >
              <Star className={`size-4 ${formData.rating >= rating ? "fill-accent text-accent" : "text-muted-foreground"}`} />
            </button>
          ))}
        </div>
      </label>
      <textarea
        value={formData.body}
        onChange={(event) => setFormData((current) => ({ ...current, body: event.target.value }))}
        rows={4}
        placeholder="Share what stood out about this appliance, delivery, or product fit."
        className="rounded-2xl border border-border px-4 py-3 text-sm focus:border-primary focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
        Submit review
      </button>
    </form>
  )
}
