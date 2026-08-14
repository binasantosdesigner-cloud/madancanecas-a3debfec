import { Instagram } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const INSTAGRAM_URL = "https://www.instagram.com/madancanecas/";

export function Footer() {
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("categories")
        .select("*")
        .order("display_order");
      return data ?? [];
    },
  });

  return (
    <footer className="mt-24 border-t-2 border-accent/30 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <img
            src="https://itfknwsdynturbwgaqnc.supabase.co/storage/v1/object/public/assets/Logo-branca-MADAN.webp"
            alt="Madan Canecas & Personalizados"
            className="h-16 w-auto object-contain"
            loading="lazy"
          />
          <p className="mt-4 text-sm text-muted-foreground max-w-xs">
            Presentes personalizados feitos à mão, com acabamento premium e atendimento humano via WhatsApp.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-accent hover:opacity-80 transition-opacity"
            aria-label="Instagram @madancanecas"
          >
            <Instagram className="size-4" />
            @madancanecas
          </a>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-accent">Categorias</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/catalogo" className="hover:text-accent transition-colors">Catálogo Digital</Link></li>
            {categories?.map((c) => (
              <li key={c.id}>
                <Link to="/catalogo" className="hover:text-accent transition-colors">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-accent">Institucional</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><Link to="/sobre-nos" className="hover:text-accent transition-colors">Sobre nós</Link></li>
            <li><Link to="/politica-de-trocas" className="hover:text-accent transition-colors">Política de Trocas</Link></li>
            <li><Link to="/cuidados-com-os-produtos" className="hover:text-accent transition-colors">Cuidados com os Produtos</Link></li>
            <li><Link to="/perguntas-frequentes" className="hover:text-accent transition-colors">Perguntas Frequentes</Link></li>
            <li><Link to="/brindes-corporativos" className="hover:text-accent transition-colors">Brindes Corporativos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-accent">Contato</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="https://wa.me/5566984266994" target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
                WhatsApp: (66) 98426-6994
              </a>
            </li>
            <li>
              <a href="mailto:madan.canecas@gmail.com" className="hover:text-accent transition-colors">
                madan.canecas@gmail.com
              </a>
            </li>
            <li>
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="hover:text-accent transition-colors">
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
