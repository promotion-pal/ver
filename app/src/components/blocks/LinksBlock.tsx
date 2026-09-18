import { ArrowUpRight } from "lucide-react";
import type { Block } from "@/data/types";

export function LinksBlock({ block }: { block: Extract<Block, { type: "links" }> }) {
  return (
    <ul className="divide-y rounded-lg border">
      {block.items.map((item) => (
        <li key={item.href}>
          <a
            href={item.href}
            target="_blank"
            rel="noreferrer"
            className="flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-accent"
          >
            <span>
              <span className="font-medium">{item.label}</span>
              {item.note ? (
                <span className="ml-2 text-xs text-muted-foreground">{item.note}</span>
              ) : null}
            </span>
            <ArrowUpRight className="size-4 shrink-0 text-muted-foreground" />
          </a>
        </li>
      ))}
    </ul>
  );
}
