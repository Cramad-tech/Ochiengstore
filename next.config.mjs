import os from "node:os"
import path from "node:path"

const normalizeDevOrigin = (value) => {
  if (!value) {
    return []
  }

  const normalized = value.trim()
  if (!normalized) {
    return []
  }

  try {
    const url = new URL(normalized.includes("://") ? normalized : `http://${normalized}`)
    return [url.hostname, url.origin]
  } catch {
    return [normalized]
  }
}

const localNetworkOrigins = Object.values(os.networkInterfaces())
  .flatMap((entries) => entries ?? [])
  .filter((entry) => entry.family === "IPv4" && !entry.internal)
  .flatMap((entry) => normalizeDevOrigin(entry.address))

const configuredDevOrigins = [
  process.env.NEXT_PUBLIC_SITE_URL,
  process.env.NEXTAUTH_URL,
  ...(process.env.ALLOWED_DEV_ORIGINS ?? "").split(","),
].flatMap((value) => normalizeDevOrigin(value))

const allowedDevOrigins = Array.from(
  new Set(["localhost", "127.0.0.1", "http://localhost:3000", "http://127.0.0.1:3000", ...localNetworkOrigins, ...configuredDevOrigins]),
)

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins,
  typedRoutes: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), payment=()",
          },
        ],
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [
      { protocol: "https", hostname: "**" },
      { protocol: "http", hostname: "**" },
    ],
  },
  turbopack: {
    root: path.resolve("."),
  },
}

export default nextConfig
