import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight, Sparkles, MessageCircle, Palette, CheckCircle2, Truck,
  PencilLine, Package, Bike, Star,
} from "lucide-react";
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

const WPP = (msg: string) => `https://wa.me/5566984266994?text=${encodeURIComponent(msg)}`;

const steps = [
  { n: "01", icon: MessageCircle, title: "Fale com a gente", text: "Mande uma mensagem no WhatsApp contando o que você precisa." },
  { n: "02", icon: Palette, title: "Receba a arte", text: "Nossa equipe cria um design exclusivo baseado no seu pedido." },
  { n: "03", icon: CheckCircle2, title: "Aprove e confirme", text: "Você aprova a arte antes de qualquer produção. Zero surpresas." },
  { n: "04", icon: Truck, title: "Receba em casa", text: "Entregamos pessoalmente em Rondonópolis-MT com embalagem especial." },
];

const testimonials = [
  { initial: "J", name: "Juliana M.", text: "Encomendei canecas para o Dia das Mães com foto da família. Ficaram lindas, embaladas com muito carinho. Super recomendo!" },
  { initial: "R", name: "Rafael T.", text: "Fiz camisetas personalizadas para o evento da empresa. Atendimento rápido, arte aprovada no mesmo dia. Perfeito!" },
  { initial: "C", name: "Camila S.", text: "Pedi uma garrafa com o logo da minha marca. Resultado impecável. A embalagem chegou melhor do que eu esperava." },
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
                  <a href={WPP("Olá, vim pelo site e quero pedir um produto personalizado!")} target="_blank" rel="noopener noreferrer">
                    <Button size="lg" variant="outline" className="rounded-full border-brand-cream/40 bg-transparent text-brand-cream hover:bg-brand-cream hover:text-brand-dark gap-2">
                      <MessageCircle className="size-4" /> Pedir pelo WhatsApp
                    </Button>
                  </a>
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

        {/* CTA STRIP — PERSONALIZADO */}
        <section className="px-6">
          <div className="mx-auto max-w-7xl rounded-3xl bg-brand-gold px-8 py-10 md:py-12 flex flex-col md:flex-row items-center justify-between gap-6 text-brand-dark">
            <div className="text-center md:text-left">
              <h3 className="font-serif text-2xl md:text-3xl">Não encontrou o que procura?</h3>
              <p className="mt-2 text-brand-dark/80 max-w-2xl">
                Fazemos qualquer personalização sob encomenda — arte própria, seu logo, sua frase. Fale com a gente pelo WhatsApp.
              </p>
            </div>
            <a href={WPP("Olá! Quero encomendar um produto personalizado com minha arte. Pode me ajudar?")} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full bg-brand-dark text-brand-cream hover:bg-brand-dark/90 gap-2 shrink-0">
                <MessageCircle className="size-4" /> Quero algo personalizado
              </Button>
            </a>
          </div>
        </section>

        {/* READY PRODUCTS */}
        <section className="mx-auto max-w-7xl px-6 py-12">
          <h2 className="font-serif text-3xl md:text-4xl mb-10">Prontos para você</h2>
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
            {ready?.map((p) => <ProductCard key={p.id} p={p} />)}
          </div>
        </section>

        {/* HOW IT WORKS */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="text-center mb-14">
            <h2 className="font-serif text-3xl md:text-4xl">Como funciona o pedido personalizado</h2>
            <p className="mt-3 text-muted-foreground">Simples, rápido e feito do seu jeito.</p>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((s) => (
              <div key={s.n} className="text-center">
                <span className="text-brand-gold text-xs font-bold tracking-widest">{s.n}</span>
                <div className="mx-auto mt-3 size-14 rounded-full bg-secondary flex items-center justify-center">
                  <s.icon className="size-6 text-brand-gold" />
                </div>
                <h3 className="mt-4 font-serif text-lg">{s.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{s.text}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <a href={WPP("Olá! Quero fazer um pedido personalizado. Como funciona?")} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="rounded-full bg-brand-gold text-brand-dark hover:bg-brand-gold/90 gap-2">
                <MessageCircle className="size-4" /> Começar meu pedido agora
              </Button>
            </a>
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
              <a href={WPP("Olá! Vim pelo site e quero solicitar um orçamento de brindes corporativos.")} target="_blank" rel="noopener noreferrer" className="mt-8">
                <Button size="lg" className="rounded-full bg-brand-cream text-brand-dark hover:bg-brand-cream/90">
                  Solicitar Orçamento
                </Button>
              </a>
              <p className="mt-4 text-xs text-brand-cream/60 tracking-wide">
                Atendemos empresas de todos os tamanhos · Desconto por volume · Arte exclusiva inclusa
              </p>
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

        {/* ANY ART STRIP */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-7xl rounded-3xl px-8 py-20 text-center" style={{ backgroundColor: "#1a1a1a" }}>
            <p className="text-brand-gold text-[11px] uppercase tracking-[0.3em]">Totalmente sob medida</p>
            <h2 className="mt-4 font-serif text-4xl md:text-5xl text-brand-cream max-w-3xl mx-auto text-balance">
              Trouxe sua arte? A gente coloca no <em className="italic font-normal">produto</em>.
            </h2>
            <p className="mt-5 text-brand-cream/70 max-w-2xl mx-auto">
              PNG, JPG, vetor, logo, foto — recebemos qualquer arquivo e aplicamos em canecas, camisetas, copos, garrafas e muito mais. Sem limite de criatividade.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-8 text-brand-cream/80 text-sm">
              <span className="flex items-center gap-2"><PencilLine className="size-4 text-brand-gold" /> Arte própria ou criada por nós</span>
              <span className="flex items-center gap-2"><Package className="size-4 text-brand-gold" /> Embalagem especial em todo pedido</span>
              <span className="flex items-center gap-2"><Bike className="size-4 text-brand-gold" /> Entrega em domicílio em Rondonópolis-MT</span>
            </div>
            <a href={WPP("Olá! Tenho uma arte pronta e quero aplicar em um produto. Como faço?")} target="_blank" rel="noopener noreferrer">
              <Button size="lg" className="mt-10 rounded-full bg-brand-gold text-brand-dark hover:bg-brand-gold/90 gap-2">
                <MessageCircle className="size-4" /> Enviar minha arte agora
              </Button>
            </a>
          </div>
        </section>

        {/* TESTIMONIALS */}
        <section className="mx-auto max-w-7xl px-6 py-20">
          <h2 className="font-serif text-3xl md:text-4xl text-center mb-12">O que nossos clientes dizem</h2>
          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((t) => (
              <div key={t.name} className="rounded-2xl bg-secondary/50 border border-border/40 p-6">
                <div className="flex items-center gap-3">
                  <div className="size-12 rounded-full bg-brand-gold text-brand-dark flex items-center justify-center font-serif text-xl font-bold">
                    {t.initial}
                  </div>
                  <div>
                    <p className="font-medium text-sm">{t.name}</p>
                    <div className="flex gap-0.5 mt-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className="size-3.5 text-brand-gold" fill="currentColor" />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="mt-4 text-sm text-muted-foreground italic">"{t.text}"</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
