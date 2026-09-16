import { listItems } from "@/lib/db";
import TallyBoard from "@/components/TallyBoard";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function Home() {
  const items = await listItems();

  return (
    <div className="flex flex-1 justify-center bg-bg">
      <main className="flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tally
            </h1>
            <p className="text-sm text-muted">
              Click counters for anything worth counting.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <TallyBoard initialItems={items} />
      </main>
    </div>
  );
}
