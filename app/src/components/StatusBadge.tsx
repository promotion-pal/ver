import { Badge } from "@/components/ui/badge";
import type { SiteStatus } from "@/data/types";

const LABEL: Record<SiteStatus, string> = {
  live: "В работе",
  dev: "В разработке",
  planned: "Запланирован",
  archived: "В архиве",
};

const DOT: Record<SiteStatus, string> = {
  live: "bg-emerald-500",
  dev: "bg-amber-500",
  planned: "bg-sky-500",
  archived: "bg-muted-foreground",
};

export function StatusBadge({ status }: { status: SiteStatus }) {
  return (
    <Badge variant="secondary" className="gap-1.5 font-normal">
      <span className={`size-1.5 rounded-full ${DOT[status]}`} />
      {LABEL[status]}
    </Badge>
  );
}
