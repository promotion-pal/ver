import { DrawioDiagram } from "@/components/common/DrawioDiagram";
import { SchemeStages } from "@/components/schemes/SchemeStages";
import type { Block } from "@/data/types";

export function SchemeBlock({
  block,
  siteSlug,
}: {
  block: Extract<Block, { type: "scheme" }>;
  siteSlug: string;
}) {
  return (
    <div className="space-y-4">
      <figure className="space-y-2">
        <DrawioDiagram xml={block.xml} />
        {block.caption ? (
          <figcaption className="text-sm text-muted-foreground">{block.caption}</figcaption>
        ) : null}
      </figure>
      <SchemeStages siteSlug={siteSlug} schemeId={block.id} />
    </div>
  );
}
