import type { ReactNode } from "react";

/** A titled analytics/report block: heading, optional hint, bordered body. */
export function Section({
  title,
  description,
  action,
  children,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="space-y-0.5">
          <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
          {description ? <p className="text-xs text-muted-foreground">{description}</p> : null}
        </div>
        {action}
      </div>
      <div className="space-y-4 rounded-lg border p-4">{children}</div>
    </section>
  );
}
