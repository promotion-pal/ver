import { AlertTriangle, FileDown, Loader2 } from "lucide-react";
import { useState, type ComponentProps } from "react";
import { Button } from "@/components/ui/button";

/**
 * Button for any "build a document and download it" action. `onExport`
 * may return a warning (e.g. "2 images skipped") shown under the button;
 * a thrown error is logged and shown as a failure message.
 */
export function ExportButton({
  label,
  busyLabel = "Формируем документ…",
  onExport,
  disabled,
  variant = "outline",
  size = "sm",
}: {
  label: string;
  busyLabel?: string;
  onExport: () => Promise<string | void>;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
}) {
  const [busy, setBusy] = useState(false);
  const [warning, setWarning] = useState<string | null>(null);

  async function handleClick() {
    if (busy) return;
    setBusy(true);
    setWarning(null);
    try {
      const result = await onExport();
      if (result) setWarning(result);
    } catch (error) {
      console.error("Не удалось сформировать Word-документ", error);
      setWarning("Не удалось сформировать документ — подробности в консоли браузера.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      <Button variant={variant} size={size} onClick={handleClick} disabled={disabled || busy}>
        {busy ? <Loader2 className="animate-spin" /> : <FileDown />}
        {busy ? busyLabel : label}
      </Button>
      {warning ? (
        <p className="flex max-w-sm items-start gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-700 dark:text-amber-400">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" />
          {warning}
        </p>
      ) : null}
    </div>
  );
}
