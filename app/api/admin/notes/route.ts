import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, users, shareLinks } from "@/lib/db/schema";
import { desc, sql } from "drizzle-orm";

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
      id: notes.id,
      title: notes.title,
      userId: notes.userId,
      ownerEmail: users.email,
      ownerName: users.name,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      shareCount: sql<number>`(SELECT count(*) FROM share_links WHERE share_links.note_id = ${notes.id})`.as("share_count"),
    })
    .from(notes)
    .leftJoin(users, sql`${notes.userId} = ${users.id}`)
    .orderBy(desc(notes.updatedAt));

  return NextResponse.json({ notes: result });
}
