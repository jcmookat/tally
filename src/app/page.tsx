import Link from "next/link";
import { OWNERS, OWNER_LABELS } from "@/lib/owners";
import ThemeToggle from "@/components/ThemeToggle";

export default function Home() {
  return (
    <div className="flex flex-1 justify-center bg-bg">
      <main className="flex w-full max-w-5xl flex-col items-center gap-10 px-6 py-16 text-center">
        <div className="flex w-full items-center justify-between">
          <div className="text-left">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">
              Tally
            </h1>
            <p className="text-sm text-muted">
              Whose board do you want to open?
            </p>
          </div>
          <ThemeToggle />
        </div>

        <div className="flex flex-wrap items-center justify-center gap-4">
          {OWNERS.map((owner) => (
            <Link
              key={owner}
              href={`/${owner}`}
              className="rounded-2xl border border-border bg-surface px-10 py-8 text-lg font-semibold text-ink shadow-sm transition-colors hover:border-accent hover:text-accent"
            >
              {OWNER_LABELS[owner]}
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
