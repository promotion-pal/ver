import type { Block } from "@/data/types";

export function TextBlock({ block }: { block: Extract<Block, { type: "text" }> }) {
  return <p className="text-sm leading-relaxed text-muted-foreground">{block.body}</p>;
}
