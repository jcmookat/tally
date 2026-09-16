"use client";

import { useRef, useState } from "react";
import { AnimatePresence, Reorder, useDragControls } from "framer-motion";
import type { Item } from "@/lib/db";
import TallyCard from "@/components/TallyCard";
import AddTallyTile from "@/components/AddTallyTile";

type Props = {
  board: string;
  initialItems: Item[];
};

type SortableCardProps = {
  item: Item;
  onBump: (delta: number) => void;
  onSave: (patch: {
    name: string;
    color: string;
    step: number;
    autoTally: boolean;
  }) => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
};

function SortableCard({
  item,
  onBump,
  onSave,
  onDelete,
  onDragStart,
  onDragEnd,
}: SortableCardProps) {
  const dragControls = useDragControls();

  return (
    <Reorder.Item
      value={item}
      dragListener={false}
      dragControls={dragControls}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="list-none"
    >
      <TallyCard
        item={item}
        dragControls={dragControls}
        onBump={onBump}
        onSave={onSave}
        onDelete={onDelete}
      />
    </Reorder.Item>
  );
}

export default function TallyBoard({ board, initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [error, setError] = useState<string | null>(null);
  const dragStartOrder = useRef<Item[] | null>(null);

  function flash(message: string) {
    setError(message);
    setTimeout(() => setError(null), 3000);
  }

  async function handleCreate(input: {
    name: string;
    color: string;
    step: number;
    autoTally: boolean;
  }) {
    const tempId = `temp-${Date.now()}`;
    const now = new Date().toISOString();
    const optimistic: Item = {
      id: tempId,
      name: input.name,
      color: input.color,
      step: input.step,
      count: 0,
      auto_tally: input.autoTally,
      last_auto_date: input.autoTally ? now.slice(0, 10) : null,
      board,
      position: items.length,
      created_at: now,
      updated_at: now,
    };
    setItems((prev) => [...prev, optimistic]);

    try {
      const res = await fetch(`/api/items/${board}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      });
      if (!res.ok) throw new Error("Failed to create");
      const created: Item = await res.json();
      setItems((prev) => prev.map((it) => (it.id === tempId ? created : it)));
    } catch {
      setItems((prev) => prev.filter((it) => it.id !== tempId));
      flash("Couldn't create that tally. Try again.");
    }
  }

  async function handleBump(id: string, delta: number) {
    const previous = items;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id ? { ...it, count: it.count + delta } : it
      )
    );

    try {
      const res = await fetch(`/api/items/${board}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ delta }),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: Item = await res.json();
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    } catch {
      setItems(previous);
      flash("Couldn't save that click. Try again.");
    }
  }

  async function handleSave(
    id: string,
    patch: { name: string; color: string; step: number; autoTally: boolean }
  ) {
    const previous = items;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              name: patch.name,
              color: patch.color,
              step: patch.step,
              auto_tally: patch.autoTally,
            }
          : it
      )
    );

    try {
      const res = await fetch(`/api/items/${board}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      if (!res.ok) throw new Error("Failed to update");
      const updated: Item = await res.json();
      setItems((prev) => prev.map((it) => (it.id === id ? updated : it)));
    } catch {
      setItems(previous);
      flash("Couldn't save those changes. Try again.");
    }
  }

  async function handleDelete(id: string) {
    const previous = items;
    setItems((prev) => prev.filter((it) => it.id !== id));

    try {
      const res = await fetch(`/api/items/${board}/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setItems(previous);
      flash("Couldn't delete that tally. Try again.");
    }
  }

  function handleDragStart() {
    dragStartOrder.current = items;
  }

  async function handleDragEnd() {
    const previous = dragStartOrder.current;
    dragStartOrder.current = null;
    if (!previous) return;

    const currentIds = items.map((it) => it.id);
    const previousIds = previous.map((it) => it.id);
    if (currentIds.join() === previousIds.join()) return;

    try {
      const res = await fetch(`/api/items/${board}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order: currentIds }),
      });
      if (!res.ok) throw new Error("Failed to reorder");
    } catch {
      setItems(previous);
      flash("Couldn't save that order. Try again.");
    }
  }

  const total = items.reduce((sum, it) => sum + it.count, 0);

  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-6">
      <div className="flex items-baseline justify-between text-sm text-muted">
        <span>
          {items.length} {items.length === 1 ? "tally" : "tallies"}
        </span>
        <span className="tabular">{total.toLocaleString()} total clicks</span>
      </div>

      <Reorder.Group
        as="ul"
        axis="y"
        values={items}
        onReorder={setItems}
        className="flex flex-col gap-4"
      >
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <SortableCard
              key={item.id}
              item={item}
              onBump={(delta) => handleBump(item.id, delta)}
              onSave={(patch) => handleSave(item.id, patch)}
              onDelete={() => handleDelete(item.id)}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
            />
          ))}
        </AnimatePresence>
      </Reorder.Group>

      <AddTallyTile onCreate={handleCreate} />

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-danger px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
