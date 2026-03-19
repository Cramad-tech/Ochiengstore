import { isAdminRole, resolveUserRoles } from "@/lib/rbac"

describe("auth helpers", () => {
  it("deduplicates resolved roles", () => {
    expect(resolveUserRoles(["SUPER_ADMIN", "EDITOR", "SUPER_ADMIN"])).toEqual(["SUPER_ADMIN", "EDITOR"])
  })

  it("recognizes supported admin roles", () => {
    expect(isAdminRole("SUPER_ADMIN")).toBe(true)
    expect(isAdminRole("SUPPORT")).toBe(true)
    expect(isAdminRole("CUSTOMER")).toBe(false)
  })
})
