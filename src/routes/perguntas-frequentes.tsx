import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero, WHATSAPP_URL } from "@/components/site/PageShell";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

export const Route = createFileRoute("/perguntas-frequentes")({
  head: () => ({
    meta: [
      { title: "Perguntas Frequentes — Madan Canecas & Personalizados" },
      { name: "description", content: "Tire suas dúvidas sobre pedidos, prazos, entrega, pagamento e produtos personalizados da Madan." },
      { property: "og:title", content: "Perguntas Frequentes — Madan" },
      { property: "og:description", content: "Dúvidas sobre pedidos, prazos, entrega e pagamento na Madan Canecas & Personalizados." },
    ],
  }),
  component: FAQ,
});

const categorias = [
  {
    title: "Pedidos e Personalização",
    items: [
      { q: "Como faço um pedido?", a: "É simples! Entre em contato pelo nosso WhatsApp, nos diga o produto que deseja, a personalização que quer (nome, foto, frase ou arte própria) e nós cuidamos de tudo. Enviamos uma prévia da arte para sua aprovação antes de produzir." },
      { q: "Posso enviar minha própria arte?", a: "Sim! Você pode enviar sua arte em formato PNG, JPG ou PDF em alta resolução (mínimo 300 DPI). Se preferir, nossa equipe pode criar um design exclusivo para você." },
      { q: "Posso fazer pedidos em quantidade (corporativo)?", a: "Com certeza! Atendemos empresas e eventos com pedidos em lote. Entre em contato pelo WhatsApp para receber um orçamento personalizado." },
      { q: "Posso alterar ou cancelar um pedido após a confirmação?", a: "Alterações são aceitas somente antes da aprovação final da arte. Após aprovação e início da produção, não é possível realizar cancelamentos ou alterações." },
    ],
  },
  {
    title: "Prazos e Entrega",
    items: [
      { q: "Qual o prazo de produção?", a: "O prazo médio de produção é de 5 a 10 dias úteis após a aprovação da arte, dependendo do tipo de produto e da quantidade." },
      { q: "Vocês entregam em todo o Brasil?", a: "No momento, fazemos entrega em domicílio apenas em Rondonópolis-MT. Para outras cidades, consulte disponibilidade pelo WhatsApp." },
      { q: "Como funciona a entrega?", a: "Entregamos pessoalmente na sua casa ou local de trabalho em Rondonópolis-MT. O agendamento é feito diretamente pelo WhatsApp após a conclusão do pedido." },
    ],
  },
  {
    title: "Pagamento",
    items: [
      { q: "Quais formas de pagamento são aceitas?", a: "Aceitamos Pix, transferência bancária e dinheiro na entrega (para pedidos locais). Consulte outras formas de pagamento pelo WhatsApp." },
      { q: "Preciso pagar antecipado?", a: "Sim. Solicitamos um sinal de 50% no ato do pedido para iniciar a produção. O restante é pago na entrega." },
    ],
  },
  {
    title: "Produtos",
    items: [
      { q: "Quais produtos vocês personalizam?", a: "Trabalhamos com canecas, camisetas, garrafas térmicas, taças, copos e outros itens personalizados. Novidades sempre chegando — siga nosso Instagram @madancanecas para ficar por dentro." },
      { q: "Os produtos têm garantia?", a: "Sim. Garantimos a qualidade da personalização. Em caso de defeito de fabricação, consulte nossa Política de Trocas." },
      { q: "A embalagem é especial?", a: "Sim! Todos os pedidos são embalados com carinho para que chegue como um presente de verdade — mesmo que seja um presentinho pra você mesmo." },
    ],
  },
];

function FAQ() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Ajuda"
        title="Perguntas Frequentes"
        subtitle="Tire suas principais dúvidas sobre pedidos, prazos e produtos."
      />

      <section className="mx-auto max-w-3xl px-6 py-20 space-y-14">
        {categorias.map((cat) => (
          <div key={cat.title}>
            <h2 className="font-serif text-2xl mb-5">{cat.title}</h2>
            <Accordion type="single" collapsible className="w-full">
              {cat.items.map((it, idx) => (
                <AccordionItem key={idx} value={`${cat.title}-${idx}`}>
                  <AccordionTrigger className="text-left">{it.q}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed">{it.a}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ))}

        <div className="text-center pt-6 border-t border-border/60">
          <p className="font-serif text-xl mb-5">Ainda tem dúvidas? A gente resolve pelo WhatsApp!</p>
          <Button asChild size="lg" className="rounded-full">
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer">Falar com a Madan</a>
          </Button>
        </div>
      </section>
    </PageShell>
  );
}