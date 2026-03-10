import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { notes, noteViews } from "@/lib/db/schema";
import { eq, sql, and, gte, lte, inArray } from "drizzle-orm";

function getUser(request: NextRequest) {
  const token = request.cookies.get("note_token")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  const user = getUser(request);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Get user's note IDs
  const userNotes = await db
    .select({ id: notes.id })
    .from(notes)
    .where(eq(notes.userId, user.userId));

  const noteIds = userNotes.map((n) => n.id);

  if (noteIds.length === 0) {
    return NextResponse.json({
      total: 0,
      today: 0,
      yesterday: 0,
      week: 0,
      month: 0,
      daily: [],
    });
  }

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);
  const monthStart = new Date(todayStart);
  monthStart.setDate(monthStart.getDate() - 30);

  const noteIdFilter = inArray(noteViews.noteId, noteIds);

  // Total views
  const [totalResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(noteViews)
    .where(noteIdFilter);

  // Today
  const [todayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(noteViews)
    .where(and(noteIdFilter, gte(noteViews.viewedAt, todayStart)));

  // Yesterday
  const [yesterdayResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(noteViews)
    .where(
      and(
        noteIdFilter,
        gte(noteViews.viewedAt, yesterdayStart),
        lte(noteViews.viewedAt, todayStart)
      )
    );

  // Week
  const [weekResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(noteViews)
    .where(and(noteIdFilter, gte(noteViews.viewedAt, weekStart)));

  // Month
  const [monthResult] = await db
    .select({ count: sql<number>`count(*)` })
    .from(noteViews)
    .where(and(noteIdFilter, gte(noteViews.viewedAt, monthStart)));

  // Daily breakdown (last 30 days)
  const daily = await db
    .select({
      date: sql<string>`TO_CHAR(${noteViews.viewedAt}, 'YYYY-MM-DD')`.as("date"),
      count: sql<number>`count(*)`.as("count"),
    })
    .from(noteViews)
    .where(and(noteIdFilter, gte(noteViews.viewedAt, monthStart)))
    .groupBy(sql`TO_CHAR(${noteViews.viewedAt}, 'YYYY-MM-DD')`)
    .orderBy(sql`TO_CHAR(${noteViews.viewedAt}, 'YYYY-MM-DD')`);

  return NextResponse.json({
    total: Number(totalResult.count),
    today: Number(todayResult.count),
    yesterday: Number(yesterdayResult.count),
    week: Number(weekResult.count),
    month: Number(monthResult.count),
    daily,
  });
}
