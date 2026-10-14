"use client";

import { useMemo, useState } from "react";
import { addDays, toDateKey } from "@/lib/calendarDate";

type Props = {
  marks: string[];
  notes: Record<string, string>;
  color: string;
  onToggleDay: (date: string) => void;
  onSetNote: (date: string, note: string) => void;
};

type View = "month" | "year";

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];
const YEAR_CELL = 11;
const YEAR_GAP = 3;

function dayLabel(date: Date) {
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function buildYearWeeks(year: number): string[][] {
  const janFirstDow = new Date(year, 0, 1).getDay();
  const decLastDow = new Date(year, 11, 31).getDay();
  const startKey = addDays(`${year}-01-01`, -janFirstDow);
  const daysInYear =
    Math.round(
      (new Date(year, 11, 31).getTime() - new Date(year, 0, 1).getTime()) /
        86400000
    ) + 1;
  const totalWeeks = (janFirstDow + daysInYear + (6 - decLastDow)) / 7;

  return Array.from({ length: totalWeeks }, (_, col) =>
    Array.from({ length: 7 }, (_, row) => addDays(startKey, col * 7 + row))
  );
}

function buildMonthLabels(
  weeks: string[][],
  year: number
): { col: number; label: string }[] {
  const labels: { col: number; label: string }[] = [];
  let lastMonth = -1;
  weeks.forEach((col, i) => {
    const keyInYear = col.find((key) => key.startsWith(`${year}-`));
    if (!keyInYear) return;
    const date = new Date(`${keyInYear}T00:00:00`);
    if (date.getMonth() !== lastMonth) {
      lastMonth = date.getMonth();
      labels.push({
        col: i,
        label: date.toLocaleDateString(undefined, { month: "short" }),
      });
    }
  });
  return labels;
}

type DayCellProps = {
  date: Date;
  marked: boolean;
  hasNote: boolean;
  isToday: boolean;
  notesMode: boolean;
  color: string;
  variant: "month" | "year";
  size?: number;
  dimmed?: boolean;
  onClick: () => void;
};

function DayCell({
  date,
  marked,
  hasNote,
  isToday,
  notesMode,
  color,
  variant,
  size,
  dimmed,
  onClick,
}: DayCellProps) {
  const isMonth = variant === "month";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={notesMode ? undefined : marked}
      aria-label={
        notesMode
          ? `Edit note for ${dayLabel(date)}`
          : `${marked ? "Unmark" : "Mark"} ${dayLabel(date)}`
      }
      title={dayLabel(date)}
      style={{
        ...(isMonth ? {} : { width: size, height: size }),
        background: marked ? color : isMonth ? "transparent" : "var(--surface-raised)",
        color: marked ? "#fff" : "var(--ink)",
        outline: isToday && !marked ? "1.5px solid var(--border)" : "none",
        outlineOffset: "-1.5px",
      }}
      className={`relative flex shrink-0 items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
        isMonth ? "aspect-square rounded-lg" : "rounded-[3px]"
      } ${marked ? "" : isMonth ? "hover:bg-surface-raised" : "hover:bg-surface"} ${
        dimmed && !marked ? "opacity-40" : ""
      }`}
    >
      {isMonth && date.getDate()}
      {hasNote && (
        <span
          aria-hidden
          className="absolute rounded-full"
          style={
            isMonth
              ? {
                  bottom: 4,
                  height: 4,
                  width: 4,
                  background: marked ? "#fff" : "var(--accent)",
                }
              : {
                  top: 1,
                  right: 1,
                  height: 3,
                  width: 3,
                  background: marked ? "#fff" : "var(--accent)",
                }
          }
        />
      )}
    </button>
  );
}

