import { useEffect, useRef, useState } from "react";

const VIEWER_URL = "https://viewer.diagrams.net/js/viewer-static.min.js";

declare global {
  interface Window {
    GraphViewer?: {
      createViewerForElement: (element: HTMLElement, callback?: (viewer: unknown) => void) => void;
    };
  }
}

let viewerPromise: Promise<void> | null = null;

/** Loads the official draw.io viewer once and shares it between all diagrams. */
function loadViewer(): Promise<void> {
  if (window.GraphViewer) return Promise.resolve();
  viewerPromise ??= new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = VIEWER_URL;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      viewerPromise = null;
      script.remove();
      reject(new Error("draw.io viewer failed to load"));
    };
    document.head.appendChild(script);
  });
  return viewerPromise;
}

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
      await loadViewer();
      if (cancelled) return;

      const target = document.createElement("div");
      target.className = "mxgraph";
      target.style.maxWidth = "100%";
      target.dataset.mxgraph = JSON.stringify({
        xml: content,
        page,
        toolbar: toolbar || undefined,
        lightbox,
        nav: true,
        resize: true,
        "auto-fit": true,
        highlight: "#0000ff",
      });
      element.replaceChildren(target);
      window.GraphViewer!.createViewerForElement(target);
      setLoading(false);
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
