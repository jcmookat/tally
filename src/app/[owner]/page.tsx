import Link from "next/link";
import { notFound } from "next/navigation";
import { listItems } from "@/lib/db";
import { isOwner, OWNER_LABELS } from "@/lib/owners";
import TallyBoard from "@/components/TallyBoard";
import ThemeToggle from "@/components/ThemeToggle";

export const dynamic = "force-dynamic";

export default async function OwnerPage({
  params,
}: PageProps<"/[owner]">) {
  const { owner } = await params;
  if (!isOwner(owner)) notFound();

  const items = await listItems(owner);

  return (
    <div className="flex flex-1 justify-center bg-bg">
      <main className="flex w-full max-w-5xl flex-col gap-8 px-6 py-10 sm:px-10">
        <header className="flex items-center justify-between">
          <div>
            <Link
              href="/"
              className="text-xs text-muted transition-colors hover:text-ink"
            >
              ← Switch board
            </Link>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              {OWNER_LABELS[owner]}&rsquo;s Tally
            </h1>
            <p className="text-sm text-muted">
              Click counters for anything worth counting.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <TallyBoard owner={owner} initialItems={items} />
      </main>
    </div>
  );
}
