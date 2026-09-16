import { NextRequest, NextResponse } from "next/server";
import { createBoard, listBoards, reorderBoards } from "@/lib/db";
import { isReservedSlug, slugify } from "@/lib/boards";

export const dynamic = "force-dynamic";

export async function GET() {
  const boards = await listBoards();
  return NextResponse.json(boards);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  if (isReservedSlug(slugify(name))) {
    return NextResponse.json(
      { error: "That name isn't available, try another" },
      { status: 400 }
    );
  }

  const board = await createBoard(name);
  return NextResponse.json(board, { status: 201 });
}

export async function PATCH(request: NextRequest) {
  const body = await request.json();
  const order = body.order;

  if (
    !Array.isArray(order) ||
    order.length === 0 ||
    !order.every((slug) => typeof slug === "string" && slug.length > 0)
  ) {
    return NextResponse.json(
      { error: "order must be a non-empty array of board slugs" },
      { status: 400 }
    );
  }

  await reorderBoards(order);
  return new NextResponse(null, { status: 204 });
}
