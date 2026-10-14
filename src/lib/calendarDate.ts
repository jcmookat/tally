// Local calendar-day semantics shared by the month calendar and streak
// calculation — deliberately the viewer's local date, not UTC, since
// marking a day is a manual action tied to the day the user perceives
// themselves to be on (unlike auto-tally's UTC bookkeeping).

export function toDateKey(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split("-").map(Number);
  return toDateKey(new Date(y, m - 1, d + delta));
}

export function computeStreaks(marks: string[]): {
  current: number;
  best: number;
} {
  if (marks.length === 0) return { current: 0, best: 0 };

  const markSet = new Set(marks);
  const sorted = [...marks].sort();

  let best = 1;
  let run = 1;
  for (let i = 1; i < sorted.length; i++) {
    run = addDays(sorted[i - 1], 1) === sorted[i] ? run + 1 : 1;
    best = Math.max(best, run);
  }

  // Counts consecutive marked days ending today; if today isn't marked
  // yet, the streak is still "alive" as long as yesterday was — it
  // only breaks once a day is actually skipped.
  const todayKey = toDateKey(new Date());
  let anchor = markSet.has(todayKey) ? todayKey : addDays(todayKey, -1);
  let current = 0;
  while (markSet.has(anchor)) {
    current += 1;
    anchor = addDays(anchor, -1);
  }

  return { current, best };
}
