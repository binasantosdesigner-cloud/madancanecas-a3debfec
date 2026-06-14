import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageShell } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Package, Coffee, Wine, Shirt, Gift, Star, Handshake,
  Palette, Eye, Box, Truck, MessageCircle, ArrowRight, ArrowLeft, Check,
} from "lucide-react";

export const Route = createFileRoute("/brindes-corporativos")({
  head: () => ({
    meta: [
      { title: "Brindes Corporativos — Madan Canecas & Personalizados" },
      { name: "description", content: "Kits exclusivos para fim de ano, eventos e boas-vindas. Arte personalizada com a identidade da sua empresa, embalagem premium e entrega em Rondonópolis-MT." },
      { property: "og:title", content: "Brindes Corporativos — Madan" },
      { property: "og:description", content: "Kits corporativos premium personalizados com a identidade da sua empresa." },
    ],
  }),
  component: BrindesCorporativosPage,
});

const WHATSAPP_NUMBER = "5566984266994";
const GOLD = "#c18f4a";
const DARK = "#1a1a1a";

const scrollToForm = () => {
  document.getElementById("orcamento")?.scrollIntoView({ behavior: "smooth", block: "start" });
};

const productCards = [
  { badge: "Mais pedido", title: "Caneca personalizada com logo", desc: "Caneca de porcelana ou magic com impressão da sua marca em alta definição.", icon: Coffee },
  { badge: "Premium", title: "Garrafa térmica com gravação", desc: "Garrafa inox 500ml com logo gravada a laser. Durabilidade e sofisticação.", icon: Package },
  { badge: "Fim de ano", title: "Taça personalizada", desc: "Taça de vidro com nome do colaborador ou logo da empresa. Elegante e afetiva.", icon: Wine },
  { badge: "Uniforme", title: "Camiseta corporativa", desc: "Camiseta com estampa personalizada para eventos, times e uniformes empresariais.", icon: Shirt },
];

const kits = [
  {
    icon: Gift, title: "Kit Boas-Vindas",
    desc: "Para receber novos colaboradores com identidade e carinho.",
    items: ["Caneca com nome e logo", "Camiseta personalizada", "Embalagem kraft premium", "Tag com mensagem"],
    featured: false,
  },
  {
    icon: Star, title: "Kit Fim de Ano Premium",
    desc: "O presente certo para encerrar o ano com quem importa para a empresa.",
    items: ["Taça com nome gravado", "Garrafa térmica com logo", "Caneca magic personalizada", "Caixa premium fechada com laço"],
    featured: true,
  },
  {
    icon: Handshake, title: "Kit Cliente VIP",
    desc: "Para presentear clientes e fornecedores estratégicos com sofisticação.",
    items: ["Garrafa inox gravada", "Caneca de porcelana", "Embalagem personalizada", "Cartão com mensagem da empresa"],
    featured: false,
  },
];

const differentials = [
  { icon: Palette, title: "Arte exclusiva", desc: "Cada peça é criada com base na identidade visual da sua empresa." },
  { icon: Eye, title: "Prévia antes de produzir", desc: "Você aprova o design antes de qualquer produção. Zero surpresas." },
  { icon: Box, title: "Embalagem premium", desc: "Cada kit sai com embalagem cuidada que valoriza a apresentação." },
  { icon: Truck, title: "Entrega pessoal", desc: "Entrega em domicílio em Rondonópolis-MT sem estresse logístico." },
];

const productOptions = [
  "Canecas personalizadas", "Garrafas térmicas", "Taças personalizadas",
  "Camisetas corporativas", "Kit corporativo completo", "Não sei ainda, quero orientação",
];
const quantityOptions = ["Até 20 unidades", "De 21 a 50 unidades", "De 51 a 100 unidades", "Mais de 100 unidades"];
const purposeOptions = [
  "Presentes de fim de ano", "Boas-vindas a colaboradores",
  "Presentes para clientes e fornecedores", "Evento corporativo",
  "Uso interno da equipe", "Outra finalidade",
];

