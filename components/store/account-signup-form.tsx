"use client"

import type React from "react"

import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { CheckCircle2, LoaderCircle, UserPlus } from "lucide-react"
import { useState } from "react"

import { useNotification } from "@/lib/notification-context"

type SignupState = {
  firstName: string
  lastName: string
  email: string
  phone: string
  region: string
  city: string
  district: string
  addressLine: string
  password: string
  confirmPassword: string
  acceptPolicies: boolean
}

export function AccountSignupForm({ regions }: { regions: string[] }) {
  const router = useRouter()
  const { addNotification } = useNotification()
  const [formData, setFormData] = useState<SignupState>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    region: regions[0] ?? "Dar es Salaam",
    city: "",
    district: "",
    addressLine: "",
    password: "",
    confirmPassword: "",
    acceptPolicies: false,
  })
  const [verificationCode, setVerificationCode] = useState("")
  const [verificationEmail, setVerificationEmail] = useState("")
  const [previewCode, setPreviewCode] = useState("")
  const [manualApprovalRequired, setManualApprovalRequired] = useState(false)
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [step, setStep] = useState<"details" | "verify" | "pendingApproval">("details")

  const handleRequestCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          region: formData.region,
          city: formData.city,
          district: formData.district,
          addressLine: formData.addressLine,
          password: formData.password,
          acceptPolicies: formData.acceptPolicies,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Could not create the account.")
      }

      setVerificationEmail(formData.email)
      setPreviewCode(typeof data.previewCode === "string" ? data.previewCode : "")
      setManualApprovalRequired(Boolean(data.manualApprovalRequired))
      setStep(data.manualApprovalRequired ? "pendingApproval" : "verify")
      addNotification(
        data.manualApprovalRequired
          ? "If Google does not send the verification email, wait for Albert Ochieng to verify your account."
          : "We prepared your verification code. If it does not arrive by email, Albert Ochieng can still approve your signup.",
        "info",
        4200,
        data.manualApprovalRequired ? "Manual approval pending" : "Verification started",
      )
    } catch (signupError) {
      setError(signupError instanceof Error ? signupError.message : "Could not create the account.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleVerifyCode = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    try {
      const response = await fetch("/api/auth/signup/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: verificationEmail,
          code: verificationCode,
        }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error ?? "Could not verify your email.")
      }

      addNotification("Your email is verified. You can now sign in to your account.", "success", 3200, "Account ready")
      router.push("/login" as Route)
      router.refresh()
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Could not verify your email.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="glass-card mx-auto w-full max-w-3xl p-8">
      <div className="space-y-3 text-center">
        <span className="eyebrow">Create account</span>
        <h1 className="font-heading text-3xl font-semibold">
          {step === "details"
            ? "Create your customer account"
            : step === "verify"
              ? "Verify your email"
              : "Await manual verification"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {step === "details"
            ? "Save delivery details once, then confirm your email with a verification code before you sign in."
            : step === "verify"
              ? `Enter the 6-digit code sent to ${verificationEmail}.`
              : `If Google will not send verification to ${verificationEmail}, wait for Albert Ochieng to verify you.`}
        </p>
      </div>

      {step === "details" ? (
        <form onSubmit={handleRequestCode} className="mt-8 grid gap-4 sm:grid-cols-2">
          <input
            value={formData.firstName}
            onChange={(event) => setFormData((current) => ({ ...current, firstName: event.target.value }))}
            placeholder="First name"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            value={formData.lastName}
            onChange={(event) => setFormData((current) => ({ ...current, lastName: event.target.value }))}
            placeholder="Last name"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            type="email"
            value={formData.email}
            onChange={(event) => setFormData((current) => ({ ...current, email: event.target.value }))}
            placeholder="Email address"
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
          <input
            type="password"
            value={formData.password}
            onChange={(event) => setFormData((current) => ({ ...current, password: event.target.value }))}
            placeholder="Password"
            className="rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            value={formData.addressLine}
            onChange={(event) => setFormData((current) => ({ ...current, addressLine: event.target.value }))}
            placeholder="Street, estate, or landmark"
            className="sm:col-span-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <input
            type="password"
            value={formData.confirmPassword}
            onChange={(event) => setFormData((current) => ({ ...current, confirmPassword: event.target.value }))}
            placeholder="Confirm password"
            className="sm:col-span-2 rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
            required
          />
          <label className="sm:col-span-2 rounded-[1.35rem] border border-border bg-card px-4 py-4 text-sm text-muted-foreground">
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

          {error ? <p className="sm:col-span-2 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

          <button
            type="submit"
            disabled={isSubmitting}
            className="sm:col-span-2 inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
            Send verification code
          </button>
        </form>
      ) : step === "verify" ? (
        <form onSubmit={handleVerifyCode} className="mt-8 space-y-4">
          <input
            value={verificationCode}
            onChange={(event) => setVerificationCode(event.target.value)}
            placeholder="Enter 6-digit code"
            className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm tracking-[0.3em] focus:border-primary focus:outline-none"
            maxLength={6}
            required
          />
          {previewCode ? (
            <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Development preview code: <span className="font-semibold">{previewCode}</span>
            </div>
          ) : null}
          {!previewCode ? (
            <div className="rounded-2xl border border-primary/15 bg-primary/5 px-4 py-3 text-sm text-muted-foreground">
              If Google will not send the verification email, wait for Albert Ochieng to verify you.
            </div>
          ) : null}
          {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}
          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
          >
            {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <CheckCircle2 className="size-4" />}
            Verify email and continue
          </button>
          <button
            type="button"
            onClick={() => {
              setManualApprovalRequired(false)
              setStep("details")
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
          >
            Edit signup details
          </button>
        </form>
      ) : (
        <div className="mt-8 space-y-4">
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/6 px-5 py-5 text-sm text-muted-foreground">
            <p className="font-semibold text-foreground">Verification is waiting for manual approval.</p>
            <p className="mt-2">
              If Google will not send verification to <span className="font-semibold text-foreground">{verificationEmail}</span>, wait for Albert Ochieng to verify you. Once approved, you can sign in normally from the login page.
            </p>
          </div>
          {manualApprovalRequired ? null : previewCode ? (
            <div className="rounded-2xl border border-accent/25 bg-accent/10 px-4 py-3 text-sm text-foreground">
              Development preview code: <span className="font-semibold">{previewCode}</span>
            </div>
          ) : null}
          <Link
            href={"/login" as Route}
            className="inline-flex w-full items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
          >
            Go to login
          </Link>
          <button
            type="button"
            onClick={() => {
              setManualApprovalRequired(false)
              setStep("details")
            }}
            className="inline-flex w-full items-center justify-center rounded-full border border-border px-5 py-3 text-sm font-semibold text-foreground"
          >
            Edit signup details
          </button>
        </div>
      )}

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Already have an account?{" "}
        <Link href={"/login" as Route} className="font-semibold text-primary">
          Sign in
        </Link>
      </p>
    </div>
  )
}
