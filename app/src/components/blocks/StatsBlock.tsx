import { StatTiles } from "@/components/common/StatTiles";
import type { Block } from "@/data/types";

export function StatsBlock({ block }: { block: Extract<Block, { type: "stats" }> }) {
  return <StatTiles items={block.items} />;
}
