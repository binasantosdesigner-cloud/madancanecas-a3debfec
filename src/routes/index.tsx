import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { ProductCard, type ProductCardData } from "@/components/site/ProductCard";
import { Button } from "@/components/ui/button";
import heroImg from "@/assets/hero-mug.jpg";
import corpImg from "@/assets/corporate-banner.jpg";
import catCanecas from "@/assets/cat-canecas.jpg";
import catCamisetas from "@/assets/cat-camisetas.jpg";
import catCopos from "@/assets/cat-copos.jpg";
import catCanetas from "@/assets/cat-canetas.jpg";

export const Route = createFileRoute("/")({ component: HomePage });

const cats = [
  { slug: "canecas", name: "Canecas", img: catCanecas },
  { slug: "camisetas", name: "Camisetas", img: catCamisetas },
  { slug: "copos", name: "Copos", img: catCopos },
  { slug: "canetas", name: "Canetas", img: catCanetas },
];

function HomePage() {
  const { data: ready } = useQuery({
    queryKey: ["products", "ready"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("kind", "ready").eq("active", true).limit(6);
      return (data ?? []) as ProductCardData[];
    },
  });
  const { data: custom } = useQuery({
    queryKey: ["products", "custom"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*").eq("kind", "custom").eq("active", true).limit(4);
      return (data ?? []) as ProductCardData[];
    },
  });

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* HERO */}
        <section className="px-6 pt-8">
          <div className="mx-auto max-w-7xl relative overflow-hidden rounded-3xl">
            <img src={heroImg} alt="" width={1920} height={1080} className="w-full aspect-[21/10] object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-brand-dark/60 via-brand-dark/30 to-transparent" />
            <div className="absolute inset-0 flex items-center px-8 md:px-16">
              <div className="max-w-xl animate-fade-up text-brand-cream">
                <span className="inline-flex items-center gap-2 text-[11px] uppercase tracking-[0.2em] text-brand-gold">
                  <Sparkles className="size-3" /> Coleção Madan
                </span>
                <h1 className="mt-4 font-serif text-5xl md:text-7xl leading-[0.95] text-balance">
                  Presentes com <em className="italic font-normal">alma</em> e história.
                </h1>
                <p className="mt-6 max-w-md text-pretty text-brand-cream/80">
                  Canecas, camisetas, copos e canetas personalizadas. Feitos à mão, do seu jeito.
                </p>
                <div className="mt-8 flex flex-wrap gap-3">
                  <Link to="/produtos" search={{ kind: "custom" } as any}>
                    <Button size="lg" className="rounded-full bg-brand-gold text-brand-dark hover:bg-brand-gold/90">
                      Crie seu Personalizado <ArrowRight className="ml-2 size-4" />
                    </Button>
                  </Link>
                  <Link to="/produtos">
                    <Button size="lg" variant="outline" className="rounded-full border-brand-cream/40 bg-transparent text-brand-cream hover:bg-brand-cream hover:text-brand-dark">
                      Ver Modelos Prontos
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CATEGORIES */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="mb-10 flex items-end justify-between">
            <div>
              <h2 className="font-serif text-3xl md:text-4xl">Categorias</h2>
              <p className="mt-2 text-sm text-muted-foreground">Explore nossa curadoria.</p>
            </div>
            <Link to="/produtos" className="text-xs uppercase tracking-widest border-b border-foreground/30 pb-1">Ver todos</Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
            {cats.map((c) => (
              <Link key={c.slug} to="/produtos" search={{ cat: c.slug } as any} className="group">
                <div className="overflow-hidden rounded-2xl bg-secondary aspect-square">
                  <img src={c.img} alt={c.name} loading="lazy" width={800} height={800} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
                </div>
                <h3 className="mt-3 text-sm font-medium">{c.name}</h3>
              </Link>
            ))}
          </div>
        </section>

        {/* READY PRODUCTS */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-10">Prontos para você</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {ready?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* CORPORATE BANNER */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl relative overflow-hidden rounded-3xl bg-brand-dark">
            <img src={corpImg} alt="" loading="lazy" width={1920} height={800} className="w-full h-[400px] object-cover opacity-60" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
              <span className="text-brand-gold text-[11px] uppercase tracking-[0.3em]">Presentes Corporativos</span>
              <h3 className="mt-4 font-serif text-4xl md:text-5xl text-brand-cream max-w-2xl text-balance">
                Sua marca em detalhes que <em className="italic font-normal">permanecem</em>.
              </h3>
              <p className="mt-4 max-w-lg text-brand-cream/80">
                Kits exclusivos para eventos, boas-vindas e brindes de alto impacto.
              </p>
              <Link to="/produtos" className="mt-8">
                <Button size="lg" className="rounded-full bg-brand-cream text-brand-dark hover:bg-brand-cream/90">
                  Solicitar Orçamento
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* CUSTOM PRODUCTS */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-10">Personalize do seu jeito</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {custom?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
