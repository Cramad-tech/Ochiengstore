import { createCipheriv, createDecipheriv, createHash, randomBytes } from "node:crypto"

const ENCRYPTION_ALGORITHM = "aes-256-gcm"

function getEncryptionKey() {
  const seed =
    process.env.MESSAGE_ENCRYPTION_SECRET ??
    process.env.AUTH_SECRET ??
    process.env.NEXTAUTH_SECRET ??
    "ochieng-support-room-dev-secret"

  return createHash("sha256").update(seed).digest()
}

export function encryptSecureMessage(plainText: string) {
  const iv = randomBytes(12)
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), iv)

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()])
  const authTag = cipher.getAuthTag()

  return `${iv.toString("base64")}.${authTag.toString("base64")}.${encrypted.toString("base64")}`
}

export function decryptSecureMessage(value: string) {
  const [ivEncoded, tagEncoded, payloadEncoded] = value.split(".")
  if (!ivEncoded || !tagEncoded || !payloadEncoded) {
    return ""
  }

  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, getEncryptionKey(), Buffer.from(ivEncoded, "base64"))
  decipher.setAuthTag(Buffer.from(tagEncoded, "base64"))

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(payloadEncoded, "base64")),
    decipher.final(),
  ])

  return decrypted.toString("utf8")
}
