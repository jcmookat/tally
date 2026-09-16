"use client";

import { useState } from "react";
import { motion } from "framer-motion";

type Props = {
  onCreate: (name: string) => void;
};

export default function AddBoardTile({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");

  function reset() {
    setName("");
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate(trimmed);
    reset();
  }

  if (!open) {
    return (
      <motion.div layout>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-6 text-muted transition-colors hover:border-accent hover:text-accent cursor-pointer"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-sm font-medium">New board</span>
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-border bg-surface p-4"
    >
      <form onSubmit={submit} className="flex flex-col gap-3">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Board name (e.g. Chores, Roommates)"
          className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          autoFocus
        />

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-ink cursor-pointer"
          >
            Add board
          </button>
          <button
            type="button"
            onClick={reset}
            className="rounded-full border border-border px-3 py-2 text-sm text-ink cursor-pointer hover:bg-surface-raised"
          >
            Cancel
          </button>
        </div>
      </form>
    </motion.div>
  );
}
