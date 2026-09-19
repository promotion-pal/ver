export type BarItem = { label: string; value: number; hint?: string };

/** Horizontal bars, each scaled against the biggest value in the list. */
export function BarList({
  items,
  format = String,
  emptyText = "Нет данных за выбранный период.",
}: {
  items: BarItem[];
  format?: (value: number) => string;
  emptyText?: string;
}) {
  if (items.length === 0) return <p className="text-sm text-muted-foreground">{emptyText}</p>;
  const max = Math.max(...items.map((i) => i.value), 0) || 1;

  return (
    <ul className="space-y-3">
      {items.map((item) => (
        <li key={item.label} className="space-y-1">
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate">{item.label}</span>
            <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">
              {item.hint ? `${item.hint} · ` : ""}
              {format(item.value)}
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted" aria-hidden>
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${(item.value / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
