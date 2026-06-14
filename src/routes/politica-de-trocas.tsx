import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHero, WHATSAPP_URL, EMAIL } from "@/components/site/PageShell";

export const Route = createFileRoute("/politica-de-trocas")({
  head: () => ({
    meta: [
      { title: "Política de Trocas — Madan Canecas & Personalizados" },
      { name: "description", content: "Conheça nossa política de trocas: prazos, condições e como solicitar troca de produtos personalizados." },
      { property: "og:title", content: "Política de Trocas — Madan" },
      { property: "og:description", content: "Prazos, condições e como solicitar troca na Madan Canecas & Personalizados." },
    ],
  }),
  component: PoliticaDeTrocas,
});

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="font-serif text-2xl mb-4">{title}</h2>
      <div className="text-muted-foreground leading-relaxed space-y-3">{children}</div>
    </section>
  );
}

function PoliticaDeTrocas() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Política"
        title="Política de Trocas"
        subtitle="Sua satisfação é nossa prioridade. Leia com atenção nossa política antes de solicitar uma troca."
      />

      <article className="mx-auto max-w-3xl px-6 py-20">
        <Section title="1. Quando aceitamos troca">
          <p>Aceitamos solicitações de troca nos seguintes casos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>O produto chegou com defeito de fabricação (impressão borrada, peça danificada, item errado).</li>
            <li>Houve erro nosso no pedido (arte diferente da aprovada, produto trocado).</li>
            <li>O produto chegou avariado durante o transporte.</li>
          </ul>
        </Section>

        <Section title="2. Prazo para solicitação">
          <p>A solicitação de troca deve ser feita em até <strong>7 dias corridos</strong> após o recebimento do produto. Após esse prazo, não será possível dar andamento à solicitação.</p>
        </Section>

        <Section title="3. Como solicitar">
          <p>Para solicitar uma troca, entre em contato pelo nosso WhatsApp ou e-mail informando:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Número do pedido</li>
            <li>Descrição do problema</li>
            <li>Foto do produto com o defeito</li>
          </ul>
          <p>Analisaremos o caso em até 2 dias úteis e retornaremos com a solução.</p>
        </Section>

        <Section title="4. O que NÃO cobre nossa política">
          <p>Não realizamos trocas nos seguintes casos:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>Arrependimento de compra após a produção do item.</li>
            <li>Arte aprovada pelo cliente com erros de digitação ou informações incorretas fornecidas pelo próprio cliente.</li>
            <li>Danos causados por mau uso ou lavagem incorreta do produto.</li>
          </ul>
        </Section>

        <Section title="5. Contato">
          <p>Dúvidas? Fale com a gente:</p>
          <ul className="list-disc pl-6 space-y-1">
            <li>
              WhatsApp:{" "}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">
                (66) 98426-6994
              </a>
            </li>
            <li>
              E-mail:{" "}
              <a href={`mailto:${EMAIL}`} className="text-accent hover:underline">{EMAIL}</a>
            </li>
          </ul>
        </Section>
      </article>
    </PageShell>
  );
}