import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, users } from "@/lib/db/schema";
import { eq, desc, count } from "drizzle-orm";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userNotes = await db
    .select()
    .from(notes)
    .where(eq(notes.userId, user.userId))
    .orderBy(desc(notes.updatedAt));

  return NextResponse.json({ notes: userNotes });
}

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Check note limit
  const [userData] = await db
    .select({ maxNotes: users.maxNotes })
    .from(users)
    .where(eq(users.id, user.userId));

  const [noteCount] = await db
    .select({ count: count() })
    .from(notes)
    .where(eq(notes.userId, user.userId));

  if (noteCount.count >= userData.maxNotes) {
    return NextResponse.json(
      { error: `You have reached the maximum of ${userData.maxNotes} notes` },
      { status: 403 }
    );
  }

  const body = await request.json().catch(() => ({}));

  const [note] = await db
    .insert(notes)
    .values({
      userId: user.userId,
      title: body.title || "Untitled",
      content: body.content || "",
    })
    .returning();

  return NextResponse.json({ note }, { status: 201 });
}
