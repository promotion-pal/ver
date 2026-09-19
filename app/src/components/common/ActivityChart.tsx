export type ActivityPoint = { label: string; value: number; title: string };

/** Column chart, one column per point; labels thin out when there are many. */
export function ActivityChart({ points }: { points: ActivityPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 0) || 1;
  const labelEvery = points.length <= 14 ? 1 : 5;

  return (
    <div className="flex h-36 items-stretch gap-1">
      {points.map((point, i) => (
        <div key={i} className="flex min-w-0 flex-1 flex-col items-center gap-1" title={point.title}>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-sm bg-primary/80"
              style={{ height: point.value > 0 ? `${Math.max((point.value / max) * 100, 4)}%` : "2px" }}
            />
          </div>
          <span className="h-3 font-mono text-[10px] leading-3 text-muted-foreground">
            {i % labelEvery === 0 ? point.label : ""}
          </span>
        </div>
      ))}
    </div>
  );
}
