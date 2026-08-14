import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, Instagram, LayoutDashboard } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { count } = useCart();
  const { user, isAdmin } = useAuth();

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      return data ?? [];
    },
  });

  const links = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/brindes-corporativos", label: "Corporativo" },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex items-center" aria-label="Madan Canecas & Personalizados">
            <img
              src="https://itfknwsdynturbwgaqnc.supabase.co/storage/v1/object/public/assets/Logo-colorida-MADAN.webp"
              alt="Madan Canecas & Personalizados"
              className="h-12 w-auto object-contain"
              loading="eager"
            />
          </Link>
          <nav className="hidden md:flex gap-7 text-sm">
            {links.map((l, i) => (
              <Link
                key={i}
                to={l.to}
                search={"search" in l ? (l.search as any) : undefined}
                className="nav-link text-foreground/75"
                activeProps={{ "data-active": "true" } as any}
              >
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="https://www.instagram.com/madancanecas/"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram @madancanecas"
            title="Instagram @madancanecas"
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
              <Instagram className="size-5" />
            </Button>
          </a>
          {isAdmin && (
            <Link to="/admin" aria-label="Painel Admin">
              <Button
                variant="ghost"
                size="sm"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-medium text-accent hover:text-accent hover:bg-accent/10 border border-accent/30 rounded-full px-3"
              >
                <LayoutDashboard className="size-3.5" />
                Admin
              </Button>
            </Link>
          )}
          <Link
            to={user ? "/conta" : "/login"}
            aria-label={user ? "Minha conta" : "Entrar / Criar conta"}
            title={user ? "Minha conta" : "Entrar / Criar conta"}
          >
            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
              <User className="size-5" />
            </Button>
          </Link>
          <Link
            to="/carrinho"
            className="relative"
            aria-label="Carrinho"
            title={count > 0 ? `Carrinho (${count} item${count !== 1 ? 's' : ''})` : "Carrinho"}
          >
            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
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
              <Button variant="ghost" size="icon" title="Menu"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetTitle className="sr-only">Menu de Navegação</SheetTitle>
              <nav className="mt-8 flex flex-col gap-4">
                {links.map((l, i) => (
                  <Link
                    key={i}
                    to={l.to}
                    search={"search" in l ? (l.search as any) : undefined}
                    className="text-base nav-link inline-block w-fit"
                    activeProps={{ "data-active": "true" } as any}
                  >
                    {l.label}
                  </Link>
                ))}
                {isAdmin && (
                  <Link
                    to="/admin"
                    className="text-base nav-link inline-flex items-center gap-2 w-fit text-accent font-medium"
                  >
                    <LayoutDashboard className="size-4" />
                    Painel Admin
                  </Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
