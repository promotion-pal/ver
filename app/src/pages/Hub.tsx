import { useMemo, useState } from "react";
import { SiteCard } from "@/components/SiteCard";
import { Input } from "@/components/ui/input";
import { sites } from "@/data/sites";

export function Hub() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sites;
    return sites.filter((site) =>
      [site.name, site.description, ...site.tags].some((s) => s.toLowerCase().includes(q)),
    );
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">Сайты</h1>
        <p className="text-sm text-muted-foreground">
          {sites.length} {sites.length === 1 ? "сайт" : "сайта"} на сопровождении.
        </p>
      </div>

      <Input
        placeholder="Поиск по названию или тегу…"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="max-w-sm"
      />

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">Ничего не нашлось.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((site) => (
            <SiteCard key={site.slug} site={site} />
          ))}
        </div>
      )}
    </div>
  );
}
