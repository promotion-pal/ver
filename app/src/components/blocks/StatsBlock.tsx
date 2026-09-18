import type { Block } from "@/data/types";

export function StatsBlock({ block }: { block: Extract<Block, { type: "stats" }> }) {
  return (
    <div className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border bg-border sm:grid-cols-4">
      {block.items.map((item) => (
        <div key={item.label} className="bg-card px-4 py-3">
          <div className="font-mono text-xl font-semibold tabular-nums">{item.value}</div>
          <div className="text-xs text-muted-foreground">{item.label}</div>
        </div>
      ))}
    </div>
  );
}
