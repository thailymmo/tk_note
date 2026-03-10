import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { folders } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result = await db
    .select()
    .from(folders)
    .where(eq(folders.userId, user.userId))
    .orderBy(folders.name);

  return NextResponse.json({ folders: result });
}

export async function POST(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await request.json();
  if (!name?.trim()) {
    return NextResponse.json({ error: "Folder name is required" }, { status: 400 });
  }

  const [folder] = await db
    .insert(folders)
    .values({ userId: user.userId, name: name.trim() })
    .returning();

  return NextResponse.json({ folder }, { status: 201 });
}
