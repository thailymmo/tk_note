import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, shareLinks, noteViews, users } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [share] = await db.select().from(shareLinks).where(eq(shareLinks.token, token));
  if (!share) return NextResponse.json({ error: "Share link not found" }, { status: 404 });

  const [note] = await db.select().from(notes).where(eq(notes.id, share.noteId));
  if (!note) return NextResponse.json({ error: "Note not found" }, { status: 404 });

  // Get signature from note owner
  const [owner] = await db
    .select({ signature: users.signature })
    .from(users)
    .where(eq(users.id, note.userId));

  let links = [];
  try { links = JSON.parse(note.links || "[]"); } catch { links = []; }

  return NextResponse.json({
    note: {
      id: note.id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      viewCount: note.viewCount,
    },
    links,
    mode: share.mode,
    hasPassword: !!share.password,
    signature: owner?.signature || "",
  });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;
  const body = await request.json();

  const [share] = await db.select().from(shareLinks).where(eq(shareLinks.token, token));
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });

  // Password check
  if (share.password && share.password !== body.password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 403 });
  }

  // Record view and increment counter
  await db.insert(noteViews).values({ noteId: share.noteId });
  await db
    .update(notes)
    .set({ viewCount: sql`${notes.viewCount} + 1` })
    .where(eq(notes.id, share.noteId));

  const [note] = await db.select().from(notes).where(eq(notes.id, share.noteId));

  // Get signature
  const [owner] = await db
    .select({ signature: users.signature })
    .from(users)
    .where(eq(users.id, note.userId));

  let links2 = [];
  try { links2 = JSON.parse(note.links || "[]"); } catch { links2 = []; }

  return NextResponse.json({
    note: {
      id: note.id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
      viewCount: note.viewCount,
    },
    links: links2,
    mode: share.mode,
    signature: owner?.signature || "",
    ok: true,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [share] = await db.select().from(shareLinks).where(eq(shareLinks.token, token));
  if (!share) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (share.mode !== "editable") return NextResponse.json({ error: "Read-only" }, { status: 403 });

  const body = await request.json();

  const [updated] = await db
    .update(notes)
    .set({ title: body.title, content: body.content, updatedAt: new Date() })
    .where(eq(notes.id, share.noteId))
    .returning();

  return NextResponse.json({ note: updated });
}
