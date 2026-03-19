export function validateManagedImageUrl(value: string) {
  const normalized = normalizeManagedAssetUrl(value, "Image URL")
  return normalized
}

export function validateManagedVideoUrl(value: string) {
  const normalized = normalizeManagedAssetUrl(value, "Video URL")
  const lowerValue = normalized.toLowerCase()
  const isYouTube = lowerValue.includes("youtube.com/") || lowerValue.includes("youtu.be/")
  const isVimeo = lowerValue.includes("vimeo.com/")
  const isDirectVideo = /\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(lowerValue)

  if (!isYouTube && !isVimeo && !isDirectVideo && !normalized.startsWith("/")) {
    throw new Error("Video URL must be a YouTube, Vimeo, direct video file, or local /public path.")
  }

  return normalized
}

export function resolveProductVideoSource(value?: string | null) {
  if (!value) {
    return null
  }

  let normalized: string
  try {
    normalized = validateManagedVideoUrl(value)
  } catch {
    return null
  }
  const youtubeMatch = normalized.match(/(?:youtube\.com\/watch\?v=|youtube\.com\/embed\/|youtu\.be\/)([^?&/]+)/i)
  if (youtubeMatch?.[1]) {
    return {
      kind: "embed" as const,
      src: `https://www.youtube.com/embed/${youtubeMatch[1]}`,
    }
  }

  const vimeoMatch = normalized.match(/vimeo\.com\/(?:video\/)?(\d+)/i)
  if (vimeoMatch?.[1]) {
    return {
      kind: "embed" as const,
      src: `https://player.vimeo.com/video/${vimeoMatch[1]}`,
    }
  }

  return {
    kind: "file" as const,
    src: normalized,
  }
}

function normalizeManagedAssetUrl(value: string, label: string) {
  const normalized = value.trim()

  if (!normalized) {
    throw new Error(`${label} cannot be empty.`)
  }

  if (normalized.startsWith("/")) {
    return normalized
  }

  let parsed: URL
  try {
    parsed = new URL(normalized)
  } catch {
    throw new Error(`${label} must be an absolute URL or a local /public path.`)
  }

  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`Only http and https ${label.toLowerCase()}s are allowed.`)
  }

  return parsed.toString()
}
