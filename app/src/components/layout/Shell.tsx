import { Link, Outlet } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";

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
            <ModeToggle />
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
}
