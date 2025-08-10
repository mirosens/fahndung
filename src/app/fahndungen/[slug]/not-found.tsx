import Link from "next/link";
import { Search, Home } from "lucide-react";

export default function FahndungNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="mx-auto max-w-md px-4 text-center">
        <div className="mb-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
            <Search className="h-8 w-8 text-red-600 dark:text-red-400" />
          </div>
        </div>

        <h1 className="mb-4 text-2xl font-bold text-foreground">
          Fahndung nicht gefunden
        </h1>

        <p className="mb-8 text-muted-foreground">
          Die angeforderte Fahndung konnte nicht gefunden werden. Möglicherweise
          wurde sie gelöscht oder die URL ist nicht korrekt.
        </p>

        <div className="flex flex-col justify-center gap-4 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-border bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            <Home className="h-4 w-4" />
            Zur Startseite
          </Link>
        </div>
      </div>
    </div>
  );
}
