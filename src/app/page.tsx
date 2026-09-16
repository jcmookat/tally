import { listBoards } from "@/lib/db";
import ThemeToggle from "@/components/ThemeToggle";
import BoardList from "@/components/BoardList";

export const dynamic = "force-dynamic";

export default async function Home() {
  const boards = await listBoards();

  return (
    <div className="flex flex-1 justify-center bg-bg">
      <main className="flex w-full max-w-xl flex-col gap-8 px-6 py-16">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tally
            </h1>
            <p className="text-sm text-muted">
              Pick a board, or start a new one.
            </p>
          </div>
          <ThemeToggle />
        </div>

        <BoardList initialBoards={boards} />
      </main>
    </div>
  );
}
