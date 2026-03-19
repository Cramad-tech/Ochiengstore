import { buildWhatsAppLink, formatTzs, slugify } from "@/lib/format"

describe("format helpers", () => {
  it("formats TZS without decimals", () => {
    expect(formatTzs(1250000)).toContain("TZS")
    expect(formatTzs(1250000)).not.toContain(".00")
  })

  it("creates slugs from mixed input", () => {
    expect(slugify("LG 420L Double Door Refrigerator")).toBe("lg-420l-double-door-refrigerator")
  })

  it("builds a whatsapp url", () => {
    expect(buildWhatsAppLink("+255 700 123 456", "hello")).toContain("wa.me/255700123456")
  })
})
