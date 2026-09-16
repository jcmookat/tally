import { NextRequest, NextResponse } from "next/server";
import { deleteBoard, renameBoard } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/boards/[board]">
) {
  const { board } = await ctx.params;
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const updated = await renameBoard(board, name);

  if (!updated) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  return NextResponse.json(updated);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/boards/[board]">
) {
  const { board } = await ctx.params;
  await deleteBoard(board);
  return new NextResponse(null, { status: 204 });
}
