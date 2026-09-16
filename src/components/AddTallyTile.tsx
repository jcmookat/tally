"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { SWATCHES, randomSwatch } from "@/lib/palette";

type Props = {
  onCreate: (input: {
    name: string;
    color: string;
    step: number;
    autoTally: boolean;
  }) => void;
};

export default function AddTallyTile({ onCreate }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [color, setColor] = useState(randomSwatch());
  const [step, setStep] = useState(1);
  const [autoTally, setAutoTally] = useState(false);

  function reset() {
    setName("");
    setColor(randomSwatch());
    setStep(1);
    setAutoTally(false);
    setOpen(false);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    onCreate({
      name: trimmed,
      color,
      step: Math.max(1, Math.round(step)),
      autoTally,
    });
    reset();
  }

  if (!open) {
    return (
      <motion.div layout>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-border py-5 text-muted transition-colors hover:border-accent hover:text-accent cursor-pointer"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current">
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span className="text-sm font-medium">New tally</span>
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
          placeholder="What are you counting?"
          className="w-full rounded-lg border border-border bg-surface-raised px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          autoFocus
        />

        <div className="flex items-center gap-2">
          {SWATCHES.map((s) => (
            <button
              key={s.value}
              type="button"
              aria-label={s.name}
              onClick={() => setColor(s.value)}
              className="h-6 w-6 rounded-full"
              style={{
                background: s.value,
                outline: color === s.value ? "2px solid var(--ink)" : "none",
                outlineOffset: "2px",
              }}
            />
          ))}
        </div>

        <label className="flex items-center gap-2 text-xs text-muted">
          Step size
          <input
            type="number"
            min={1}
            value={step}
            onChange={(e) => setStep(Number(e.target.value) || 1)}
            className="w-16 rounded-lg border border-border bg-surface-raised px-2 py-1 text-sm text-ink outline-none focus:border-accent"
          />
        </label>

        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={autoTally}
            onChange={(e) => setAutoTally(e.target.checked)}
            className="h-3.5 w-3.5 accent-accent"
          />
          Auto-add +{Math.max(1, Math.round(step))} every day
        </label>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="submit"
            className="flex-1 rounded-full bg-accent px-3 py-2 text-sm font-semibold text-accent-ink cursor-pointer"
          >
            Add tally
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
