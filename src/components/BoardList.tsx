"use client";

import { useRef, useState } from "react";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import type { Board } from "@/lib/db";
import BoardCard from "@/components/BoardCard";
import AddBoardTile from "@/components/AddBoardTile";

type Props = {
  initialBoards: Board[];
};

type SortableBoardProps = {
  board: Board;
  onSave: (name: string) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

function SortableBoard({
  board,
  onSave,
  onDelete,
  onDragStart,
  onDragEnd,
}: SortableBoardProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={board}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.2, ease: "easeOut" }}
      className="list-none"
    >
      <BoardCard
        board={board}
        dragControls={dragControls}
        onSave={onSave}
        onDelete={onDelete}
      />
    </Reorder.Item>
  );
}

export default function BoardList({ initialBoards }: Props) {
  const [boards, setBoards] = useState<Board[]>(initialBoards);
  const [error, setError] = useState<string | null>(null);
  const dragStartOrder = useRef<Board[] | null>(null);

  function flash(message: string) {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }

  async function handleCreate(name: string) {
    const tempSlug = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: Board = {
      slug: tempSlug,
      name,
      position: boards.length,
      created_at: now,
    };
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

  async function handleRename(slug: string, name: string) {
    const previous = boards;
    setBoards((prev) =>
      prev.map((b) => (b.slug === slug ? { ...b, name } : b))
    );

    try {
      const res = await fetch(`/api/boards/${slug}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      if (!res.ok) throw new Error("Failed to rename board");
      const updated: Board = await res.json();
      setBoards((prev) => prev.map((b) => (b.slug === slug ? updated : b)));
    } catch {
      setBoards(previous);
      flash("Couldn't rename that board. Try again.");
    }
  }

  async function handleDelete(slug: string) {
    const previous = boards;
    setBoards((prev) => prev.filter((b) => b.slug !== slug));

    try {
      const res = await fetch(`/api/boards/${slug}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete board");
    } catch {
      setBoards(previous);
      flash("Couldn't delete that board. Try again.");
    }
  }

  function handleDragStart() {
    dragStartOrder.current = boards;
  }

  async function handleDragEnd() {
    const previous = dragStartOrder.current;
    dragStartOrder.current = null;
    if (!previous) return;

    const currentSlugs = boards.map((b) => b.slug);
    const previousSlugs = previous.map((b) => b.slug);
    if (currentSlugs.join() === previousSlugs.join()) return;

    try {
      const res = await fetch("/api/boards", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentSlugs }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
    } catch {
      setBoards(previous);
      flash("Couldn't save that order. Try again.");
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <Reorder.Group
        as="ul"
        axis="y"
        values={boards}
        onReorder={setBoards}
        className="flex flex-col gap-3"
      >
        <AnimatePresence initial={false}>
          {boards.map((board) => (
            <SortableBoard
              key={board.slug}
              board={board}
              onSave={(name) => handleRename(board.slug, name)}
              onDelete={() => handleDelete(board.slug)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AddBoardTile onCreate={handleCreate} />

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-danger px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
