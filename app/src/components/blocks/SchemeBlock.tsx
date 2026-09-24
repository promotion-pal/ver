import { DrawioDiagram } from "@/components/common/DrawioDiagram";
import type { Block } from "@/data/types";

export function SchemeBlock({ block }: { block: Extract<Block, { type: "scheme" }> }) {
  return (
    <figure className="space-y-2">
      <DrawioDiagram xml={block.xml} />
      {block.caption ? (
        <figcaption className="text-sm text-muted-foreground">{block.caption}</figcaption>
      ) : null}
    </figure>
  );
}
