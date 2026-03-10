import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes, shareLinks } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [share] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, token));

  if (!share) {
    return NextResponse.json(
      { error: "Share link not found" },
      { status: 404 }
    );
  }

  const [note] = await db
    .select()
    .from(notes)
    .where(eq(notes.id, share.noteId));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({
    note: {
      id: note.id,
      title: note.title,
      content: note.content,
      updatedAt: note.updatedAt,
    },
    mode: share.mode,
  });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params;

  const [share] = await db
    .select()
    .from(shareLinks)
    .where(eq(shareLinks.token, token));

  if (!share) {
    return NextResponse.json(
      { error: "Share link not found" },
      { status: 404 }
    );
  }

  if (share.mode !== "editable") {
    return NextResponse.json(
      { error: "This note is read-only" },
      { status: 403 }
    );
  }

  const body = await request.json();

  const [updated] = await db
    .update(notes)
    .set({
      title: body.title,
      content: body.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, share.noteId))
    .returning();

  return NextResponse.json({ note: updated });
}
