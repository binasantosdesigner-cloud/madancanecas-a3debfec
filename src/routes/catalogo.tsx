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
    <div className="min-h-screen flex flex-col bg-brand-cream/30">
      <Header />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="bg-brand-pink text-brand-cream py-16 md:py-24">
          <div className="container mx-auto px-6 text-center max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-serif text-4xl md:text-6xl mb-6"
            >
              Nosso Catálogo
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl opacity-90 leading-relaxed font-light"
            >
              Explore nossa variedade de canecas, camisetas, copos e presentes personalizados 
              feitos com carinho para momentos especiais.
            </motion.p>
          </div>
        </section>

        {/* Catalog Content */}
        <div className="container mx-auto px-6 py-12">
          
          {/* Categories Filter */}
          <div className="flex flex-col gap-6 mb-12">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-[0.2em] text-muted-foreground/60 flex items-center gap-2">
                Filtrar por categoria
              </h2>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
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
              {categories.map((cat: any) => (
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

          {/* Products Grid */}
          <div className="min-h-[400px]">
            {loadingProducts || loadingCategories ? (
              <div className="flex flex-col items-center justify-center py-24 gap-4">
                <Loader2 className="size-8 animate-spin text-brand-gold" />
                <p className="text-muted-foreground animate-pulse font-light">Buscando mimos exclusivos...</p>
              </div>
            ) : filteredProducts.length > 0 ? (
              <motion.div 
                layout
                className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8"
              >
                <AnimatePresence mode="popLayout">
                  {filteredProducts.map((product: any) => (
                    <motion.div
                      layout
                      key={product.id}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ProductCard p={{
                        id: product.id,
                        title: product.title,
                        price: Number(product.price),
                        image_url: product.image_url,
                        slug: product.slug,
                        kind: product.kind || 'ready'
                      }} />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </motion.div>
            ) : (
              <div className="text-center py-24 bg-secondary/20 rounded-3xl border border-dashed border-border">
                <div className="size-16 bg-background rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                  <MessageCircle className="size-8 text-muted-foreground/40" />
                </div>
                <h3 className="text-xl font-medium mb-2">Nenhum produto encontrado</h3>
                <p className="text-muted-foreground mb-8 max-w-sm mx-auto">
                  Não encontrou o que procurava nesta categoria? Entre em contato e fazemos para você!
                </p>
                <Button 
                  onClick={() => handleCategoryClick("Todos")}
                  variant="outline"
                  className="rounded-full px-8"
                >
                  Ver todos os produtos
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Custom Order CTA */}
        <section className="container mx-auto px-6 py-20">
          <div className="bg-[#fcf8f1] rounded-[2rem] border border-[#f0e6c8] p-8 md:p-16 text-center max-w-5xl mx-auto overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-gold/5 rounded-full -mr-32 -mt-32" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-brand-pink/5 rounded-full -ml-32 -mb-32" />
            
            <div className="relative z-10">
              <span className="inline-block text-brand-gold font-bold uppercase tracking-[0.2em] text-[10px] mb-6 px-4 py-1.5 rounded-full bg-brand-gold/10">
                Encomendas Especiais
              </span>
              <h2 className="font-serif text-3xl md:text-4xl mb-6">Quer algo totalmente exclusivo?</h2>
              <p className="text-muted-foreground text-lg mb-10 max-w-2xl mx-auto font-light">
                Criamos projetos personalizados para empresas, eventos, casamentos ou presentes únicos. 
                Fale conosco agora e solicite um orçamento sem compromisso.
              </p>
              <Button 
                onClick={() => window.open('https://wa.me/5566984266994', '_blank')}
                size="lg"
                className="rounded-full bg-brand-pink text-brand-cream hover:bg-brand-pink/90 px-10 py-7 text-lg shadow-lg shadow-brand-pink/20 transition-all hover:scale-105"
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
