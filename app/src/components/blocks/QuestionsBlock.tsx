import type { Block } from "@/data/types";

export function QuestionsBlock({ block }: { block: Extract<Block, { type: "questions" }> }) {
  return (
    <ol className="space-y-4">
      {block.items.map((item, i) => (
        <li key={item.question} className="flex gap-3">
          <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-muted font-mono text-[11px] text-muted-foreground">
            {i + 1}
          </span>
          <div className="space-y-0.5">
            <p className="text-sm">{item.question}</p>
            {item.hint ? <p className="text-xs text-muted-foreground">{item.hint}</p> : null}
          </div>
        </li>
      ))}
    </ol>
  );
}
