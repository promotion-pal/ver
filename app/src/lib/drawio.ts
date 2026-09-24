const VIEWER_URL = "https://viewer.diagrams.net/js/viewer-static.min.js";

type DrawioViewer = {
  addListener: (event: string, listener: () => void) => void;
  graph?: {
    getSvg: (
      background: string | null,
      scale?: number,
      border?: number,
      nocrop?: boolean,
      crisp?: boolean | null,
      ignoreSelection?: boolean,
    ) => SVGSVGElement;
  };
};

declare global {
  interface Window {
    GraphViewer?: {
      createViewerForElement: (element: HTMLElement, callback?: (viewer: DrawioViewer) => void) => void;
    };
  }
}

let viewerPromise: Promise<void> | null = null;

/** Loads the official draw.io viewer once and shares it between all diagrams. */
export function loadDrawioViewer(): Promise<void> {
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

/** Mounts a draw.io viewer for `config` (the viewer's data-mxgraph options) into `container`. */
export async function mountDrawio(
  container: HTMLElement,
  config: Record<string, unknown>,
): Promise<DrawioViewer> {
  await loadDrawioViewer();
  const target = document.createElement("div");
  target.className = "mxgraph";
  target.style.maxWidth = "100%";
  target.dataset.mxgraph = JSON.stringify(config);
  container.replaceChildren(target);
  // The viewer defers drawing until its container is visible (non-zero
  // width) and fires "render" once `graph` exists.
  return new Promise((resolve) =>
    window.GraphViewer!.createViewerForElement(target, (viewer) => {
      if (viewer.graph) resolve(viewer);
      else viewer.addListener("render", () => resolve(viewer));
    }),
  );
}

/**
 * Renders the first page of a .drawio file to a PNG (white background) —
 * for embedding schemes into Word reports.
 */
export async function drawioToPng(
  xml: string,
  scale = 2,
): Promise<{ data: Uint8Array; width: number; height: number }> {
  const host = document.createElement("div");
  // Off-screen but laid out: the viewer won't draw into a zero-width box.
  host.style.cssText = "position:fixed;left:-10000px;top:0;width:2000px";
  document.body.appendChild(host);
  try {
    const viewer = await mountDrawio(host, { xml, toolbar: undefined, lightbox: false, nav: false });
    const svg = viewer.graph!.getSvg("#ffffff", scale, 10, false, null, true);
    const width = Number.parseFloat(svg.getAttribute("width") ?? "0");
    const height = Number.parseFloat(svg.getAttribute("height") ?? "0");
    if (!width || !height) throw new Error("empty diagram");

    // HTML labels are <foreignObject>s: loaded from a blob: URL they taint the
    // canvas, from a data: URL they don't (the way draw.io exports PNG itself).
    const img = new Image();
    img.src = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(new XMLSerializer().serializeToString(svg))}`;
    await img.decode();
    const canvas = document.createElement("canvas");
    canvas.width = Math.ceil(width);
    canvas.height = Math.ceil(height);
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("canvas.toBlob returned null");
    return { data: new Uint8Array(await blob.arrayBuffer()), width: width / scale, height: height / scale };
  } finally {
    host.remove();
  }
}
