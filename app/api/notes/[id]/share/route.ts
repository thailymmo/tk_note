import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, shareLinks } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { nanoid } from "nanoid";

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
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.userId)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const links = await db.select().from(shareLinks).where(eq(shareLinks.noteId, id));
  return NextResponse.json({ shares: links });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.userId)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const mode = body.mode === "editable" ? "editable" : "readonly";

  const [share] = await db
    .insert(shareLinks)
    .values({
      noteId: id,
      token: nanoid(),
      mode,
      password: body.password || null,
    })
    .returning();

  return NextResponse.json({ share }, { status: 201 });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { searchParams } = new URL(request.url);
  const shareId = searchParams.get("shareId");

  if (!shareId) return NextResponse.json({ error: "shareId required" }, { status: 400 });

  const [note] = await db.select().from(notes).where(and(eq(notes.id, id), eq(notes.userId, user.userId)));
  if (!note) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await db.delete(shareLinks).where(eq(shareLinks.id, shareId));
  return NextResponse.json({ ok: true });
}
