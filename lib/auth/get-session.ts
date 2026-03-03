import { cookies } from "next/headers";
import { getSessionUserId, getUserPermissions, getUserRoles } from "./session";
import { sql } from "@/lib/db";
import type { UserWithRoles } from "./types";

export async function getSession(): Promise<UserWithRoles | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) return null;

  const userId = await getSessionUserId(token);
  if (!userId) return null;

  const [row] = await sql`
    SELECT id, email, name, created_at, updated_at FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!row) return null;

  const [roles, permissions] = await Promise.all([
    getUserRoles(userId),
    getUserPermissions(userId),
  ]);

  const user: UserWithRoles = {
    id: row.id as string,
    email: row.email as string,
    name: row.name as string | null,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
    roles: roles as { id: string; name: string; description: string | null }[],
    permissions: permissions as `${string}:${string}`[],
  };
  return user;
}
