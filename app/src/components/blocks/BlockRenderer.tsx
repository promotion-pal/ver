import { ChecklistBlock } from "@/components/blocks/ChecklistBlock";
import { GalleryBlock } from "@/components/blocks/GalleryBlock";
import { LinksBlock } from "@/components/blocks/LinksBlock";
import { PagesBlock } from "@/components/blocks/PagesBlock";
import { QuestionsBlock } from "@/components/blocks/QuestionsBlock";
import { SchemeBlock } from "@/components/blocks/SchemeBlock";
import { StatsBlock } from "@/components/blocks/StatsBlock";
import { TableBlockView } from "@/components/blocks/TableBlockView";
import { TextBlock } from "@/components/blocks/TextBlock";
import type { Block } from "@/data/types";

export function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="space-y-8">
      {blocks.map((block, i) => (
        // eslint-disable-next-line react/no-array-index-key
        <section key={i} className="space-y-3">
          {block.heading ? (
            <h2 className="text-lg font-semibold tracking-tight">{block.heading}</h2>
          ) : null}
          {block.type === "text" ? <TextBlock block={block} /> : null}
          {block.type === "stats" ? <StatsBlock block={block} /> : null}
          {block.type === "gallery" ? <GalleryBlock block={block} /> : null}
          {block.type === "table" ? <TableBlockView block={block} /> : null}
          {block.type === "pages" ? <PagesBlock block={block} /> : null}
          {block.type === "checklist" ? <ChecklistBlock block={block} /> : null}
          {block.type === "links" ? <LinksBlock block={block} /> : null}
          {block.type === "questions" ? <QuestionsBlock block={block} /> : null}
          {block.type === "scheme" ? <SchemeBlock block={block} /> : null}
        </section>
      ))}
    </div>
  );
}
