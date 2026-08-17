import { useMemo, useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Loader2, Heart, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useFavorites } from "@/lib/favorites";

const ITEMS_PER_PAGE = 20;

const PRICE_RANGES = [
  { label: "Todos os preços", min: 0, max: Infinity },
  { label: "Até R$ 20", min: 0, max: 20 },
  { label: "R$ 20 – R$ 50", min: 20, max: 50 },
  { label: "R$ 50 – R$ 100", min: 50, max: 100 },
  { label: "Acima de R$ 100", min: 100, max: Infinity },
];

const catalogoSearchSchema = z.object({
  categoria: z.string().optional(),
  pagina: z.number().optional(),
});

export const Route = createFileRoute("/catalogo")({
  validateSearch: catalogoSearchSchema,
  component: CatalogoPage,
});

function CatalogoPage() {
  const { categoria, pagina = 1 } = Route.useSearch();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { favorites, isFavorite } = useFavorites();

  const [priceRange, setPriceRange] = useState(0); // índice em PRICE_RANGES
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [activeSubSlug, setActiveSubSlug] = useState<string | undefined>(undefined);

  useEffect(() => { window.scrollTo(0, 0); }, [pagina, categoria]);
  useEffect(() => { setActiveSubSlug(undefined); }, [categoria]);

  // Categorias
  const { data: allCategories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("id, name, slug, parent_id, display_order")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const rootCategories = allCategories.filter((c: any) => !c.parent_id);
  const getSubcats = (parentId: string) =>
    allCategories.filter((c: any) => c.parent_id === parentId);



  // Produtos
  const { data: products = [], isLoading: loadingProducts } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("active", true)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Categoria ativa (slug ou "Todos")
  const activeCategory = categoria ?? "Todos";

  // Filtros aplicados
  const filteredProducts = useMemo(() => {
    let list = [...products];

    // Filtro por categoria (com subcategorias)
    if (activeCategory !== "Todos") {
      if (activeSubSlug) {
        const subCat = allCategories.find((c: any) => c.slug === activeSubSlug);
        if (subCat) {
          list = list.filter((p: any) => p.category_id === subCat.id);
        }
      } else {
        const parentCat = allCategories.find((c: any) => c.slug === activeCategory);
        if (parentCat) {
          const subIds = allCategories
            .filter((c: any) => c.parent_id === parentCat.id)
            .map((c: any) => c.id);
          const validIds = [parentCat.id, ...subIds];
          list = list.filter((p: any) => validIds.includes(p.category_id));
        }
      }
    }

    // Filtro por preço
    const range = PRICE_RANGES[priceRange];
    if (range.max !== Infinity || range.min > 0) {
      list = list.filter((p: any) => {
        const price = Number(p.price);
        return price >= range.min && price <= range.max;
      });
    }

    // Filtro de favoritos (só se logado)
    if (showFavoritesOnly && user) {
      list = list.filter((p: any) => isFavorite(p.id));
    }

    return list;
  }, [products, allCategories, activeCategory, activeSubSlug, priceRange, showFavoritesOnly, favorites, user]);

  // Paginação
  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / ITEMS_PER_PAGE));
  const currentPage = Math.min(pagina, totalPages);
  const paginatedProducts = filteredProducts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const goToPage = (page: number) => {
    navigate({ to: "/catalogo", search: { categoria, pagina: page } });
  };

  const handleCategoryClick = (catSlug: string | undefined) => {
    navigate({ to: "/catalogo", search: { categoria: catSlug, pagina: 1 } });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f0e6c8]/30">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-[#e8509a] text-white py-16 md:py-20">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <h1 className="font-serif text-4xl md:text-5xl mb-4">
              Nosso Catálogo
            </h1>
            <p className="text-lg opacity-90 leading-relaxed font-light max-w-2xl mx-auto">
              Explore canecas, camisetas, copos e presentes personalizados
              feitos com carinho para momentos especiais.
            </p>
          </div>
        </section>

        <div className="container mx-auto px-6 py-10">

          {/* FILTROS */}
          <div className="mb-8 space-y-4">

            {/* Linha 1: Categorias + botão de filtros avançados */}
            <div className="flex items-start justify-between gap-4">
              <div className="flex flex-col gap-2 flex-1 min-w-0">
                {/* Root category pills */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => { handleCategoryClick(undefined); setActiveSubSlug(undefined); }}
                    className={cn(
                      "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                      !categoria
                        ? "bg-[#e8509a] text-white border-[#e8509a]"
                        : "bg-transparent border-border text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a]"
                    )}
                  >
                    Todos
                  </button>
                  {rootCategories.map((cat: any) => (
                    <button
                      key={cat.id}
                      onClick={() => { handleCategoryClick(cat.slug); setActiveSubSlug(undefined); }}
                      className={cn(
                        "px-4 py-2 rounded-full text-sm font-medium transition-all border",
                        categoria === cat.slug
                          ? "bg-[#e8509a] text-white border-[#e8509a]"
                          : "bg-transparent border-border text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a]"
                      )}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>

                {/* Subcategory pills — only when a root with subcats is selected */}
                {categoria && (() => {
                  const parentCat = rootCategories.find((c: any) => c.slug === categoria);
                  if (!parentCat) return null;
                  const subcats = getSubcats(parentCat.id);
                  if (subcats.length === 0) return null;
                  return (
                    <div className="flex flex-wrap gap-2 pl-2 border-l-2 border-[#e8509a]/30">
                      <button
                        onClick={() => setActiveSubSlug(undefined)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                          !activeSubSlug
                            ? "bg-[#a57840] text-white border-[#a57840]"
                            : "bg-transparent border-border text-muted-foreground hover:border-[#a57840] hover:text-[#a57840]"
                        )}
                      >
                        Todas as {parentCat.name}
                      </button>
                      {subcats.map((sub: any) => (
                        <button
                          key={sub.id}
                          onClick={() => setActiveSubSlug(sub.slug)}
                          className={cn(
                            "px-3 py-1.5 rounded-full text-xs font-medium transition-all border",
                            activeSubSlug === sub.slug
                              ? "bg-[#a57840] text-white border-[#a57840]"
                              : "bg-transparent border-border text-muted-foreground hover:border-[#a57840] hover:text-[#a57840]"
                          )}
                        >
                          {sub.name}
                        </button>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Botão filtros avançados */}
              <button
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  "shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all",
                  showFilters
                    ? "bg-[#e8509a] text-white border-[#e8509a]"
                    : "bg-transparent border-border text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a]"
                )}
              >
                <SlidersHorizontal className="size-3.5" />
                Filtros
              </button>
            </div>

            {/* Linha 2: Filtros avançados (colapsável) */}
            {showFilters && (
              <div className="flex flex-wrap items-center gap-3 p-4 bg-white/60 rounded-2xl border border-border">

                {/* Filtro de preço */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground mr-1">
                    Preço:
                  </span>
                  {PRICE_RANGES.map((range, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setPriceRange(idx); goToPage(1); }}
                      className={cn(
                        "px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                        priceRange === idx
                          ? "bg-[#a57840] text-white border-[#a57840]"
                          : "bg-transparent border-border text-muted-foreground hover:border-[#a57840] hover:text-[#a57840]"
                      )}
                    >
                      {range.label}
                    </button>
                  ))}
                </div>

                {/* Divisor */}
                <div className="h-6 w-px bg-border mx-1 hidden sm:block" />

                {/* Filtro de favoritos */}
                {user ? (
                  <button
                    onClick={() => { setShowFavoritesOnly((v) => !v); goToPage(1); }}
                    className={cn(
                      "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium border transition-all",
                      showFavoritesOnly
                        ? "bg-[#fce8f3] text-[#e8509a] border-[#e8509a]"
                        : "bg-transparent border-border text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a]"
                    )}
                  >
                    <Heart className={cn("size-3.5", showFavoritesOnly && "fill-[#e8509a]")} />
                    Meus favoritos
                    {showFavoritesOnly && favorites.length > 0 && (
                      <span className="bg-[#e8509a] text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">
                        {favorites.length}
                      </span>
                    )}
                  </button>
                ) : (
                  <span className="text-xs text-muted-foreground italic">
                    Faça login para ver favoritos
                  </span>
                )}

                {/* Contador de resultados */}
                <span className="ml-auto text-xs text-muted-foreground">
                  {filteredProducts.length} produto{filteredProducts.length !== 1 ? "s" : ""}
                </span>
              </div>
            )}
          </div>

          {/* GRID DE PRODUTOS */}
          <div className="min-h-[400px]">
            {loadingProducts || loadingCategories ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="size-8 animate-spin text-[#a57840]" />
                <p className="text-muted-foreground animate-pulse font-light">
                  Buscando mimos exclusivos...
                </p>
              </div>
            ) : paginatedProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {paginatedProducts.map((product: any) => (
                  <ProductCard
                    key={product.id}
                    p={{
                      id: product.id,
                      title: product.title,
                      price: Number(product.price),
                      image_url: product.image_url,
                      slug: product.slug,
                      kind: product.kind || "ready",
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 bg-secondary/20 rounded-3xl border border-dashed border-border">
                <MessageCircle className="size-10 text-muted-foreground/30 mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground text-sm mb-6 max-w-xs mx-auto">
                  Tente outros filtros ou entre em contato — fazemos sob encomenda!
                </p>
                <Button
                  onClick={() => {
                    handleCategoryClick(undefined);
                    setPriceRange(0);
                    setShowFavoritesOnly(false);
                  }}
                  variant="outline"
                  className="rounded-full px-6"
                >
                  Limpar filtros
                </Button>
              </div>
            )}
          </div>

          {/* PAGINAÇÃO */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => goToPage(currentPage - 1)}
                disabled={currentPage === 1}
                className="size-9 flex items-center justify-center rounded-full border border-border disabled:opacity-40 hover:border-[#e8509a] hover:text-[#e8509a] transition-all"
                aria-label="Página anterior"
              >
                <ChevronLeft className="size-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter((page) => {
                  // Mostrar: primeira, última, atual e ±1 da atual
                  return (
                    page === 1 ||
                    page === totalPages ||
                    Math.abs(page - currentPage) <= 1
                  );
                })
                .reduce<(number | "...")[]>((acc, page, idx, arr) => {
                  if (idx > 0 && page - (arr[idx - 1] as number) > 1) {
                    acc.push("...");
                  }
                  acc.push(page);
                  return acc;
                }, [])
                .map((item, idx) =>
                  item === "..." ? (
                    <span key={`ellipsis-${idx}`} className="px-1 text-muted-foreground text-sm">
                      …
                    </span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => goToPage(item as number)}
                      className={cn(
                        "size-9 rounded-full text-sm font-medium border transition-all",
                        currentPage === item
                          ? "bg-[#e8509a] text-white border-[#e8509a]"
                          : "border-border text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a]"
                      )}
                    >
                      {item}
                    </button>
                  )
                )}

              <button
                onClick={() => goToPage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="size-9 flex items-center justify-center rounded-full border border-border disabled:opacity-40 hover:border-[#e8509a] hover:text-[#e8509a] transition-all"
                aria-label="Próxima página"
              >
                <ChevronRight className="size-4" />
              </button>

              <span className="ml-2 text-xs text-muted-foreground">
                Página {currentPage} de {totalPages}
              </span>
            </div>
          )}
        </div>

        {/* CTA ENCOMENDA EXCLUSIVA */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-[#fcf8f1] rounded-[2rem] border border-[#f0e6c8] p-8 md:p-16 text-center max-w-5xl mx-auto relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#a57840]/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#e8509a]/5 rounded-full -ml-32 -mb-32" />
            <div className="relative z-10">
              <span className="inline-block text-[#a57840] font-bold uppercase tracking-[0.2em] text-[10px] mb-6 px-4 py-1.5 rounded-full bg-[#a57840]/10">
                Encomendas Especiais
              </span>
              <h2 className="font-serif text-3xl md:text-4xl mb-6 text-foreground">
                Quer algo totalmente exclusivo?
              </h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto font-light">
                Criamos projetos personalizados para empresas, eventos, casamentos ou presentes únicos.
                Fale conosco e solicite um orçamento sem compromisso.
              </p>
              <Button
                onClick={() => window.open("https://wa.me/5566984266994", "_blank")}
                size="lg"
                className="rounded-full px-10 py-7 text-lg shadow-lg transition-all hover:scale-105"
                style={{ background: "#e8509a", color: "#fff" }}
              >
                <MessageCircle className="mr-2 size-5" />
                Chamar no WhatsApp
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
