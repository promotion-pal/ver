import { ArrowLeft, ArrowUpRight, History } from "lucide-react";
import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { ExportButton } from "@/components/common/ExportButton";
import { BlockRenderer } from "@/components/blocks/BlockRenderer";
import { FeedbackSection } from "@/components/feedback/FeedbackSection";
import { StatusBadge } from "@/components/StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSite } from "@/data/sites";

export function SiteDetail() {
  const { slug } = useParams<{ slug: string }>();
  const site = slug ? getSite(slug) : undefined;

  const versionsNewestFirst = useMemo(
    () => (site ? [...site.versions].reverse() : []),
    [site],
  );
  const [versionId, setVersionId] = useState<string | undefined>(versionsNewestFirst[0]?.id);

  if (!site) return <Navigate to="/" replace />;

  const selected =
    versionsNewestFirst.find((v) => v.id === versionId) ?? versionsNewestFirst[0];
  const isLatest = selected.id === versionsNewestFirst[0]?.id;

  async function exportToWord() {
    if (!site) return;
    const { exportSiteToDocx } = await import("@/lib/docx-export");
    const { failedImages } = await exportSiteToDocx(site);
    if (failedImages.length > 0) {
      return `Документ сформирован, но ${failedImages.length} скриншот(ов) не удалось загрузить и вставить — проверьте консоль браузера для подробностей.`;
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-3.5" />
          Все проекты
        </Link>
        <ExportButton label="Экспорт в Word" onExport={exportToWord} />
      </div>

      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-2xl font-semibold tracking-tight">{site.name}</h1>
          <StatusBadge status={site.status} />
        </div>
        <p className="max-w-2xl text-sm text-muted-foreground">{site.description}</p>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
          {site.url ? (
            <a
              href={site.url}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 hover:text-foreground"
            >
              {site.url.replace(/^https?:\/\//, "")}
              <ArrowUpRight className="size-3" />
            </a>
          ) : null}
          {site.repoPath ? <code className="font-mono">{site.repoPath}</code> : null}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {site.tags.map((tag) => (
            <Badge key={tag} variant="outline" className="font-normal text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      </div>

      <Separator />

      <div className="space-y-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <History className="size-4" />
          История версий
        </div>
        <Tabs value={selected.id} onValueChange={setVersionId}>
          <TabsList>
            {versionsNewestFirst.map((v) => (
              <TabsTrigger key={v.id} value={v.id} className="flex-col items-start gap-0.5 py-1.5">
                <span>{v.label}</span>
                <span className="font-mono text-[11px] text-muted-foreground">{v.date}</span>
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
        {!isLatest ? (
          <p className="rounded-md border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
            Вы смотрите более раннюю версию документации от {selected.date}. Актуальная —{" "}
            {versionsNewestFirst[0]?.date}.
          </p>
        ) : null}
      </div>

      <BlockRenderer blocks={selected.blocks} siteSlug={site.slug} />

      <FeedbackSection site={site} version={selected} />
    </div>
  );
}
