import { useCallback, useEffect, useRef, useState } from "react";

/**
 * Runs `load` on mount and whenever `deps` change; the latest call wins,
 * so a slow earlier request can never overwrite a newer result.
 * `reload()` refetches with the same inputs, e.g. after a save.
 */
export function useAsync<T>(load: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | undefined>();
  const [error, setError] = useState<unknown>();
  const [loading, setLoading] = useState(true);
  const [version, setVersion] = useState(0);
  const latest = useRef(0);
  const loadRef = useRef(load);
  loadRef.current = load;

  useEffect(() => {
    const call = ++latest.current;
    setLoading(true);
    loadRef.current().then(
      (result) => {
        if (call !== latest.current) return;
        setData(result);
        setError(undefined);
        setLoading(false);
      },
      (err: unknown) => {
        if (call !== latest.current) return;
        setError(err);
        setLoading(false);
      },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { data, error, loading, reload };
}
