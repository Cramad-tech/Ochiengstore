import { NextRequest, NextResponse } from "next/server"

import { auth } from "@/auth"
import { isAdminRole } from "@/lib/rbac"

export default auth((request: NextRequest & { auth?: { user?: { roles?: string[] } } | null }) => {
  const { pathname } = request.nextUrl
  const isProtectedAdminRoute = pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")

  if (!isProtectedAdminRoute) {
    return NextResponse.next()
  }

  const hasAdminRole = request.auth?.user?.roles?.some((role: string) => isAdminRole(role))

  if (!hasAdminRole) {
    return NextResponse.redirect(new URL("/login", request.nextUrl))
  }

  return NextResponse.next()
})

export const config = {
  matcher: ["/admin/:path*"],
}
