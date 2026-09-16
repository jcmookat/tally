import { NextRequest, NextResponse } from "next/server";
import { deleteItem, updateItem } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[id]">
) {
  const { id } = await ctx.params;
  const body = await request.json();

  const patch: {
    name?: string;
    color?: string;
    step?: number;
    delta?: number;
    count?: number;
  } = {};

  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
  }
  if (typeof body.color === "string") {
    patch.color = body.color;
  }
  if (typeof body.step === "number" && Number.isFinite(body.step)) {
    patch.step = body.step;
  }
  if (typeof body.delta === "number" && Number.isFinite(body.delta)) {
    patch.delta = body.delta;
  }
  if (typeof body.count === "number" && Number.isFinite(body.count)) {
    patch.count = body.count;
  }

  const item = await updateItem(id, patch);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/items/[id]">
) {
  const { id } = await ctx.params;
  await deleteItem(id);
  return new NextResponse(null, { status: 204 });
}
