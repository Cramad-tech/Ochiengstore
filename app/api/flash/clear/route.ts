import { NextResponse } from "next/server"

import { FLASH_COOKIE_NAME } from "@/lib/flash"

export async function POST() {
  const response = NextResponse.json({ ok: true })
  response.cookies.set(FLASH_COOKIE_NAME, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0,
  })
  return response
}
