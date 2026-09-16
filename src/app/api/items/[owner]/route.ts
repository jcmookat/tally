import { NextRequest, NextResponse } from "next/server";
import { createItem, listItems } from "@/lib/db";
import { isOwner } from "@/lib/owners";

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
