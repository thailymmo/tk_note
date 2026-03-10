import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { notes } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  const [note] = await db
    .select({ title: notes.title, links: notes.links })
    .from(notes)
    .where(eq(notes.slug, slug));

  if (!note) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  let links = [];
  try {
    links = JSON.parse(note.links || "[]");
  } catch {
    links = [];
  }

  if (links.length === 0) {
    return NextResponse.json({ error: "No links" }, { status: 404 });
  }

  return NextResponse.json({ title: note.title, links });
}
