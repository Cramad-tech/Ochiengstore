import { validateManagedImageUrl } from "@/lib/media"

describe("media validation", () => {
  it("accepts local public paths", () => {
    expect(validateManagedImageUrl("/catalog/refrigerator.svg")).toBe("/catalog/refrigerator.svg")
  })

  it("accepts secure remote image urls", () => {
    expect(validateManagedImageUrl("https://example.com/image.jpg")).toBe("https://example.com/image.jpg")
  })

  it("rejects unsupported protocols", () => {
    expect(() => validateManagedImageUrl("javascript:alert(1)")).toThrow()
  })
})
