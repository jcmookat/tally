import { NextRequest, NextResponse } from "next/server";
import { createItem, listItems, reorderItems } from "@/lib/db";
import { isOwner } from "@/lib/owners";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const dynamic = "force-dynamic";

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/items/[owner]">
) {
  const { owner } = await ctx.params;
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const items = await listItems(owner);
  return NextResponse.json(items);
}

export async function POST(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[owner]">
) {
  const { owner } = await ctx.params;
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const color = typeof body.color === "string" ? body.color : "#c98a3f";
  const step =
    typeof body.step === "number" && Number.isFinite(body.step) ? body.step : 1;
  const autoTally = body.autoTally === true;

  const item = await createItem(owner, { name, color, step, autoTally });
  return NextResponse.json(item, { status: 201 });
}

export async function PATCH(
  request: NextRequest,
  ctx: RouteContext<"/api/items/[owner]">
) {
  const { owner } = await ctx.params;
  if (!isOwner(owner)) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const body = await request.json();
  const order = body.order;

  if (
    !Array.isArray(order) ||
    order.length === 0 ||
    !order.every((id) => typeof id === "string" && UUID_RE.test(id))
  ) {
    return NextResponse.json(
      { error: "order must be a non-empty array of item ids" },
      { status: 400 }
    );
  }

  await reorderItems(owner, order);
  return new NextResponse(null, { status: 204 });
}
