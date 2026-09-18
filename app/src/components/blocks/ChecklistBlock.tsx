import { Checkbox } from "@/components/ui/checkbox";
import type { Block } from "@/data/types";

export function ChecklistBlock({ block }: { block: Extract<Block, { type: "checklist" }> }) {
  return (
    <ul className="space-y-3">
      {block.items.map((item) => (
        <li key={item.label} className="flex items-start gap-3">
          <Checkbox checked={item.done} disabled className="mt-0.5" />
          <div className="space-y-0.5">
            <p className={item.done ? "text-sm text-muted-foreground line-through" : "text-sm"}>
              {item.label}
            </p>
            {item.note ? <p className="text-xs text-muted-foreground">{item.note}</p> : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
