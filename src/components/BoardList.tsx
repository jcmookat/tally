"use client";

import { useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import type { Board } from "@/lib/db";
import AddBoardTile from "@/components/AddBoardTile";

type Props = {
  initialBoards: Board[];
};

export default function BoardList({ initialBoards }: Props) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [error, setError] = useState<string | null>(null);

  function flash(message: string) {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }

  async function handleCreate(name: string) {
    const tempSlug = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: Board = { slug: tempSlug, name, created_at: now };
    setBoards((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/boards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        throw new Error(body?.error ?? "Failed to create board");
      }
      const created: Board = await res.json();
      setBoards((prev) =>
        prev.map((b) => (b.slug === tempSlug ? created : b))
      );
    } catch (err) {
      setBoards((prev) => prev.filter((b) => b.slug !== tempSlug));
      flash(err instanceof Error ? err.message : "Couldn't create that board.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <AnimatePresence initial={false}>
        {boards.map((board) => (
          <motion.div
            key={board.slug}
            layout
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Link
              href={`/${board.slug}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-surface px-6 py-5 text-lg font-semibold text-ink shadow-sm transition-colors hover:border-accent hover:text-accent"
            >
              {board.name}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          </motion.div>
        ))}
      </AnimatePresence>

      <AddBoardTile onCreate={handleCreate} />

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-danger px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
