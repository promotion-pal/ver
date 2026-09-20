import { Button } from "@/components/ui/button";
import { apiErrorMessage } from "@/lib/journal-api";

/** Loading / error placeholder for data fetched from the API. */
export function LoadState({
  loading,
  error,
  onRetry,
}: {
  loading: boolean;
  error: unknown;
  onRetry: () => void;
}) {
  if (error) {
    return (
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
        <span>Не удалось загрузить данные: {apiErrorMessage(error)}</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Повторить
        </Button>
      </div>
    );
  }
  if (loading) return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  return null;
}
