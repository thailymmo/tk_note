import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users, notes } from "@/lib/db/schema";
import { eq, count, sql } from "drizzle-orm";

export async function GET(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = verifyToken(token);
  if (!payload || payload.role !== "admin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const result = await db
    .select({
      id: users.id,
      email: users.email,
      name: users.name,
      role: users.role,
      maxNotes: users.maxNotes,
      createdAt: users.createdAt,
      noteCount: count(notes.id),
    })
    .from(users)
    .leftJoin(notes, eq(notes.userId, users.id))
    .groupBy(users.id)
    .orderBy(users.createdAt);

  return NextResponse.json({ users: result });
}
