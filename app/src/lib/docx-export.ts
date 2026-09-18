import {
  BorderStyle,
  Document,
  ExternalHyperlink,
  HeadingLevel,
  ImageRun,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type ParagraphChild,
} from "docx";
import type { Block, SiteDoc, SiteStatus } from "@/data/types";

const STATUS_LABEL: Record<SiteStatus, string> = {
  live: "В работе",
  dev: "В разработке",
  planned: "Запланирован",
  archived: "В архиве",
};

const MUTED_COLOR = "595959";
const BORDER_COLOR = "D9D9D9";
const MAX_IMAGE_WIDTH = 560;

type DocElement = Paragraph | Table;

function cellBorder() {
  const side = { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR };
  return { top: side, bottom: side, left: side, right: side };
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], before = 240) {
  return new Paragraph({ text, heading: level, spacing: { before, after: 120 } });
}

function muted(text: string, after = 120) {
  return new Paragraph({ children: [new TextRun({ text, color: MUTED_COLOR })], spacing: { after } });
}

function bulleted(children: ParagraphChild[]) {
  return new Paragraph({ children, bullet: { level: 0 }, spacing: { after: 60 } });
}

/**
 * Loads a public image the same way the page itself does — a plain
 * `<img>` tag — then reads its pixels back out through a canvas. Using
 * `fetch()` here instead would ask the browser to treat the same URL as
 * a different kind of request, which some ad blockers, proxies and
 * privacy extensions allow for images but silently drop for fetch/XHR.
 */
async function loadImage(src: string): Promise<{ data: Uint8Array; width: number; height: number } | null> {
  const img = new Image();
  img.src = src;
  try {
    if (!(img.complete && img.naturalWidth > 0)) {
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("browser failed to load the <img>"));
      });
    }
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("2D canvas context unavailable");
    ctx.drawImage(img, 0, 0);
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
    if (!blob) throw new Error("canvas.toBlob returned null");
    const data = new Uint8Array(await blob.arrayBuffer());
    const scale = img.naturalWidth > MAX_IMAGE_WIDTH ? MAX_IMAGE_WIDTH / img.naturalWidth : 1;
    return { data, width: Math.round(img.naturalWidth * scale), height: Math.round(img.naturalHeight * scale) };
  } catch (err) {
    console.warn(`[docx-export] пропускаю изображение ${src}:`, err);
    return null;
  }
}

