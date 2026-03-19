"use client"

import type React from "react"

import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle, RefreshCw } from "lucide-react"
import { useState } from "react"

import { useNotification } from "@/lib/notification-context"

type ResetStep = "request" | "reset"

export function ForgotPasswordForm() {
  const router = useRouter()
  const { addNotification } = useNotification()
  const [step, setStep] = useState<ResetStep>("request")
  const [email, setEmail] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [previewCode, setPreviewCode] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleRequest = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/password/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })
      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error ?? "Could not request a reset code.")
      }

      setPreviewCode(typeof data.previewCode === "string" ? data.previewCode : "")
      setStep("reset")
      addNotification(
        "If your reset email does not arrive quickly, retry later or contact management for account help.",
        "info",
        4200,
        "Reset code prepared",
      )
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not request a reset code.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReset = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (password !== confirmPassword) {
      setError("New passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          code,
          password,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Could not reset the password.")
      }

      addNotification("Your password has been changed successfully. Please sign in with the new one.", "success", 3200, "Password updated")
      router.push("/login" as Route)
      router.refresh()
    } catch (resetError) {
      setError(resetError instanceof Error ? resetError.message : "Could not reset the password.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-card mx-auto w-full max-w-xl p-8">
      <div className="space-y-3 text-center">
        <span className="eyebrow">Password recovery</span>
        <h1 className="font-heading text-3xl font-semibold">
          {step === "request" ? "Reset your password with email verification" : "Enter your reset code"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "request"
            ? "Enter your account email and we will send a verification code before you choose a new password."
            : `Enter the 6-digit code sent to ${email}.`}
        </p>
      </div>

      {step === "request" ? (
        <form onSubmit={handleRequest} className="mt-8 space-y-4">
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="Email address"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Send reset code
          </button>
        </form>
      ) : (
        <form onSubmit={handleReset} className="mt-8 space-y-4">
          <input
            value={code}
            onChange={(event) => setCode(event.target.value)}
            placeholder="Enter 6-digit code"
            maxLength={6}
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm tracking-[0.3em] focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="New password"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm new password"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          {previewCode ? (
            <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Development preview code: <span className="font-semibold">{previewCode}</span>
            </div>
          ) : null}
          {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Save new password
          </button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Remembered your password?{" "}
        <Link href={"/login" as Route} className="font-semibold text-primary">
          Return to login
        </Link>
      </p>
    </div>
  )
}
