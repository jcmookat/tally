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
          <div className="flex items-center gap-2">
            <a
              href={`/api/items/${slug}/export`}
              download
              title="Export as CSV"
              aria-label="Export as CSV"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted transition-colors hover:text-ink hover:border-accent"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M5 17v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
              </svg>
            </a>
            <ThemeToggle />
          </div>
        </header>

        <TallyBoard board={slug} initialItems={items} />
      </main>
    </div>
  );
}
