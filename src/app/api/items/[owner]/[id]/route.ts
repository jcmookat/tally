import { NextRequest, NextResponse } from "next/server";
import { deleteItem, updateItem } from "@/lib/db";
import { isOwner } from "@/lib/owners";

export const dynamic = "force-dynamic";

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[owner]/[id]">
) {
  const { owner, id } = await ctx.params;
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const body = await request.json();

  const patch: {
    name?: string;
    color?: string;
    step?: number;
    delta?: number;
    count?: number;
    autoTally?: boolean;
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
  if (typeof body.autoTally === "boolean") {
    patch.autoTally = body.autoTally;
  }

  const item = await updateItem(owner, id, patch);

  if (!item) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(item);
}

export async function DELETE(
  _request: NextRequest,
  ctx: RouteContext<"/api/items/[owner]/[id]">
) {
  const { owner, id } = await ctx.params;
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  await deleteItem(owner, id);
  return new NextResponse(null, { status: 204 });
}
