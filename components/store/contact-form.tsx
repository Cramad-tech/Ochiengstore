"use client"

import type React from "react"

import { useState } from "react"
import { LoaderCircle, Send } from "lucide-react"

import { useNotification } from "@/lib/notification-context"

export function ContactForm() {
  const { addNotification } = useNotification()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to send inquiry.")
      }

      addNotification("Your message has been sent. Our team will follow up shortly.", "success", 3000)
      setFormData({
        name: "",
        email: "",
        phone: "",
        subject: "",
        message: "",
      })
    } catch (error) {
      addNotification(error instanceof Error ? error.message : "Failed to send inquiry.", "error", 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="admin-surface grid gap-4 p-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={formData.name}
          onChange={(event) => setFormData((current) => ({ ...current, name: event.target.value }))}
          placeholder="Full name"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          value={formData.email}
          onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
          placeholder="Email address"
          type="email"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <input
          value={formData.phone}
          onChange={(event) => setFormData((current) => ({ ...current, phone: event.target.value }))}
          placeholder="Phone number"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
        />
        <input
          value={formData.subject}
          onChange={(event) => setFormData((current) => ({ ...current, subject: event.target.value }))}
          placeholder="Subject"
          className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
      </div>
      <textarea
        value={formData.message}
        onChange={(event) => setFormData((current) => ({ ...current, message: event.target.value }))}
        placeholder="Tell us what appliance you need, your delivery region, or any product question."
        rows={6}
        className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
      >
        {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <Send className="size-4" />}
        Send message
      </button>
    </form>
  )
}
