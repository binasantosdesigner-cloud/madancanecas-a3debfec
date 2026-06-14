import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero, WHATSAPP_URL } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Coffee, Shirt, Snowflake, Wine } from "lucide-react";

export const Route = createFileRoute("/cuidados-com-os-produtos")({
  head: () => ({
    meta: [
      { title: "Cuidados com os Produtos — Madan Canecas & Personalizados" },
      { name: "description", content: "Orientações de cuidado para canecas, camisetas, garrafas térmicas e taças personalizadas." },
      { property: "og:title", content: "Cuidados com os Produtos — Madan" },
      { property: "og:description", content: "Como conservar seus produtos personalizados por muito mais tempo." },
    ],
  }),
  component: Cuidados,
});

const blocos = [
  {
    icon: Coffee,
    title: "Canecas",
    items: [
      "Lave preferencialmente à mão com esponja macia e detergente neutro.",
      "Evite deixar a caneca de molho por longos períodos.",
      "Não use esponja de aço ou produtos abrasivos.",
      "Se usar lava-louças, prefira ciclos suaves e sem secagem a vapor direta na impressão.",
      "Não leve ao micro-ondas canecas com acabamento metálico ou dourado.",
    ],
  },
  {
    icon: Shirt,
    title: "Camisetas",
    items: [
      "Lave ao avesso para preservar a estampa.",
      "Prefira água fria ou morna (máx. 30°C).",
      "Não use alvejante ou água sanitária.",
      "Não torça com força — esprema suavemente.",
      "Seque à sombra, preferencialmente estendida.",
      "Não passe ferro diretamente sobre a estampa; passe pelo avesso ou use um pano úmido entre o ferro e a estampa.",
    ],
  },
  {
    icon: Snowflake,
    title: "Garrafas e Copos Térmicos",
    items: [
      "Lave à mão — garrafas térmicas não vão ao lava-louças.",
      "Use escova de gargalo longa para higienizar o interior.",
      "Não coloque no freezer ou micro-ondas.",
      "Após a lavagem, deixe secar com a tampa aberta para evitar mofo.",
      "Evite bebidas com açúcar por longos períodos sem lavar.",
    ],
  },
  {
    icon: Wine,
    title: "Taças",
    items: [
      "Lave à mão com cuidado — taças são frágeis.",
      "Use esponja macia e detergente neutro.",
      "Seque com pano seco e macio imediatamente após a lavagem para evitar manchas.",
      "Armazene em local seguro, de preferência com proteção entre as peças.",
    ],
  },
];

function Cuidados() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Cuidados"
        title="Cuidados com os Produtos"
        subtitle="Para que seu presente dure muito mais tempo, siga as orientações abaixo de acordo com o tipo de produto."
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-6 md:grid-cols-2">
          {blocos.map((b) => (
            <div key={b.title} className="bg-card border border-border rounded-2xl p-8 shadow-soft">
              <div className="flex items-center gap-3 mb-5">
                <div className="inline-flex size-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                  <b.icon className="size-5" />
                </div>
                <h2 className="font-serif text-2xl">{b.title}</h2>
              </div>
              <ul className="space-y-2 text-sm text-muted-foreground leading-relaxed">
                {b.items.map((i, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="text-accent mt-1">•</span>
                    <span>{i}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Dúvidas sobre como cuidar de um produto específico? Fale com a gente pelo WhatsApp — adoramos ajudar.
          </p>
          <Button asChild size="lg" className="rounded-full">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}