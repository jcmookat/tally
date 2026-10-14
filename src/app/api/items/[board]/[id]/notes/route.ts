import { NextRequest, NextResponse } from "next/server";
import { setNote } from "@/lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[board]/[id]/notes">
) {
  const { board, id } = await ctx.params;
  const body = await request.json();
  const date = body.date;
  const note = body.note;

  if (typeof date !== "string" || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "date must be a YYYY-MM-DD string" },
      { status: 400 }
    );
  }
  if (note !== null && typeof note !== "string") {
    return NextResponse.json(
      { error: "note must be a string or null" },
      { status: 400 }
    );
  }

  const item = await setNote(board, id, date, note);

  if (!item) {
    return NextResponse.json(
      { error: "Not found, or not a calendar tally" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}
