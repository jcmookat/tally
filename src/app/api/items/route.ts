import { NextRequest, NextResponse } from "next/server";
import { createItem, listItems } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const items = await listItems();
  return NextResponse.json(items);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const name = typeof body.name === "string" ? body.name.trim() : "";

  if (!name) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const color = typeof body.color === "string" ? body.color : "#c98a3f";
  const step =
    typeof body.step === "number" && Number.isFinite(body.step) ? body.step : 1;

  const item = await createItem({ name, color, step });
  return NextResponse.json(item, { status: 201 });
}
