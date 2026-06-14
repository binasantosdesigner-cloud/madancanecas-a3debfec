import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero, WHATSAPP_URL } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Pencil, Package, Bike } from "lucide-react";

export const Route = createFileRoute("/sobre-nos")({
  head: () => ({
    meta: [
      { title: "Sobre Nós — Madan Canecas & Personalizados" },
      { name: "description", content: "Conheça a Madan: presentes personalizados feitos à mão em Rondonópolis-MT, com arte exclusiva e embalagem especial." },
      { property: "og:title", content: "Sobre Nós — Madan Canecas & Personalizados" },
      { property: "og:description", content: "Marca de Rondonópolis-MT especializada em presentes personalizados com arte exclusiva." },
    ],
  }),
  component: SobreNos,
});

const diferenciais = [
  { icon: Pencil, title: "Arte exclusiva", text: "Cada produto recebe um design único, criado especialmente para o pedido. Nada de arte genérica." },
  { icon: Package, title: "Embalagem especial", text: "Presenteamos quem você ama com cuidado real — da produção até o detalhe da embalagem." },
  { icon: Bike, title: "Entrega em domicílio", text: "Entregamos pessoalmente em Rondonópolis-MT. Sem estresse, sem frete complicado." },
];

function SobreNos() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Sobre Nós"
        title="Feito à mão, enviado com carinho"
        subtitle="Somos a Madan — uma marca de Rondonópolis-MT especializada em presentes personalizados com arte exclusiva e acabamento premium."
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <h2 className="font-serif text-3xl mb-6">Nossa história</h2>
        <p className="text-muted-foreground leading-relaxed text-lg">
          A Madan nasceu da vontade de transformar objetos do dia a dia em memórias afetivas. Trabalhamos com canecas, camisetas, garrafas, taças e muito mais — tudo personalizado com a sua arte ou com nossos designs exclusivos. Cada peça é produzida com atenção aos detalhes e embalada com cuidado especial para chegar perfeita até você.
        </p>
      </section>

      <section className="border-t border-border/60 bg-secondary/30">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-serif text-3xl text-center mb-12">O que nos diferencia</h2>
          <div className="grid gap-8 md:grid-cols-3">
            {diferenciais.map((d) => (
              <div key={d.title} className="bg-card border border-border rounded-2xl p-8 text-center shadow-soft">
                <div className="inline-flex size-14 items-center justify-center rounded-full bg-accent/10 text-accent mb-5">
                  <d.icon className="size-6" />
                </div>
                <h3 className="font-serif text-xl mb-3">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-6 py-20 text-center">
        <p className="font-serif text-2xl mb-6">Quer fazer um pedido ou tirar uma dúvida?</p>
        <Button asChild size="lg" className="rounded-full">
          <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar no WhatsApp</a>
        </Button>
      </section>
    </PageShell>
  );
}