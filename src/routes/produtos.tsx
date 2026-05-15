import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";

const search = z.object({ cat: z.string().optional(), kind: z.enum(["ready", "custom"]).optional() });

export const Route = createFileRoute("/produtos")({
  validateSearch: search,
  component: ProductsPage,
});

function ProductsPage() {
  const { cat, kind } = Route.useSearch();
  const { data: cats } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });
  const { data: products, isLoading } = useQuery({
    queryKey: ["products", cat, kind],
    queryFn: async () => {
      let q = supabase.from("products").select("*, categories(slug)").eq("active", true);
      if (kind) q = q.eq("kind", kind);
      const { data } = await q;
      let list = (data ?? []) as any[];
      if (cat) list = list.filter((p) => p.categories?.slug === cat);
      return list as ProductCardData[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-7xl px-6 py-12 w-full">
        <h1 className="font-serif text-4xl mb-2">{cat ? cats?.find(c => c.slug === cat)?.name : "Todos os Produtos"}</h1>
        <p className="text-muted-foreground text-sm mb-8">Encontre o presente perfeito.</p>

        <div className="flex flex-wrap gap-2 mb-10">
          <Link to="/produtos" className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border ${!cat && !kind ? "bg-foreground text-background" : "border-border"}`}>Todos</Link>
          {cats?.map((c) => (
            <Link key={c.id} to="/produtos" search={{ cat: c.slug } as any}
              className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border ${cat === c.slug ? "bg-foreground text-background" : "border-border"}`}>
              {c.name}
            </Link>
          ))}
          <Link to="/produtos" search={{ kind: "custom" } as any}
            className={`text-xs uppercase tracking-widest px-4 py-2 rounded-full border ${kind === "custom" ? "bg-accent text-accent-foreground" : "border-accent text-accent"}`}>
            Personalizáveis
          </Link>
        </div>

        {isLoading ? <p>Carregando...</p> : products?.length === 0 ? (
          <p className="text-muted-foreground">Nenhum produto encontrado.</p>
        ) : (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
