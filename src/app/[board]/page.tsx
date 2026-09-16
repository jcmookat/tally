import Link from "next/link";
import { notFound } from "next/navigation";
import { getBoard, listItems } from "@/lib/db";
import TallyBoard from "@/components/TallyBoard";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function BoardPage({
  params,
}: PageProps<"/[board]">) {
  const { board: slug } = await params;
  const board = await getBoard(slug);
  if (!board) notFound();

  const items = await listItems(slug);

  return (
    <div className="flex flex-1 justify-center bg-bg">
      <main className="flex w-full max-w-xl flex-col gap-8 px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-xs text-muted transition-colors hover:text-ink"
            >
              ← All boards
            </Link>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {board.name}
            </h1>
            <p className="text-sm text-muted">
              Click counters for anything worth counting.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <TallyBoard board={slug} initialItems={items} />
      </main>
    </div>
  );
}
