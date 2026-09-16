"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import type { Item } from "@/lib/db";
import TallyCard from "@/components/TallyCard";
import AddTallyTile from "@/components/AddTallyTile";

type Props = {
  initialItems: Item[];
};

export default function TallyBoard({ initialItems }: Props) {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [error, setError] = useState<string | null>(null);

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
      created_at: now,
      updated_at: now,
    };
    setItems((prev) => [...prev, optimistic]);

    try {
      const res = await fetch("/api/items", {
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
      const res = await fetch(`/api/items/${id}`, {
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
      const res = await fetch(`/api/items/${id}`, {
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
      const res = await fetch(`/api/items/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
    } catch {
      setItems(previous);
      flash("Couldn't delete that tally. Try again.");
    }
  }

  const total = items.reduce((sum, it) => sum + it.count, 0);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-baseline justify-between text-sm text-muted">
        <span>
          {items.length} {items.length === 1 ? "tally" : "tallies"}
        </span>
        <span className="tabular">{total.toLocaleString()} total clicks</span>
      </div>

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        <AnimatePresence initial={false}>
          {items.map((item) => (
            <TallyCard
              key={item.id}
              item={item}
              onBump={(delta) => handleBump(item.id, delta)}
              onSave={(patch) => handleSave(item.id, patch)}
              onDelete={() => handleDelete(item.id)}
            />
          ))}
        </AnimatePresence>
        <AddTallyTile onCreate={handleCreate} />
      </ul>

      {error && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 rounded-full bg-danger px-4 py-2 text-sm font-medium text-white shadow-lg">
          {error}
        </div>
      )}
    </div>
  );
}