function BrindesCorporativosPage() {
  return (
    <PageShell>
      {/* HERO */}
      <section
        className="relative overflow-hidden"
        style={{ backgroundColor: DARK }}
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{ background: `radial-gradient(ellipse at top, ${GOLD}33, transparent 60%)` }}
        />
        <div className="relative mx-auto max-w-5xl px-6 py-28 md:py-36 text-center">
          <span
            className="inline-block rounded-full border px-4 py-1.5 text-[11px] uppercase tracking-[0.25em] mb-8"
            style={{ borderColor: `${GOLD}66`, color: GOLD }}
          >
            Brindes Corporativos
          </span>
          <h1 className="font-serif text-4xl md:text-6xl tracking-tight text-white text-balance">
            Sua marca em detalhes que <em className="italic font-normal" style={{ color: GOLD }}>permanecem</em>.
          </h1>
          <p className="mt-6 max-w-2xl mx-auto text-lg text-white/60">
            Kits exclusivos para fim de ano, eventos e boas-vindas. Arte personalizada com a identidade da sua empresa, embalagem premium e entrega em mãos em Rondonópolis-MT.
          </p>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="mt-10 gap-2 text-base font-semibold"
            style={{ backgroundColor: GOLD, color: DARK }}
          >
            <Package className="size-5" />
            Solicitar orçamento
          </Button>
        </div>
      </section>

      {/* PRODUTOS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Catálogo</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Produtos mais pedidos</h2>
          <p className="mt-3 text-muted-foreground">Personalizados com a logo e identidade visual da sua empresa.</p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {productCards.map((p) => (
            <div key={p.title} className="group rounded-xl border border-border/60 bg-card overflow-hidden transition-all hover:shadow-[var(--shadow-elegant)] hover:-translate-y-1" style={{ ["--hover-border" as any]: GOLD }}>
              <div className="aspect-[4/3] flex items-center justify-center bg-secondary/60">
                <p.icon className="size-14 text-muted-foreground/60 transition-colors group-hover:text-[color:var(--hover-border)]" />
              </div>
              <div className="p-5">
                <span className="inline-block text-[10px] uppercase tracking-widest px-2 py-1 rounded-full border" style={{ borderColor: `${GOLD}80`, color: GOLD }}>{p.badge}</span>
                <h3 className="font-serif text-lg mt-3">{p.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{p.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER 1 */}
      <CTABanner
        title="Precisa de um produto fora do catálogo?"
        subtitle="Trabalhamos com personalização sob demanda. Conte o que precisa e encontramos a solução certa."
        cta="Consultar disponibilidade"
      />

      {/* KITS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Kits prontos</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Kits corporativos de destaque</h2>
          <p className="mt-3 text-muted-foreground">Combinações pensadas para impressionar clientes, fornecedores e colaboradores.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          {kits.map((k) => (
            <div
              key={k.title}
              className="relative rounded-xl bg-card p-8 border transition-all hover:-translate-y-1"
              style={{
                borderColor: k.featured ? GOLD : undefined,
                borderWidth: k.featured ? 2 : 1,
                boxShadow: k.featured ? `0 20px 60px -20px ${GOLD}55` : undefined,
              }}
            >
              {k.featured && (
                <span
                  className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full font-semibold"
                  style={{ backgroundColor: GOLD, color: DARK }}
                >
                  Mais vendido
                </span>
              )}
              <k.icon className="size-8" style={{ color: GOLD }} />
              <h3 className="font-serif text-2xl mt-4">{k.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{k.desc}</p>
              <ul className="mt-6 space-y-2.5 text-sm border-t border-border/60 pt-5">
                {k.items.map((i) => (
                  <li key={i} className="flex items-start gap-2">
                    <Check className="size-4 mt-0.5 shrink-0" style={{ color: GOLD }} />
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* CTA BANNER 2 */}
      <CTABanner
        title="Pedidos em lote com desconto progressivo"
        subtitle="Quanto maior a quantidade, menor o custo por unidade. Ideal para empresas de todos os tamanhos."
        cta="Calcular meu orçamento"
      />

      {/* DIFERENCIAIS */}
      <section className="mx-auto max-w-7xl px-6 py-24">
        <div className="text-center mb-14">
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-3">Diferenciais</p>
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Por que escolher a Madan?</h2>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {differentials.map((d) => (
            <div key={d.title} className="rounded-xl bg-secondary/50 p-6 border border-border/40">
              <d.icon className="size-7" style={{ color: GOLD }} />
              <h3 className="font-serif text-lg mt-4">{d.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground">{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FORM */}
      <section id="orcamento" className="bg-secondary/40 border-y border-border/60 scroll-mt-24">
        <div className="mx-auto max-w-3xl px-6 py-24">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl tracking-tight">Solicite seu orçamento</h2>
            <p className="mt-3 text-muted-foreground">Responda 4 perguntas rápidas e receba uma mensagem já formatada para o WhatsApp.</p>
          </div>
          <QuoteForm />
        </div>
      </section>

      {/* FINAL CTA */}
      <section style={{ backgroundColor: DARK }}>
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="font-serif text-3xl md:text-4xl tracking-tight text-white">
            Pronto para impressionar seus clientes?
          </h2>
          <p className="mt-4 text-white/60">
            Pedidos com antecedência garantem entrega no prazo. Ideal fechar antes de novembro para brindes de fim de ano.
          </p>
          <Button
            size="lg"
            onClick={scrollToForm}
            className="mt-8 font-semibold"
            style={{ backgroundColor: GOLD, color: DARK }}
          >
            Solicitar orçamento agora
          </Button>
        </div>
      </section>
    </PageShell>
  );
}

function CTABanner({ title, subtitle, cta }: { title: string; subtitle: string; cta: string }) {
  return (
    <section className="bg-secondary/60 border-y border-border/60">
      <div className="mx-auto max-w-5xl px-6 py-14 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <h3 className="font-serif text-2xl md:text-3xl">{title}</h3>
          <p className="mt-2 text-muted-foreground max-w-2xl">{subtitle}</p>
        </div>
        <Button
          size="lg"
          onClick={scrollToForm}
          className="shrink-0 font-semibold"
          style={{ backgroundColor: GOLD, color: DARK }}
        >
          {cta}
        </Button>
      </div>
    </section>
  );
}

function QuoteForm() {
  const [step, setStep] = useState(1);
  const [products, setProducts] = useState<string[]>([]);
  const [quantity, setQuantity] = useState("");
  const [purpose, setPurpose] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [notes, setNotes] = useState("");

  const toggleProduct = (p: string) =>
    setProducts((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));

  const message = useMemo(() => {
    const lines = [
      "Olá! Vim pelo site da Madan e gostaria de solicitar um orçamento de brindes corporativos.",
      "",
      `👤 Nome: ${name}`,
      `🏢 Empresa: ${company}`,
      `🎁 Produtos de interesse: ${products.join(", ")}`,
      `📦 Quantidade estimada: ${quantity}`,
      `🎯 Finalidade: ${purpose}`,
    ];
    if (notes.trim()) lines.push(`📝 Observações: ${notes.trim()}`);
    lines.push("", "Aguardo o retorno para mais detalhes. Obrigado(a)!");
    return lines.join("\n");
  }, [name, company, products, quantity, purpose, notes]);

  const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;

  const reset = () => {
    setStep(1); setProducts([]); setQuantity(""); setPurpose("");
    setName(""); setCompany(""); setNotes("");
  };

  const totalSteps = 4;
  const progressIndex = step > totalSteps ? totalSteps : step;

  return (
    <div className="rounded-2xl bg-card border border-border/60 p-6 md:p-10 shadow-[var(--shadow-soft)]">
      {/* Progress */}
      <div className="flex items-center gap-2 mb-10">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="flex-1 flex items-center gap-2">
            <div
              className="size-8 rounded-full flex items-center justify-center text-xs font-semibold transition-all"
              style={{
                backgroundColor: i <= progressIndex ? GOLD : "transparent",
                color: i <= progressIndex ? DARK : "var(--muted-foreground)",
                border: `1px solid ${i <= progressIndex ? GOLD : "var(--border)"}`,
              }}
            >
              {step > totalSteps || i < progressIndex ? <Check className="size-4" /> : i}
            </div>
            {i < 4 && (
              <div className="flex-1 h-px transition-all" style={{ backgroundColor: i < progressIndex ? GOLD : "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      {step === 1 && (
        <StepWrapper title="Qual o tipo de brinde que você precisa?" hint="Pode selecionar mais de uma opção.">
          <div className="grid sm:grid-cols-2 gap-3">
            {productOptions.map((p) => {
              const active = products.includes(p);
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => toggleProduct(p)}
                  className="text-left rounded-lg border px-4 py-3.5 text-sm transition-all"
                  style={{
                    borderColor: active ? GOLD : "var(--border)",
                    backgroundColor: active ? `${GOLD}15` : "transparent",
                  }}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="size-4 rounded border flex items-center justify-center shrink-0"
                      style={{ borderColor: active ? GOLD : "var(--border)", backgroundColor: active ? GOLD : "transparent" }}
                    >
                      {active && <Check className="size-3" style={{ color: DARK }} />}
                    </span>
                    {p}
                  </span>
                </button>
              );
            })}
          </div>
          <Nav onNext={() => setStep(2)} disabled={products.length === 0} />
        </StepWrapper>
      )}

      {step === 2 && (
        <StepWrapper title="Qual a quantidade aproximada?" hint="Isso ajuda a calcular o melhor custo por unidade.">
          <RadioGrid options={quantityOptions} value={quantity} onChange={setQuantity} />
          <Nav onBack={() => setStep(1)} onNext={() => setStep(3)} disabled={!quantity} />
        </StepWrapper>
      )}

      {step === 3 && (
        <StepWrapper title="Qual a finalidade dos brindes?" hint="Isso nos ajuda a sugerir a apresentação ideal.">
          <RadioGrid options={purposeOptions} value={purpose} onChange={setPurpose} />
          <Nav onBack={() => setStep(2)} onNext={() => setStep(4)} disabled={!purpose} />
        </StepWrapper>
      )}

      {step === 4 && (
        <StepWrapper title="Seus dados de contato" hint="Para enviarmos o orçamento diretamente para você.">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Seu nome *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ex: Ana Costa" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Nome da empresa *</label>
              <Input value={company} onChange={(e) => setCompany(e.target.value)} placeholder="Ex: Construtora Silva Ltda" className="mt-1.5" />
            </div>
            <div>
              <label className="text-sm font-medium">Alguma observação? (opcional)</label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Ex: precisamos até 20/12, logo em vetor..." className="mt-1.5" rows={3} />
            </div>
          </div>
          <Nav
            onBack={() => setStep(3)}
            onNext={() => setStep(5)}
            nextLabel="Ver mensagem"
            disabled={!name.trim() || !company.trim()}
          />
        </StepWrapper>
      )}

      {step === 5 && (
        <div className="animate-fade-up">
          <div className="text-center mb-6">
            <div className="inline-flex size-14 items-center justify-center rounded-full mb-4" style={{ backgroundColor: `${GOLD}22` }}>
              <Check className="size-7" style={{ color: GOLD }} />
            </div>
            <h3 className="font-serif text-2xl">Tudo pronto! Sua mensagem está formatada.</h3>
            <p className="mt-2 text-sm text-muted-foreground">Clique no botão verde para abrir o WhatsApp com a mensagem já preenchida.</p>
          </div>
          <pre className="whitespace-pre-wrap rounded-lg bg-secondary/60 border border-border/60 p-5 text-xs font-mono leading-relaxed text-foreground/90">
{message}
          </pre>
          <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="block mt-6">
            <Button size="lg" className="w-full gap-2 text-base font-semibold text-white" style={{ backgroundColor: "var(--whatsapp)" }}>
              <MessageCircle className="size-5" />
              Abrir WhatsApp e enviar mensagem
            </Button>
          </a>
          <div className="text-center mt-4">
            <button type="button" onClick={reset} className="text-sm text-muted-foreground hover:text-foreground underline">
              Refazer orçamento
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function StepWrapper({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="animate-fade-up">
      <h3 className="font-serif text-2xl">{title}</h3>
      {hint && <p className="mt-1.5 text-sm text-muted-foreground">{hint}</p>}
      <div className="mt-6">{children}</div>
    </div>
  );
}

function RadioGrid({ options, value, onChange }: { options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {options.map((o) => {
        const active = value === o;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            className="text-left rounded-lg border px-4 py-3.5 text-sm transition-all"
            style={{
              borderColor: active ? GOLD : "var(--border)",
              backgroundColor: active ? `${GOLD}15` : "transparent",
            }}
          >
            <span className="flex items-center gap-2">
              <span
                className="size-4 rounded-full border flex items-center justify-center shrink-0"
                style={{ borderColor: active ? GOLD : "var(--border)" }}
              >
                {active && <span className="size-2 rounded-full" style={{ backgroundColor: GOLD }} />}
              </span>
              {o}
            </span>
          </button>
        );
      })}
    </div>
  );
}

function Nav({ onBack, onNext, disabled, nextLabel = "Próximo" }: { onBack?: () => void; onNext: () => void; disabled?: boolean; nextLabel?: string }) {
  return (
    <div className="flex items-center justify-between mt-8 pt-6 border-t border-border/60">
      {onBack ? (
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="size-4" /> Voltar
        </Button>
      ) : <div />}
      <Button onClick={onNext} disabled={disabled} className="gap-2 font-semibold" style={{ backgroundColor: GOLD, color: DARK }}>
        {nextLabel} <ArrowRight className="size-4" />
      </Button>
    </div>
  );
}