import { Lock } from "lucide-react";
import { useState, type FormEvent } from "react";
import { FormField } from "@/components/common/FormField";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { login } from "@/lib/auth-api";
import { apiErrorMessage } from "@/lib/journal-api";

export function Login() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!password) return;
    setBusy(true);
    setError(null);
    try {
      await login(password);
    } catch (err) {
      setError(apiErrorMessage(err));
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-svh items-center justify-center bg-background px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5 rounded-xl border p-6">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-muted-foreground">
            <Lock className="size-4" />
            <span className="text-xs">Хаб ДВГМУ</span>
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Вход</h1>
          <p className="text-sm text-muted-foreground">Доступ по паролю.</p>
        </div>
        <FormField label="Пароль">
          <Input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </FormField>
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <Button type="submit" className="w-full" disabled={busy || !password}>
          {busy ? "Проверяем…" : "Войти"}
        </Button>
      </form>
    </div>
  );
}
