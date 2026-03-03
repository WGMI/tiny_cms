import { sql } from "@/lib/db";
import type { PermissionKey } from "./types";
import { randomBytes } from "crypto";

const SESSION_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function createSession(userId: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + SESSION_DURATION_MS);
  await sql`
    INSERT INTO sessions (user_id, token, expires_at)
    VALUES (${userId}, ${token}, ${expiresAt.toISOString()})
  `;
  return token;
}

export async function getSessionUserId(
  token: string
): Promise<string | null> {
  const rows = await sql`
    SELECT user_id FROM sessions
    WHERE token = ${token} AND expires_at > now()
    LIMIT 1
  `;
  return rows[0]?.user_id ?? null;
}

export async function deleteSession(token: string): Promise<void> {
  await sql`DELETE FROM sessions WHERE token = ${token}`;
}

export async function deleteExpiredSessions(): Promise<void> {
  await sql`DELETE FROM sessions WHERE expires_at <= now()`;
}

export async function getUserPermissions(userId: string): Promise<PermissionKey[]> {
  const rows = await sql`
    SELECT p.resource, p.action
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    JOIN user_roles ur ON ur.role_id = rp.role_id
    WHERE ur.user_id = ${userId}
  `;
  return (rows as { resource: string; action: string }[]).map(
    (r) => `${r.resource}:${r.action}` as PermissionKey
  );
}

export async function getUserRoles(userId: string) {
  const rows = await sql`
    SELECT r.id, r.name, r.description
    FROM roles r
    JOIN user_roles ur ON ur.role_id = r.id
    WHERE ur.user_id = ${userId}
  `;
  return rows;
}
