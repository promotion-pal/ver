import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { useToken } from "@/lib/auth";
import { checkSession } from "@/lib/auth-api";
import { apiErrorMessage } from "@/lib/journal-api";
import { Login } from "@/pages/Login";

/**
 * Shows the app only for a session the server has accepted. A stored token
 * is validated once per token; a rejected one is dropped by the API layer,
 * which brings the login screen back.
 */
export function AuthGate({ children }: { children: ReactNode }) {
  const token = useToken();
  const [verifiedToken, setVerifiedToken] = useState<string | null>(null);
  const [failure, setFailure] = useState<{ token: string; message: string } | null>(null);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    checkSession().then(
      () => !cancelled && setVerifiedToken(token),
      (err: unknown) => !cancelled && setFailure({ token, message: apiErrorMessage(err) }),
    );
    return () => {
      cancelled = true;
    };
  }, [token, attempt]);

  if (!token) return <Login />;
  if (verifiedToken === token) return <>{children}</>;

  const error = failure?.token === token ? failure.message : null;

  return (
    <div className="flex min-h-svh flex-col items-center justify-center gap-3 px-6 text-sm text-muted-foreground">
      {error ? (
        <>
          <p>Не удалось проверить доступ: {error}</p>
          <Button variant="outline" size="sm" onClick={() => {
              setFailure(null);
              setAttempt((a) => a + 1);
            }}>
            Повторить
          </Button>
        </>
      ) : (
        <p>Проверяем доступ…</p>
      )}
    </div>
  );
}
