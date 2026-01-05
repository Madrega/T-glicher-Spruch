import { Link, useLocation } from "wouter";
import { Rss, LayoutDashboard, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center">
              <Rss className="h-5 w-5" />
            </div>
            <Link href="/" className="font-display font-semibold text-xl tracking-tight hover:opacity-80 transition-opacity">
              DailyRSS
            </Link>
          </div>

          <nav className="flex items-center gap-6">
            <Link 
              href="/" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Home
            </Link>
            <Link 
              href="/admin" 
              className={`text-sm font-medium transition-colors hover:text-primary ${
                location === "/admin" ? "text-primary" : "text-muted-foreground"
              }`}
            >
              Dashboard
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild className="hidden sm:flex gap-2">
              <a href="/feed" target="_blank" rel="noopener noreferrer">
                <Rss className="h-4 w-4" />
                View XML
              </a>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>

      <footer className="border-t py-6 md:py-0">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            Built with React & Flask.
          </p>
        </div>
      </footer>
    </div>
  );
}
