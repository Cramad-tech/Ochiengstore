import type { Route } from "next"
import { redirect } from "next/navigation"

import { auth } from "@/auth"
import { isAdminRole } from "@/lib/rbac"

export async function requireUserSession() {
  const session = await auth()

  if (!session) {
    redirect("/login" as Route)
  }

  return session
}

export async function requireAdminSession() {
  const session = await auth()
  const hasAdminRole = session?.user?.roles?.some((role: string) => isAdminRole(role))

  if (!session || !hasAdminRole) {
    redirect("/login" as Route)
  }

  return session
}

export async function requireSuperAdminSession() {
  const session = await auth()
  const hasSuperAdminRole = session?.user?.roles?.includes("SUPER_ADMIN")

  if (!session || !hasSuperAdminRole) {
    redirect("/login" as Route)
  }

  return session
}
