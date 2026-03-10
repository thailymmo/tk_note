import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, users } from "@/lib/db/schema";
import { eq, desc, count, sql, and, ilike, inArray } from "drizzle-orm";
import { nanoid } from "nanoid";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

const PAGE_SIZE = 20;

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const folderId = searchParams.get("folderId");
  const search = searchParams.get("search");
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  // Build conditions
  const conditions = [eq(notes.userId, user.userId)];

  if (folderId === "null") {
    conditions.push(sql`${notes.folderId} IS NULL`);
  } else if (folderId) {
    conditions.push(eq(notes.folderId, folderId));
  }

  if (search && search.trim()) {
    conditions.push(ilike(notes.title, `%${search.trim()}%`));
  }

  const where = and(...conditions);

  // Get total count
  const [totalResult] = await db
    .select({ count: count() })
    .from(notes)
    .where(where);

  const total = totalResult.count;
  const totalPages = Math.ceil(total / PAGE_SIZE);

  // Get notes with pagination, pinned first
  const userNotes = await db
    .select({
      id: notes.id,
      title: notes.title,
      slug: notes.slug,
      content: notes.content,
      folderId: notes.folderId,
      isPinned: notes.isPinned,
      viewCount: notes.viewCount,
      createdAt: notes.createdAt,
      updatedAt: notes.updatedAt,
      shareCount: sql<number>`(SELECT count(*) FROM share_links WHERE share_links.note_id = ${notes.id})`.as("share_count"),
      hasPassword: sql<boolean>`EXISTS(SELECT 1 FROM share_links WHERE share_links.note_id = ${notes.id} AND share_links.password IS NOT NULL)`.as("has_password"),
    })
    .from(notes)
    .where(where)
    .orderBy(desc(notes.isPinned), desc(notes.updatedAt))
    .limit(PAGE_SIZE)
    .offset((page - 1) * PAGE_SIZE);

  return NextResponse.json({
    notes: userNotes,
    pagination: { page, totalPages, total },
  });
}

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [userData] = await db
    .select({ maxNotes: users.maxNotes, defaultTitle: users.defaultTitle, defaultContent: users.defaultContent })
    .from(users)
    .where(eq(users.id, user.userId));

  const [noteCount] = await db
    .select({ count: count() })
    .from(notes)
    .where(eq(notes.userId, user.userId));

  if (noteCount.count >= userData.maxNotes) {
    return NextResponse.json(
      { error: `Bạn đã đạt giới hạn ${userData.maxNotes} ghi chú` },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));
  const slug = nanoid(8);

  const [note] = await db
    .insert(notes)
    .values({
      userId: user.userId,
      title: body.title || userData.defaultTitle || "Untitled",
      content: body.content || userData.defaultContent || "",
      folderId: body.folderId || null,
      slug,
    })
    .returning();

  return NextResponse.json({ note }, { status: 201 });
}

export async function DELETE(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const ids: string[] = body.ids;

  if (!ids || !Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: "No IDs provided" }, { status: 400 });
  }

  // Only delete notes belonging to this user
  await db
    .delete(notes)
    .where(and(inArray(notes.id, ids), eq(notes.userId, user.userId)));

  return NextResponse.json({ ok: true });
}
