export type SiteStatus = "live" | "dev" | "planned" | "archived";

/** Every block may carry a section heading — rendered the same way
 * regardless of block type, so sections stay visually distinct. */
type BlockBase = { heading?: string };

export type Block =
  | (BlockBase & { type: "text"; body: string })
  | (BlockBase & { type: "stats"; items: { label: string; value: string }[] })
  | (BlockBase & {
      type: "gallery";
      items: { src: string; caption: string; description?: string }[];
    })
  | (BlockBase & { type: "table"; columns: string[]; rows: string[][] })
  | (BlockBase & {
      /**
       * A site's pages/routes with what a visitor can actually do on
       * each one — the generic "what does this page do" block, usable
       * for any site's docs, not just this one's.
       */
      type: "pages";
      items: {
        name: string;
        path: string;
        purpose: string;
        /** Concrete interactions available on the page, if documented. */
        actions?: string[];
      }[];
    })
  | (BlockBase & {
      type: "checklist";
      items: { label: string; note?: string; done: boolean }[];
    })
  | (BlockBase & { type: "links"; items: { label: string; href: string; note?: string }[] })
  | (BlockBase & {
      /**
       * Open feedback questions for the customer/stakeholder to
       * answer offline — display-only for now, no submission or
       * storage (that's a later, backend-backed step).
       */
      type: "questions";
      items: { question: string; hint?: string }[];
    })
  | (BlockBase & {
      /**
       * A draw.io diagram. Keep the file in `src/docs/schema/` and pass its
       * contents: `import scheme from "@/docs/schema/name.drawio?raw"`.
       */
      type: "scheme";
      xml: string;
      caption?: string;
    });

/**
 * One dated snapshot of a site's documentation — its own blocks, so
 * you can flip between versions and see how the pages evolved.
 */
export type SiteVersion = {
  /** Short id, e.g. an ISO date or "v1". Shown in the version switcher. */
  id: string;
  /** ISO date this snapshot was taken/written. */
  date: string;
  /** Short human label, e.g. "Запуск сайта", "Добавлена запись на приём". */
  label: string;
  blocks: Block[];
};

export type SiteDoc = {
  /** URL-safe id, also the route segment: /sites/:slug */
  slug: string;
  name: string;
  description: string;
  status: SiteStatus;
  /** Public or internal URL of the site itself, if it has one. */
  url?: string;
  /** Path to the source in the monorepo, for reference only. */
  repoPath?: string;
  tags: string[];
  /** Oldest first. The last entry is the current version. */
  versions: SiteVersion[];
};
