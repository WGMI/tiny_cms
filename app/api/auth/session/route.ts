import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSessionUserId, getUserPermissions, getUserRoles } from "@/lib/auth/session";
import { sql } from "@/lib/db";
import type { PermissionKey } from "@/lib/auth/types";

export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get("session")?.value;
  if (!token) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const userId = await getSessionUserId(token);
  if (!userId) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const [user] = await sql`
    SELECT id, email, name, created_at, updated_at FROM users WHERE id = ${userId} LIMIT 1
  `;
  if (!user) {
    return NextResponse.json({ user: null }, { status: 200 });
  }

  const [roles, permissions] = await Promise.all([
    getUserRoles(userId),
    getUserPermissions(userId),
  ]);

  return NextResponse.json({
    user: {
      ...user,
      roles: roles as { id: string; name: string; description: string | null }[],
      permissions: permissions as PermissionKey[],
    },
  });
}
