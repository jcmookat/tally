"use client";

import { useMemo, useState } from "react";

type Props = {
  marks: string[];
  color: string;
  onToggleDay: (date: string) => void;
};

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function MonthCalendar({ marks, color, onToggleDay }: Props) {
  const [viewDate, setViewDate] = useState(() => new Date());
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
          const isToday = key === todayKey;

          return (
            <button
              key={key}
              type="button"
              onClick={() => onToggleDay(key)}
              aria-pressed={marked}
              aria-label={`${marked ? "Unmark" : "Mark"} ${date.toLocaleDateString(undefined, { month: "short", day: "numeric" })}`}
              className={`flex aspect-square items-center justify-center rounded-lg text-xs font-medium transition-colors cursor-pointer ${
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
            </button>
          );
        })}
      </div>
    </div>
  );
}
