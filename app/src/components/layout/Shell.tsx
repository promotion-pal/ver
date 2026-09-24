import { LogOut } from "lucide-react";
import { Link, Outlet } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Button } from "@/components/ui/button";
import { clearSession } from "@/lib/auth";

export function Shell() {
  return (
    <div className="min-h-svh bg-background">
      <header className="border-b">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            Хаб ДВГМУ
          </Link>
          <div className="flex items-center gap-4">
            <Link to="/analytics" className="text-xs text-muted-foreground hover:text-foreground">
              Аналитика
            </Link>
            <Link to="/schemes" className="text-xs text-muted-foreground hover:text-foreground">
              Схемы
            </Link>
            <ModeToggle />
            <Button variant="ghost" size="icon-sm" aria-label="Выйти" title="Выйти" onClick={clearSession}>
              <LogOut />
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
