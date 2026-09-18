import type { Block } from "@/data/types";

export function PagesBlock({ block }: { block: Extract<Block, { type: "pages" }> }) {
  return (
    <div className="divide-y rounded-lg border">
      {block.items.map((page) => (
        <div key={page.path} className="grid gap-3 p-4 sm:grid-cols-[220px_1fr]">
          <div>
            <div className="text-sm font-medium">{page.name}</div>
            <code className="text-xs text-muted-foreground">{page.path}</code>
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{page.purpose}</p>
            {page.actions && page.actions.length > 0 ? (
              <ul className="space-y-1">
                {page.actions.map((action) => (
                  <li key={action} className="flex gap-2 text-sm">
                    <span className="mt-2 size-1 shrink-0 rounded-full bg-foreground/40" />
                    <span>{action}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}