export default function MonthCalendar({
  marks,
  notes,
  color,
  onToggleDay,
  onSetNote,
}: Props) {
  const [view, setView] = useState<View>("month");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [notesMode, setNotesMode] = useState(false);
  const [editingDate, setEditingDate] = useState<string | null>(null);
  const [draftNote, setDraftNote] = useState("");
  const markSet = useMemo(() => new Set(marks), [marks]);
  const todayKey = useMemo(() => toDateKey(new Date()), []);

  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const isCurrentPeriod =
    view === "month"
      ? year === new Date().getFullYear() && month === new Date().getMonth()
      : year === new Date().getFullYear();

  function handleDayClick(key: string) {
    if (notesMode) {
      setEditingDate(key);
      setDraftNote(notes[key] ?? "");
    } else {
      onToggleDay(key);
    }
  }

  function goBack() {
    setViewDate(
      view === "month" ? new Date(year, month - 1, 1) : new Date(year - 1, month, 1)
    );
  }

  function goForward() {
    setViewDate(
      view === "month" ? new Date(year, month + 1, 1) : new Date(year + 1, month, 1)
    );
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

  // Month grid cells. Leading/trailing days from the adjacent months
  // fill out the first/last week (dimmed, but still clickable — a day
  // at the start or end of a month shouldn't require navigating to the
  // next/previous month just to mark it).
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const startWeekday = new Date(year, month, 1).getDay();
  const daysInPrevMonth = new Date(year, month, 0).getDate();
  const leadingDays = Array.from(
    { length: startWeekday },
    (_, i) => new Date(year, month - 1, daysInPrevMonth - startWeekday + i + 1)
  );
  const currentMonthDays = Array.from(
    { length: daysInMonth },
    (_, i) => new Date(year, month, i + 1)
  );
  const trailingCount =
    (7 - ((leadingDays.length + currentMonthDays.length) % 7)) % 7;
  const trailingDays = Array.from(
    { length: trailingCount },
    (_, i) => new Date(year, month + 1, i + 1)
  );
  const monthCells = [...leadingDays, ...currentMonthDays, ...trailingDays];

  // Year heatmap: week-columns from the Sunday on/before Jan 1 through
  // the Saturday on/after Dec 31, same shape as a GitHub contribution
  // graph. Days outside the target year (padding at either end) render
  // blank. Cheap enough (at most ~54 weeks) to just compute directly
  // each render rather than memoize.
  const weeks = buildYearWeeks(year);
  const monthLabels = buildMonthLabels(weeks, year);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setView((v) => (v === "month" ? "year" : "month"))}
            aria-pressed={view === "year"}
            title={view === "month" ? "Switch to year view" : "Switch to month view"}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors cursor-pointer"
            style={{
              color: view === "year" ? "var(--accent)" : "var(--muted)",
              background: view === "year" ? "var(--surface-raised)" : "transparent",
            }}
          >
            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <rect x="14" y="14" width="7" height="7" rx="1" />
            </svg>
          </button>
          <button
            type="button"
            onClick={goBack}
            aria-label={view === "month" ? "Previous month" : "Previous year"}
            className="flex h-7 w-7 items-center justify-center rounded-full text-muted transition-colors hover:text-ink hover:bg-surface-raised cursor-pointer"
          >
            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 6l-6 6 6 6" />
            </svg>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-ink">
            {view === "month"
              ? viewDate.toLocaleDateString(undefined, { month: "long", year: "numeric" })
              : year}
          </span>
          {!isCurrentPeriod && (
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
            onClick={goForward}
            aria-label={view === "month" ? "Next month" : "Next year"}
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

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-1">
          {WEEKDAY_LABELS.map((label) => (
            <div
              key={label}
              className="flex h-6 items-center justify-center text-[0.65rem] font-medium text-muted"
            >
              {label}
            </div>
          ))}

          {monthCells.map((date) => {
            const key = toDateKey(date);
            return (
              <DayCell
                key={key}
                date={date}
                marked={markSet.has(key)}
                hasNote={Boolean(notes[key])}
                isToday={key === todayKey}
                notesMode={notesMode}
                color={color}
                variant="month"
                dimmed={date.getMonth() !== month}
                onClick={() => handleDayClick(key)}
              />
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1">
            <div className="flex" style={{ gap: YEAR_GAP, paddingLeft: 16 }}>
              {weeks.map((_, i) => {
                const label = monthLabels.find((m) => m.col === i);
                return (
                  <div
                    key={i}
                    style={{ width: YEAR_CELL }}
                    className="shrink-0 text-[0.55rem] text-muted"
                  >
                    {label?.label}
                  </div>
                );
              })}
            </div>
            <div className="flex" style={{ gap: YEAR_GAP }}>
              <div className="flex shrink-0 flex-col" style={{ gap: YEAR_GAP, width: 13 }}>
                {WEEKDAY_LABELS.map((label, i) => (
                  <div
                    key={label}
                    style={{ height: YEAR_CELL }}
                    className="flex items-center text-[0.55rem] text-muted"
                  >
                    {i % 2 === 1 ? label[0] : ""}
                  </div>
                ))}
              </div>
              {weeks.map((col, colIndex) => (
                <div
                  key={colIndex}
                  className="flex shrink-0 flex-col"
                  style={{ gap: YEAR_GAP }}
                >
                  {col.map((key) => (
                    <DayCell
                      key={key}
                      date={new Date(`${key}T00:00:00`)}
                      marked={markSet.has(key)}
                      hasNote={Boolean(notes[key])}
                      isToday={key === todayKey}
                      notesMode={notesMode}
                      color={color}
                      variant="year"
                      size={YEAR_CELL}
                      dimmed={!key.startsWith(`${year}-`)}
                      onClick={() => handleDayClick(key)}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
