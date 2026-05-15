import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

const links = [
  { to: "/produtos", label: "Todos" },
  { to: "/produtos", search: { cat: "canecas" }, label: "Canecas" },
  { to: "/produtos", search: { cat: "camisetas" }, label: "Camisetas" },
  { to: "/produtos", search: { cat: "copos" }, label: "Copos" },
  { to: "/produtos", search: { cat: "canetas" }, label: "Canetas" },
] as const;

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-tight">Madan</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Canecas & Personalizados</span>
          </Link>
          <nav className="hidden md:flex gap-6 text-sm">
            {links.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                search={"search" in l ? (l.search as any) : undefined}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          {isAdmin && (
            <Link to="/admin" className="hidden md:inline-flex text-xs uppercase tracking-widest text-accent hover:underline px-3">
              Admin
            </Link>
          )}
          <Link to={user ? "/conta" : "/login"} aria-label="Conta">
            <Button variant="ghost" size="icon">
              <User className="size-5" />
            </Button>
          </Link>
          <Link to="/carrinho" className="relative" aria-label="Carrinho">
            <Button variant="ghost" size="icon">
              <ShoppingBag className="size-5" />
            </Button>
            {count > 0 && (
              <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-accent text-[10px] font-bold text-accent-foreground">
                {count}
              </span>
            )}
          </Link>
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <Button variant="ghost" size="icon"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <nav className="mt-8 flex flex-col gap-4">
                {links.map((l, i) => (
                  <Link
                    key={i}
                    to={l.to}
                    search={"search" in l ? (l.search as any) : undefined}
                    className="text-base"
                  >
                    {l.label}
                  </Link>
                ))}
                {isAdmin && <Link to="/admin" className="text-accent">Admin</Link>}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
