import type { PermissionKey } from "./types";

export const RESOURCES = [
  "pages",
  "events",
  "media",
  "users",
  "roles",
] as const;

export const ACTIONS = ["create", "read", "update", "delete", "assign"] as const;

export function hasPermission(
  userPermissions: PermissionKey[],
  resource: string,
  action: string
): boolean {
  const key = `${resource}:${action}` as PermissionKey;
  return userPermissions.includes(key);
}

export function hasRole(userRoleNames: string[], roleName: string): boolean {
  return userRoleNames.includes(roleName);
}
