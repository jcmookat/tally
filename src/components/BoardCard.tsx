"use client";

import { useState } from "react";
import Link from "next/link";
import type { DragControls } from "framer-motion";
import type { Board } from "@/lib/db";

type Props = {
  board: Board;
  dragControls: DragControls;
  onSave: (name: string) => void;
  onDelete: () => void;
};

export default function BoardCard({
  board,
  dragControls,
  onSave,
  onDelete,
}: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(board.name);
  const isPending = board.slug.startsWith("temp-");

  function startEdit() {
    setName(board.name);
    setConfirmDelete(false);
    setMode("edit");
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave(trimmed);
    setMode("view");
  }

  return (
    <div className="flex items-center gap-1 rounded-2xl border border-border bg-surface p-1.5 shadow-sm">
      <button
        type="button"
        aria-label={`Reorder ${board.name}`}
        onPointerDown={(e) => dragControls.start(e)}
        className="flex h-9 w-9 shrink-0 touch-none items-center justify-center rounded-full text-muted transition-colors hover:bg-surface-raised hover:text-ink cursor-grab active:cursor-grabbing"
      >
        <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
          <circle cx="9" cy="6" r="1.4" />
          <circle cx="15" cy="6" r="1.4" />
          <circle cx="9" cy="12" r="1.4" />
          <circle cx="15" cy="12" r="1.4" />
          <circle cx="9" cy="18" r="1.4" />
          <circle cx="15" cy="18" r="1.4" />
        </svg>
      </button>

      {mode === "view" ? (
        <>
          {isPending ? (
            <span className="flex flex-1 items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-muted">
              {board.name}
              <span className="text-xs">Creating…</span>
            </span>
          ) : (
            <Link
              href={`/${board.slug}`}
              className="flex flex-1 items-center justify-between rounded-xl px-3 py-3 text-base font-semibold text-ink transition-colors hover:text-accent"
            >
              {board.name}
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 6l6 6-6 6" />
              </svg>
            </Link>
          )}
          <button
            type="button"
            onClick={startEdit}
            disabled={isPending}
            aria-label={`Edit ${board.name}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-muted transition-colors hover:text-ink hover:bg-surface-raised cursor-pointer disabled:opacity-40 disabled:cursor-default disabled:hover:bg-transparent disabled:hover:text-muted"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
        </>
      ) : (
        <div className="flex flex-1 flex-col gap-3 py-2 pr-2">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
            autoFocus
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={save}
              className="flex-1 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-ink cursor-pointer"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setMode("view")}
              className="rounded-full border border-border px-3 py-2 text-sm text-ink cursor-pointer hover:bg-surface-raised"
            >
              Cancel
            </button>
          </div>
          <div className="flex items-center justify-end border-t border-border pt-3">
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Delete this board and all its tallies?</span>
                <button
                  type="button"
                  onClick={onDelete}
                  className="font-semibold text-danger cursor-pointer"
                >
                  Confirm
                </button>
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="text-muted cursor-pointer"
                >
                  No
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                className="text-xs text-danger cursor-pointer"
              >
                Delete board
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
