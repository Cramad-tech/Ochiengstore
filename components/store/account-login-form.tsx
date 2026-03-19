"use client"

import type React from "react"

import type { Route } from "next"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { LoaderCircle, LogIn } from "lucide-react"
import { signIn } from "next-auth/react"
import { useState } from "react"

import { useNotification } from "@/lib/notification-context"
import { isAdminRole } from "@/lib/rbac"

export function AccountLoginForm() {
  const router = useRouter()
  const { addNotification } = useNotification()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setIsSubmitting(true)

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    })

    if (result?.error) {
      setError("Invalid email or password.")
      addNotification("The email, password, or verification state is invalid for this account.", "error", 3200, "Sign-in blocked")
      setIsSubmitting(false)
      return
    }

    const sessionResponse = await fetch("/api/auth/session", {
      cache: "no-store",
    })
    const session = (await sessionResponse.json()) as { user?: { roles?: string[] } }
    const hasAdminRole = session.user?.roles?.some((role) => isAdminRole(role)) ?? false

    addNotification(
      hasAdminRole ? "Welcome back. Opening the admin workspace." : "Welcome back. Opening your customer account.",
      "success",
      2600,
      "Sign-in successful",
    )
    router.push((hasAdminRole ? "/admin/dashboard" : "/account") as Route)
    router.refresh()
  }

  return (
    <div className="glass-card mx-auto w-full max-w-xl p-8">
      <div className="space-y-3 text-center">
        <span className="eyebrow">Account login</span>
        <h1 className="font-heading text-3xl font-semibold">Sign in to Ochieng Store</h1>
        <p className="text-sm text-muted-foreground">
          Customers and admins use the same secure login. Your email and role decide the dashboard you enter.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email address"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Password"
          className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm focus:border-primary focus:outline-none"
          required
        />

        {error ? <p className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">{error}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 disabled:opacity-50"
        >
          {isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : <LogIn className="size-4" />}
          Sign in
        </button>
      </form>

      <div className="mt-6 space-y-3 text-center text-sm">
        <p className="text-muted-foreground">
          New here?{" "}
          <Link href={"/signup" as Route} className="font-semibold text-primary">
            Create an account
          </Link>
        </p>
        <p className="text-muted-foreground">
          Forgot your password?{" "}
          <Link href={"/forgot-password" as Route} className="font-semibold text-primary">
            Reset it with a code
          </Link>
        </p>
      </div>
    </div>
  )
}
