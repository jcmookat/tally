import { NextRequest, NextResponse } from "next/server";
import { getBoard, listItems } from "@/lib/db";

export const dynamic = "force-dynamic";

function csvField(value: string | number | boolean): string {
  const text = String(value);
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export async function GET(
  _request: NextRequest,
  ctx: RouteContext<"/api/items/[board]/export">
) {
  const { board } = await ctx.params;
  if (!(await getBoard(board))) {
    return NextResponse.json({ error: "Unknown board" }, { status: 404 });
  }

  const items = await listItems(board);

  const header = [
    "name",
    "count",
    "step",
    "auto_tally",
    "created_at",
    "updated_at",
  ];
  const rows = items.map((item) =>
    [
      csvField(item.name),
      csvField(item.count),
      csvField(item.step),
      csvField(item.auto_tally),
      csvField(new Date(item.created_at).toISOString()),
      csvField(new Date(item.updated_at).toISOString()),
    ].join(",")
  );
  const csv = [header.join(","), ...rows].join("\n") + "\n";

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${board}-tally.csv"`,
    },
  });
}
