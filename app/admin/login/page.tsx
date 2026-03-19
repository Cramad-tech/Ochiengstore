import type { Route } from "next"
import { redirect } from "next/navigation"

export default function LegacyAdminLoginRedirectPage() {
  redirect("/login" as Route)
}
