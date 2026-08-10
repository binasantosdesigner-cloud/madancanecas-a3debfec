import { Link } from "@tanstack/react-router";
import { ShoppingBag, User, Menu, Instagram } from "lucide-react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export function Header() {
  const { count } = useCart();
  const { user } = useAuth();

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

  const staticLinks = [
    { to: "/produtos", label: "Todos" },
  ];

  const dynamicLinks = categories?.map((c) => ({
    to: "/produtos",
    search: { cat: c.slug },
    label: c.name,
  })) || [];

  const footerLinks = [
    { to: "/catalogo", label: "Catálogo" },
    { to: "/brindes-corporativos", label: "Corporativo" },
  ];

  const links = [...staticLinks, ...dynamicLinks, ...footerLinks];

  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-4 px-6">
        <div className="flex items-center gap-10">
          <Link to="/" className="flex flex-col leading-none">
            <span className="font-serif text-2xl tracking-tight">Madan</span>
            <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Canecas & Personalizados</span>
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
            className="hidden sm:inline-flex"
          >
            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
              <Instagram className="size-5" />
            </Button>
          </a>
          <Link to={user ? "/conta" : "/login"} aria-label="Conta">
            <Button variant="ghost" size="icon" className="text-accent hover:text-accent hover:bg-accent/10">
              <User className="size-5" />
            </Button>
          </Link>
          <Link to="/carrinho" className="relative" aria-label="Carrinho">
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
              <Button variant="ghost" size="icon"><Menu className="size-5" /></Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
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
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
