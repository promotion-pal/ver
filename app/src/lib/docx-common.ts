import {
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  Table,
  TextRun,
  type ParagraphChild,
} from "docx";

export const MUTED_COLOR = "595959";
export const BORDER_COLOR = "D9D9D9";

export type DocElement = Paragraph | Table;

export function cellBorder() {
  const side = { style: BorderStyle.SINGLE, size: 2, color: BORDER_COLOR };
  return { top: side, bottom: side, left: side, right: side };
}

export function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  before = 240,
) {
  return new Paragraph({ text, heading: level, spacing: { before, after: 120 } });
}

export function muted(text: string, after = 120) {
  return new Paragraph({ children: [new TextRun({ text, color: MUTED_COLOR })], spacing: { after } });
}

export function bulleted(children: ParagraphChild[]) {
  return new Paragraph({ children, bullet: { level: 0 }, spacing: { after: 60 } });
}

/** Packs the elements into a .docx and triggers a browser download. */
export async function downloadDocx(children: DocElement[], filename: string): Promise<void> {
  const doc = new Document({
    sections: [{ children }],
    styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
