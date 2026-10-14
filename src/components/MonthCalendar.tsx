"use client";

import { useMemo, useState } from "react";
import { toDateKey } from "@/lib/calendarDate";

type Props = {
  marks: string[];
  notes: Record<string, string>;
  color: string;
  onToggleDay: (date: string) => void;
  onSetNote: (date: string, note: string) => void;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function MonthCalendar({
  marks,
  notes,
  color,
  onToggleDay,
  onSetNote,
}: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
  const [notesMode, setNotesMode] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const markSet = useMemo(() => new Set(marks), [marks]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();

  const cells: (Date | null)[] = [
    ...Array.from({ length: startWeekday }, () => null),
    ...Array.from({ length: daysInMonth }, (_, i) => new Date(year, month, i + 1)),
  ];

  const isCurrentMonth =
    viewDate.getFullYear() === new Date().getFullYear() &&
    viewDate.getMonth() === new Date().getMonth();

  function handleDayClick(key: string) {
    if (notesMode) {
      setEditingDate(key);
      setDraftNote(notes[key] ?? "");
    } else {
      onToggleDay(key);
    }
  }

  function saveNote() {
    if (!editingDate) return;
    onSetNote(editingDate, draftNote);
    setEditingDate(null);
  }

  function removeNote() {
    if (!editingDate) return;
    onSetNote(editingDate, "");
    setEditingDate(null);
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setViewDate(new Date(year, month - 1, 1))}
          aria-label="Previous month"
          className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink hover:bg-surface-raised cursor-pointer"
        >
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 6l-6 6 6 6" />
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            {viewDate.toLocaleDateString(undefined, {
              month: "long",
              year: "numeric",
            })}
          </span>
          {!isCurrentMonth && (
            <button
              type="button"
              onClick={() => setViewDate(new Date())}
              className="text-xs text-accent cursor-pointer hover:underline"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setNotesMode((v) => !v);
              setEditingDate(null);
            }}
            aria-pressed={notesMode}
            title={notesMode ? "Exit note mode" : "Add notes to days"}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer"
            style={{
              color: notesMode ? "var(--accent)" : "var(--muted)",
              background: notesMode ? "var(--surface-raised)" : "transparent",
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => setViewDate(new Date(year, month + 1, 1))}
            aria-label="Next month"
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink hover:bg-surface-raised cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>
        </div>
      </div>

      {notesMode && (
        <p className="text-center text-[0.65rem] text-muted">
          Tap a day to add or edit its note.
        </p>
      )}

      <div className="grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="flex h-6 items-center justify-center text-[0.65rem] font-medium text-muted"
          >
            {label}
          </div>
        ))}

        {cells.map((date, i) => {
          if (!date) return <div key={`blank-${i}`} />;

          const key = toDateKey(date);
          const marked = markSet.has(key);
          const hasNote = Boolean(notes[key]);
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => handleDayClick(key)}
              aria-pressed={notesMode ? undefined : marked}
              aria-label={
                notesMode
                  ? `Edit note for ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
                  : `${marked ? "Unmark" : "Mark"} ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`
              }
              className={`relative flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                marked ? "" : "hover:bg-surface-raised"
              }`}
              style={{
                background: marked ? color : "transparent",
                color: marked ? "#fff" : "var(--ink)",
                outline: isToday && !marked ? "1.5px solid var(--border)" : "none",
                outlineOffset: "-1.5px",
              }}
            >
              {date.getDate()}
              {hasNote && (
                <span
                  aria-hidden
                  className="absolute bottom-1 h-1 w-1 rounded-full"
                  style={{ background: marked ? "#fff" : "var(--accent)" }}
                />
              )}
            </button>
          );
        })}
      </div>

      {editingDate && (
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface-raised p-3">
          <div className="flex items-center justify-between text-xs font-medium text-muted">
            <span>
              Note for{" "}
              {new Date(`${editingDate}T00:00:00`).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
              })}
            </span>
            <button
              type="button"
              onClick={() => setEditingDate(null)}
              aria-label="Close"
              className="cursor-pointer hover:text-ink"
            >
              ✕
            </button>
          </div>
          <textarea
            value={draftNote}
            onChange={(e) => setDraftNote(e.target.value)}
            rows={2}
            autoFocus
            placeholder="Add a note…"
            className="w-full resize-none rounded-lg border border-border bg-surface px-2 py-1.5 text-sm text-ink outline-none focus:border-accent"
          />
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={saveNote}
              className="flex-1 rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-accent-ink cursor-pointer"
            >
              Save
            </button>
            {notes[editingDate] && (
              <button
                type="button"
                onClick={removeNote}
                className="rounded-full border border-border px-3 py-1.5 text-xs text-danger cursor-pointer hover:bg-surface"
              >
                Remove
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
