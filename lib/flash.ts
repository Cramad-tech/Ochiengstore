import { cookies } from "next/headers"

export const FLASH_COOKIE_NAME = "__ochieng_flash"

export type FlashMessage = {
  id: string
  type: "success" | "error" | "info"
  title?: string
  message: string
}

export async function setFlashMessage({
  type,
  message,
  title,
}: Omit<FlashMessage, "id">) {
  const cookieStore = await cookies()
  const payload: FlashMessage = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    type,
    title,
    message,
  }

  cookieStore.set(FLASH_COOKIE_NAME, JSON.stringify(payload), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 30,
  })
}

export function parseFlashMessage(rawValue?: string | null): FlashMessage | null {
  if (!rawValue) {
    return null
  }

  try {
    const parsed = JSON.parse(rawValue) as Partial<FlashMessage>
    if (!parsed.id || !parsed.message || !parsed.type) {
      return null
    }

    if (!["success", "error", "info"].includes(parsed.type)) {
      return null
    }

    return {
      id: parsed.id,
      type: parsed.type,
      title: parsed.title,
      message: parsed.message,
    }
  } catch {
    return null
  }
}
