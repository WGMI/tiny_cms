import { getSession } from "./get-session";
import { hasPermission } from "./permissions";
import type { PermissionKey } from "./types";

export interface AuthOptions {
  /** Require at least one of these permissions. If empty, only requires logged-in. */
  permission?: { resource: string; action: string };
  /** Require one of these role names. */
  role?: string;
}

/**
 * Use in Server Actions or Route Handlers to require auth and optionally a permission/role.
 * Returns the session user or throws/returns error response.
 */
export async function requireAuth(options?: AuthOptions) {
  const session = await getSession();
  if (!session) {
    return { error: "Unauthorized", status: 401 as const };
  }
  if (options?.permission) {
    const ok = hasPermission(
      session.permissions,
      options.permission.resource,
      options.permission.action
    );
    if (!ok) {
      return { error: "Forbidden", status: 403 as const };
    }
  }
  if (options?.role) {
    const roleNames = session.roles.map((r) => r.name);
    if (!roleNames.includes(options.role)) {
      return { error: "Forbidden", status: 403 as const };
    }
  }
  return { user: session };
}
