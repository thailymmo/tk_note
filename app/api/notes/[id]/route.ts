import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.userId)));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  return NextResponse.json({ note });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.userId)));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  const [updated] = await db
    .update(notes)
    .set({
      title: body.title ?? note.title,
      content: body.content ?? note.content,
      updatedAt: new Date(),
    })
    .where(eq(notes.id, id))
    .returning();

  return NextResponse.json({ note: updated });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const [note] = await db
    .select()
    .from(notes)
    .where(and(eq(notes.id, id), eq(notes.userId, user.userId)));

  if (!note) {
    return NextResponse.json({ error: "Note not found" }, { status: 404 });
  }

  await db.delete(notes).where(eq(notes.id, id));

  return NextResponse.json({ ok: true });
}
