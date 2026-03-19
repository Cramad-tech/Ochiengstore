export const ADMIN_ROLE_CODES = ["SUPER_ADMIN", "MANAGER", "EDITOR", "SUPPORT"] as const

export function resolveUserRoles(roles: string[]) {
  return [...new Set(roles)]
}

export function isAdminRole(role: string) {
  return ADMIN_ROLE_CODES.includes(role as (typeof ADMIN_ROLE_CODES)[number])
}
