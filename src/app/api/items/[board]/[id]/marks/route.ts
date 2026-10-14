import { NextRequest, NextResponse } from "next/server";
import { toggleMark } from "@/lib/db";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const dynamic = "force-dynamic";

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[board]/[id]/marks">
) {
  const { board, id } = await ctx.params;
  const body = await request.json();
  const date = body.date;

  if (typeof date !== "string" || !DATE_RE.test(date)) {
    return NextResponse.json(
      { error: "date must be a YYYY-MM-DD string" },
      { status: 400 }
    );
  }

  const item = await toggleMark(board, id, date);

  if (!item) {
    return NextResponse.json(
      { error: "Not found, or not a calendar tally" },
      { status: 404 }
    );
  }

  return NextResponse.json(item);
}
