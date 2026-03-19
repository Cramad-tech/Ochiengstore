type Entry = {
  count: number
  expiresAt: number
}

const globalStore = globalThis as typeof globalThis & {
  __ochiengRateLimit?: Map<string, Entry>
}

function getStore() {
  if (!globalStore.__ochiengRateLimit) {
    globalStore.__ochiengRateLimit = new Map<string, Entry>()
  }

  return globalStore.__ochiengRateLimit
}

export function assertRateLimit(key: string, limit: number, windowMs: number) {
  const store = getStore()
  const now = Date.now()
  const entry = store.get(key)

  if (!entry || entry.expiresAt < now) {
    store.set(key, { count: 1, expiresAt: now + windowMs })
    return
  }

  if (entry.count >= limit) {
    throw new Error("Too many requests. Please try again shortly.")
  }

  entry.count += 1
  store.set(key, entry)
}

export function getRequestKey(request: Request, scope: string) {
  const forwarded = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "local"
  return `${scope}:${forwarded}`
}
