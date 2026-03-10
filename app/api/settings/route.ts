import { NextRequest, NextResponse } from "next/server";
import { verifyToken, hashPassword, verifyPassword } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [userData] = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      defaultTitle: users.defaultTitle,
      signature: users.signature,
      defaultContent: users.defaultContent,
    })
    .from(users)
    .where(eq(users.id, user.userId));

  return NextResponse.json({ settings: userData });
}

export async function PUT(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) updates.name = body.name;
  if (body.defaultTitle !== undefined) updates.defaultTitle = body.defaultTitle;
  if (body.signature !== undefined) updates.signature = body.signature;
  if (body.defaultContent !== undefined) updates.defaultContent = body.defaultContent;

  // Password change
  if (body.newPassword) {
    if (body.newPassword.length < 6) {
      return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
    }
    if (body.newPassword !== body.confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    updates.password = await hashPassword(body.newPassword);
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No updates" }, { status: 400 });
  }

  updates.updatedAt = new Date();

  await db.update(users).set(updates).where(eq(users.id, user.userId));

  return NextResponse.json({ ok: true });
}
