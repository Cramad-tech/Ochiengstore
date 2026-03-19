import { randomUUID } from "node:crypto"
import { mkdir, writeFile } from "node:fs/promises"
import path from "node:path"

import { NextResponse } from "next/server"

import { auth } from "@/auth"
import { isAdminRole } from "@/lib/rbac"
import { assertRateLimit, getRequestKey } from "@/lib/rate-limit"

const MAX_FILE_SIZE = 5 * 1024 * 1024
const ALLOWED_TYPES = new Map([
  ["image/jpeg", "jpg"],
  ["image/png", "png"],
  ["image/webp", "webp"],
])

export async function POST(request: Request) {
  try {
    assertRateLimit(getRequestKey(request, "admin-upload"), 12, 60_000)
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Too many upload attempts." }, { status: 429 })
  }

  const session = await auth()
  const hasAdminRole = session?.user?.roles?.some((role) => isAdminRole(role))

  if (!session?.user?.id || !hasAdminRole) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 })
  }

  const formData = await request.formData()
  const file = formData.get("file")

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
  }

  if (!ALLOWED_TYPES.has(file.type)) {
    return NextResponse.json({ error: "Only JPG, PNG, and WEBP files are allowed." }, { status: 400 })
  }

  if (file.size > MAX_FILE_SIZE) {
    return NextResponse.json({ error: "Image file is too large. Maximum size is 5 MB." }, { status: 400 })
  }

  const extension = ALLOWED_TYPES.get(file.type)
  const fileName = `${Date.now()}-${randomUUID()}.${extension}`
  const uploadDir = path.join(process.cwd(), "public", "uploads", "products")
  const destination = path.join(uploadDir, fileName)

  await mkdir(uploadDir, { recursive: true })
  const bytes = Buffer.from(await file.arrayBuffer())
  await writeFile(destination, bytes)

  return NextResponse.json({
    ok: true,
    url: `/uploads/products/${fileName}`,
  })
}
