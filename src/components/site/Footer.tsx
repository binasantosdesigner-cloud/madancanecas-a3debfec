import { Instagram } from "lucide-react";

export const INSTAGRAM_URL = "https://www.instagram.com/madancanecas/";

export function Footer() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-3">
        <div>
          <h3 className="font-serif text-2xl">Madan</h3>
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Presentes personalizados feitos à mão, com acabamento premium e atendimento humano via WhatsApp.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-foreground hover:text-accent transition-colors"
            aria-label="Instagram @madancanecas"
          >
            <Instagram className="size-4" />
            @madancanecas
          </a>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Institucional</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>Sobre nós</li>
            <li>Política de Trocas</li>
            <li>Cuidados com os Produtos</li>
            <li>Perguntas Frequentes</li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4">Contato</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>WhatsApp: clique para conversar</li>
            <li>contato@madancanecas.com.br</li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-foreground transition-colors">
                Instagram @madancanecas
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border/60 py-6 text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
        © {new Date().getFullYear()} Madan Canecas & Personalizados
      </div>
    </footer>
  );
}
