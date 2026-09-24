import { useEffect, useRef, useState } from "react";
import { mountDrawio } from "@/lib/drawio";

/**
 * Renders a .drawio diagram with the draw.io viewer (zoom, pages, lightbox).
 * Pass the file contents via `xml` (e.g. `import xml from "./scheme.drawio?raw"`)
 * or a same-origin URL via `src`.
 */
export function DrawioDiagram({
  xml,
  src,
  page = 0,
  toolbar = "zoom layers pages lightbox",
  lightbox = true,
  className,
}: {
  xml?: string;
  src?: string;
  /** Page index to show first for multi-page files. */
  page?: number;
  /** Space-separated toolbar buttons: zoom, layers, pages, tags, lightbox; "" hides it. */
  toolbar?: string;
  /** Open the full-screen viewer on click. */
  lightbox?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let cancelled = false;
    setError(null);
    setLoading(true);

    (async () => {
      const content = xml ?? (src ? await fetch(src).then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      }) : null);
      if (content == null) throw new Error("no diagram: pass xml or src");
      if (cancelled) return;
      await mountDrawio(element, {
        xml: content,
        page,
        toolbar: toolbar || undefined,
        lightbox,
        nav: true,
        resize: true,
        "auto-fit": true,
        highlight: "#0000ff",
      });
      if (cancelled) element.replaceChildren();
      else setLoading(false);
    })().catch((e: unknown) => {
      if (cancelled) return;
      setError(e instanceof Error ? e.message : String(e));
      setLoading(false);
    });

    return () => {
      cancelled = true;
      element.replaceChildren();
    };
  }, [xml, src, page, toolbar, lightbox]);

  return (
    <div className={className}>
      {/* Diagrams are drawn for a light page, so keep them on white in dark mode too. */}
      <div ref={ref} className="overflow-x-auto rounded-lg border bg-white p-2" />
      {loading ? <p className="text-sm text-muted-foreground">Загрузка схемы…</p> : null}
      {error ? (
        <p className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Не удалось показать схему: {error}
        </p>
      ) : null}
    </div>
  );
}
