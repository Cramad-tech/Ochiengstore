import { decryptSecureMessage, encryptSecureMessage } from "@/lib/secure-messages"

describe("secure message helpers", () => {
  it("round-trips encrypted support messages", () => {
    const body = "Hello Albert, I need help with my fridge delivery schedule."
    const encrypted = encryptSecureMessage(body)

    expect(encrypted).not.toContain(body)
    expect(decryptSecureMessage(encrypted)).toBe(body)
  })

  it("returns an empty string for malformed payloads", () => {
    expect(decryptSecureMessage("invalid")).toBe("")
  })
})
