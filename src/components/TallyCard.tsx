"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Item } from "@/lib/db";
import { SWATCHES } from "@/lib/palette";

type Props = {
  item: Item;
  onBump: (delta: number) => void;
  onSave: (patch: {
    name: string;
    color: string;
    step: number;
    autoTally: boolean;
  }) => void;
  onDelete: () => void;
};

export default function TallyCard({ item, onBump, onSave, onDelete }: Props) {
  const [mode, setMode] = useState<"view" | "edit">("view");
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [name, setName] = useState(item.name);
  const [color, setColor] = useState(item.color);
  const [step, setStep] = useState(item.step);
  const [autoTally, setAutoTally] = useState(item.auto_tally);

  function startEdit() {
    setName(item.name);
    setColor(item.color);
    setStep(item.step);
    setAutoTally(item.auto_tally);
    setConfirmDelete(false);
    setMode("edit");
  }

  function save() {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSave({
      name: trimmed,
      color,
      step: Math.max(1, Math.round(step)),
      autoTally,
    });
    setMode("view");
  }

  return (
    <motion.li
      layout
      initial={{ opacity: 0, scale: 0.9, y: 8 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.22, ease: "easeOut" }}
      className="list-none rounded-2xl border border-border bg-surface p-4 shadow-[0_1px_0_rgba(var(--shadow-color)/0.06)] flex flex-col gap-4"
    >
      {mode === "view" ? (
        <>
          <div className="flex items-center gap-2">
            <span
              className="h-2.5 w-2.5 shrink-0 rounded-full"
              style={{ background: item.color }}
              aria-hidden
            />
            <h3 className="flex-1 truncate text-[0.95rem] font-semibold text-ink">
              {item.name}
            </h3>
            {item.auto_tally && (
              <span
                title={`Auto-adds +${item.step} every day`}
                className="flex items-center gap-1 rounded-full bg-surface-raised px-2 py-0.5 text-[0.65rem] font-medium text-muted"
              >
                <svg viewBox="0 0 24 24" width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" />
                  <path d="M12 7v5l3 3" />
                </svg>
                auto
              </span>
            )}
            <button
              type="button"
              onClick={startEdit}
              aria-label={`Edit ${item.name}`}
              className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink hover:bg-surface-raised cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
            </button>
          </div>

          <div className="rounded-xl bg-window-bg px-4 py-3 overflow-hidden">
            <div className="relative h-11 flex items-center justify-center">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={item.count}
                  initial={{ y: 14, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -14, opacity: 0 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                  className="tabular absolute font-display text-4xl font-semibold text-window-ink"
                >
                  {item.count}
                </motion.span>
              </AnimatePresence>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => onBump(-item.step)}
              aria-label={`Subtract ${item.step}`}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-border text-ink transition-colors hover:bg-surface-raised cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M5 12h14" />
              </svg>
            </button>

            <motion.button
              type="button"
              onClick={() => onBump(item.step)}
              whileTap={{ scale: 0.95 }}
              style={{ background: item.color }}
              className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-full text-sm font-semibold text-white shadow-sm cursor-pointer"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Click
            </motion.button>

            <span className="w-9 shrink-0 text-center text-xs text-muted">
              +{item.step}
            </span>
          </div>
        </>
      ) : (
        <div className="flex flex-col gap-3">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
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
                className="h-6 w-6 rounded-full transition-transform"
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

          <div className="flex items-center justify-between border-t border-border pt-3">
            <button
              type="button"
              onClick={() => onBump(-item.count)}
              className="text-xs text-muted hover:text-ink cursor-pointer"
            >
              Reset to 0
            </button>
            {confirmDelete ? (
              <div className="flex items-center gap-2 text-xs">
                <span className="text-muted">Delete for good?</span>
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
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </motion.li>
  );
}