async function renderBlock(block: Block, failedImages: string[]): Promise<DocElement[]> {
  const out: DocElement[] = [];
  if (block.heading) out.push(heading(block.heading, HeadingLevel.HEADING_3));

  switch (block.type) {
    case "text": {
      out.push(new Paragraph({ children: [new TextRun(block.body)], spacing: { after: 160 } }));
      break;
    }

    case "stats": {
      const rows = block.items.map(
        (item) =>
          new TableRow({
            children: [
              new TableCell({
                width: { size: 60, type: WidthType.PERCENTAGE },
                borders: cellBorder(),
                children: [new Paragraph({ children: [new TextRun({ text: item.label, color: MUTED_COLOR })] })],
              }),
              new TableCell({
                width: { size: 40, type: WidthType.PERCENTAGE },
                borders: cellBorder(),
                children: [new Paragraph({ children: [new TextRun({ text: item.value, bold: true })] })],
              }),
            ],
          }),
      );
      out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows }));
      out.push(muted("", 160));
      break;
    }

    case "table": {
      const headerRow = new TableRow({
        tableHeader: true,
        children: block.columns.map(
          (col) =>
            new TableCell({
              borders: cellBorder(),
              shading: { type: ShadingType.CLEAR, fill: "F2F2F2" },
              children: [new Paragraph({ children: [new TextRun({ text: col, bold: true })] })],
            }),
        ),
      });
      const dataRows = block.rows.map(
        (row) =>
          new TableRow({
            children: row.map(
              (cell, j) =>
                new TableCell({
                  borders: cellBorder(),
                  children: [new Paragraph({ children: [new TextRun({ text: cell, bold: j === 0 })] })],
                }),
            ),
          }),
      );
      out.push(new Table({ width: { size: 100, type: WidthType.PERCENTAGE }, rows: [headerRow, ...dataRows] }));
      out.push(muted("", 160));
      break;
    }

    case "pages": {
      for (const page of block.items) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: page.name, bold: true }),
              new TextRun({ text: `  ${page.path}`, color: MUTED_COLOR }),
            ],
            spacing: { before: 160, after: 40 },
          }),
        );
        out.push(new Paragraph({ children: [new TextRun(page.purpose)], spacing: { after: 40 } }));
        for (const action of page.actions ?? []) out.push(bulleted([new TextRun(action)]));
      }
      break;
    }

    case "checklist": {
      for (const item of block.items) {
        out.push(
          new Paragraph({
            children: [
              new TextRun({ text: item.done ? "☑ " : "☐ " }),
              new TextRun({ text: item.label, strike: item.done }),
            ],
            spacing: { after: item.note ? 20 : 100 },
          }),
        );
        if (item.note) out.push(muted(item.note, 100));
      }
      break;
    }

    case "links": {
      for (const item of block.items) {
        const children: ParagraphChild[] = [
          new ExternalHyperlink({
            link: item.href,
            children: [new TextRun({ text: item.label, style: "Hyperlink" })],
          }),
        ];
        if (item.note) children.push(new TextRun({ text: `  ${item.note}`, color: MUTED_COLOR }));
        out.push(bulleted(children));
      }
      break;
    }

    case "questions": {
      block.items.forEach((item, i) => {
        out.push(
          new Paragraph({
            children: [new TextRun({ text: `${i + 1}. `, bold: true }), new TextRun(item.question)],
            spacing: { after: item.hint ? 20 : 100 },
          }),
        );
        if (item.hint) out.push(muted(item.hint, 100));
      });
      break;
    }

    case "gallery": {
      for (const item of block.items) {
        const image = await loadImage(item.src);
        if (image) {
          out.push(
            new Paragraph({
              children: [
                new ImageRun({
                  type: "png",
                  data: image.data,
                  transformation: { width: image.width, height: image.height },
                }),
              ],
              spacing: { before: 160, after: 40 },
            }),
          );
        } else {
          failedImages.push(item.src);
          out.push(
            new Paragraph({
              children: [new TextRun({ text: `[изображение недоступно: ${item.src}]`, italics: true, color: MUTED_COLOR })],
              spacing: { before: 160, after: 40 },
            }),
          );
        }
        out.push(
          new Paragraph({
            children: [new TextRun({ text: item.caption, bold: true })],
            spacing: { after: item.description ? 20 : 160 },
          }),
        );
        if (item.description) out.push(muted(item.description, 160));
      }
      break;
    }
  }

  return out;
}

/**
 * Builds a Word document from every version of a site's documentation —
 * same block components as the page, just rendered as OOXML — and
 * downloads it so the result can be sent as a report. Returns the
 * screenshot URLs that couldn't be embedded, if any, so the caller can
 * warn instead of the gap going unnoticed until someone opens the file.
 */
export async function exportSiteToDocx(site: SiteDoc): Promise<{ failedImages: string[] }> {
  const failedImages: string[] = [];
  const children: DocElement[] = [
    new Paragraph({ text: site.name, heading: HeadingLevel.TITLE }),
    muted(STATUS_LABEL[site.status], 160),
  ];

  if (site.description) {
    children.push(new Paragraph({ children: [new TextRun(site.description)], spacing: { after: 160 } }));
  }

  const meta = [site.url, site.repoPath, site.tags.join(" · ")].filter(Boolean).join("   ·   ");
  if (meta) children.push(muted(meta, 240));

  children.push(
    new Paragraph({
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: BORDER_COLOR } },
      spacing: { after: 240 },
    }),
  );

  for (const [i, version] of site.versions.entries()) {
    const isLatest = i === site.versions.length - 1;
    children.push(
      heading(`Версия: ${version.label}${isLatest ? " (текущая)" : ""}`, HeadingLevel.HEADING_1, i === 0 ? 0 : 480),
    );
    children.push(muted(version.date, 200));
    for (const block of version.blocks) children.push(...(await renderBlock(block, failedImages)));
  }

  const doc = new Document({
    sections: [{ children }],
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${site.slug}-dokumentaciya.docx`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);

  return { failedImages };
}
