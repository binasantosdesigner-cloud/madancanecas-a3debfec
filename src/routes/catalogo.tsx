import { useMemo, useEffect } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MessageCircle, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { ProductCard } from "@/components/site/ProductCard";
import { supabase } from "@/integrations/supabase/client";

const catalogoSearchSchema = z.object({
  categoria: z.string().optional(),
});

export const Route = createFileRoute("/catalogo")({
  validateSearch: catalogoSearchSchema,
  component: CatalogoPage,
});

function CatalogoPage() {
  const { categoria } = Route.useSearch();
  const navigate = useNavigate();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const { data: categories = [], isLoading: loadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return data;
    },
  });

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

  const activeCategory = useMemo(() => {
    if (!categoria) return "Todos";
    const found = categories.find((c: any) => c.slug === categoria);
    return found ? found.name : "Todos";
  }, [categoria, categories]);

  const filteredProducts = useMemo(() => {
    if (activeCategory === "Todos") return products;
    return products.filter((p: any) => p.categories?.name === activeCategory);
  }, [activeCategory, products]);

  const handleCategoryClick = (catSlug: string) => {
    if (catSlug === "Todos") {
      navigate({ to: "/catalogo", search: { categoria: undefined } });
    } else {
      navigate({ to: "/catalogo", search: { categoria: catSlug } });
    }
  };

  const handleWhatsApp = (productName: string, price: number) => {
    const formattedPrice = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(price);
    const text = `Olá! Vi o catálogo do site e tenho interesse em:\n\n🛍️ Produto: ${productName}\n💰 Valor: ${formattedPrice}\n\nPode me contar mais sobre prazo, arte e formas de pagamento?`;
    window.open(`https://wa.me/5566984266994?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Header />
      <main className="flex-1 pb-20">
        <section className="px-6 py-12 text-center">
          <div className="mx-auto max-w-4xl">
            <h1 className="font-serif text-4xl md:text-5xl text-brand-dark mb-4">Catálogo de Produtos</h1>
            <p className="text-muted-foreground text-sm md:text-base max-w-2xl mx-auto">
              Escolha o produto, clique em "Quero esse" e a gente cuida do resto. Entrega em Rondonópolis-MT.
            </p>
          </div>
        </section>

        <section className="px-6 mb-12">
          <div className="mx-auto max-w-7xl">
            <div className="flex flex-nowrap md:flex-wrap overflow-x-auto pb-4 md:pb-0 gap-2 scrollbar-hide">
              <button
                onClick={() => handleCategoryClick("Todos")}
                className={cn(
                  "px-5 py-2.5 rounded-full text-sm font-medium transition-all border shrink-0",
                  activeCategory === "Todos"
                    ? "bg-brand-gold text-brand-cream border-brand-gold shadow-sm"
                    : "bg-transparent border-border text-muted-foreground hover:border-brand-gold hover:text-brand-gold"
                )}
              >
                Todos
              </button>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.slug)}
                  className={cn(
                    "px-5 py-2.5 rounded-full text-sm font-medium transition-all border shrink-0",
                    activeCategory === cat.name
                      ? "bg-brand-gold text-brand-cream border-brand-gold shadow-sm"
                      : "bg-transparent border-border text-muted-foreground hover:border-brand-gold hover:text-brand-gold"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="px-6 mb-8">
          <div className="mx-auto max-w-7xl">
            <div className="bg-secondary/40 rounded-xl p-4 flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8 text-[12px] text-muted-foreground border border-border/40">
              <span className="flex items-center gap-2">📍 Entrega em domicílio em Rondonópolis-MT</span>
              <span className="hidden md:inline text-border">•</span>
              <span className="flex items-center gap-2">🎨 Arte inclusa em todos os produtos</span>
              <span className="hidden md:inline text-border">•</span>
              <span className="flex items-center gap-2">✅ Você aprova antes de produzir</span>
            </div>
          </div>
        </section>

        <section className="px-6 mb-20">
          <div className="mx-auto max-w-7xl">
            {(loadingCategories || loadingProducts) ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="size-10 text-brand-gold animate-spin" />
                <p className="text-muted-foreground">Carregando catálogo...</p>
              </div>
            ) : (
              <motion.div 
                layout
                className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((p: any) => (
                    <motion.div
                      key={p.id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                      className="group bg-white rounded-2xl border border-border/40 overflow-hidden hover:shadow-xl transition-all duration-300 relative"
                    >
                      <Link to="/produto/$slug" params={{ slug: p.slug }} className="absolute inset-0 z-10" />
                      <div className="aspect-square bg-brand-cream/30 relative overflow-hidden">
                        <img 
                          src={p.image_url || `https://placehold.co/400x400/fce8f3/b03578?text=${encodeURIComponent(p.title)}`} 
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3">
                          <span className="px-3 py-1 bg-brand-gold/10 text-brand-gold text-[10px] font-bold uppercase tracking-wider rounded-full backdrop-blur-md">
                            {p.categories?.name?.split(' ')[0] || 'Geral'}
                          </span>
                        </div>
                      </div>
                      <div className="p-4 md:p-5">
                        <h3 className="font-serif text-base md:text-lg text-brand-dark mb-1 line-clamp-1">{p.title}</h3>
                        <div className="flex items-baseline gap-1 mb-3">
                          <span className="text-xs font-semibold text-brand-gold">R$</span>
                          <span className="text-xl font-bold text-brand-dark tracking-tight">
                            {new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2 }).format(p.price)}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground mb-4 flex items-center gap-1.5 uppercase tracking-wider font-semibold">
                          <span className="size-1 bg-brand-gold rounded-full" /> Arte inclusa · Aprovação prévia
                        </p>
                        <Button 
                          onClick={() => handleWhatsApp(p.title, p.price)}
                          className="w-full bg-brand-gold hover:bg-brand-gold/90 text-brand-cream rounded-full py-6 group-hover:shadow-lg transition-all gap-2 relative z-20"
                        >
                          <MessageCircle className="size-4" /> Quero esse
                        </Button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        </section>

        <section className="px-6">
          <div className="mx-auto max-w-7xl">
            <div className="bg-brand-gold rounded-3xl p-10 md:p-16 text-center text-brand-cream shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 -mr-20 -mt-20 size-80 bg-white/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 -ml-20 -mb-20 size-80 bg-black/10 rounded-full blur-3xl" />
              <div className="relative z-10">
                <h2 className="font-serif text-3xl md:text-4xl mb-4">Não achou o que procura?</h2>
                <p className="text-brand-cream/80 mb-8 max-w-2xl mx-auto text-sm md:text-base">
                  Personalizamos qualquer produto com a sua arte, seu logo ou sua frase. Fale com a gente e a gente resolve.
                </p>
                <a 
                  href="https://wa.me/5566984266994?text=Olá%21%20Não%20encontrei%20o%20produto%20que%20quero%20no%20catálogo.%20Pode%20me%20ajudar%3F" 
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <Button size="lg" className="bg-white text-brand-gold hover:bg-white/90 rounded-full px-10 py-7 text-lg font-bold gap-3">
                    <MessageCircle className="size-6" /> Conversar pelo WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
