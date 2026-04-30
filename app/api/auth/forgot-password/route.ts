import { NextResponse } from "next/server";
import { z } from "zod";
import { sql } from "@/lib/db";
import { hashPassword } from "@/lib/auth/password";

const RESET_CODE = "2596";

const schema = z.object({
  email: z.string().email(),
  code: z.string(),
  newPassword: z.string().min(8),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const { email, code, newPassword } = parsed.data;
    if (code !== RESET_CODE) {
      return NextResponse.json({ error: "Invalid reset code" }, { status: 401 });
    }

    const user = await sql`
      SELECT id FROM users WHERE email = ${email} LIMIT 1
    `;
    if (user.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const passwordHash = await hashPassword(newPassword);
    await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, updated_at = NOW()
      WHERE email = ${email}
    `;

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Forgot password error:", err);
    return NextResponse.json(
      { error: "Could not reset password" },
      { status: 500 }
    );
  }
}
