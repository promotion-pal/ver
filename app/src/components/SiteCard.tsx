import { Link } from "react-router-dom";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { latestVersion } from "@/data/sites";
import type { SiteDoc } from "@/data/types";

export function SiteCard({ site }: { site: SiteDoc }) {
  const current = latestVersion(site);

  return (
    <Link to={`/sites/${site.slug}`} className="block">
      <Card className="h-full gap-3 transition-colors hover:border-foreground/20">
        <CardHeader className="flex flex-row items-start justify-between gap-2">
          <h3 className="text-base font-semibold tracking-tight">{site.name}</h3>
          <StatusBadge status={site.status} />
        </CardHeader>
        <CardContent className="flex flex-1 flex-col gap-3">
          <p className="text-sm text-muted-foreground">{site.description}</p>
          <div className="flex flex-wrap gap-1.5">
            {site.tags.map((tag) => (
              <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
                {tag}
              </Badge>
            ))}
          </div>
          <p className="mt-auto pt-1 text-xs text-muted-foreground">
            {site.versions.length} {site.versions.length === 1 ? "версия" : "версии"} ·
            обновлено {current.date}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}
