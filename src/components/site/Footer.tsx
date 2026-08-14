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
    <footer className="mt-24 bg-[#e8509a]">
      <div className="mx-auto max-w-7xl px-6 py-16 grid gap-12 md:grid-cols-4">
        <div>
          <img
            src="https://itfknwsdynturbwgaqnc.supabase.co/storage/v1/object/public/assets/Logo-branca-MADAN.webp"
            alt="Madan Canecas & Personalizados"
            className="h-16 w-auto object-contain"
            loading="lazy"
          />
          <p className="mt-4 text-sm text-white/80 max-w-xs">
            Presentes personalizados feitos à mão, com acabamento premium e atendimento humano via WhatsApp.
          </p>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 text-sm text-white hover:opacity-75 transition-opacity"
            aria-label="Instagram @madancanecas"
          >
            <Instagram className="size-4" />
            @madancanecas
          </a>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Categorias</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/catalogo" className="hover:opacity-75 transition-opacity text-white/85">Catálogo Digital</Link></li>
            {categories?.map((c) => (
              <li key={c.id}>
                <Link to="/catalogo" className="hover:opacity-75 transition-opacity text-white/85">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Institucional</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/sobre-nos" className="hover:opacity-75 transition-opacity text-white/85">Sobre nós</Link></li>
            <li><Link to="/politica-de-trocas" className="hover:opacity-75 transition-opacity text-white/85">Política de Trocas</Link></li>
            <li><Link to="/cuidados-com-os-produtos" className="hover:opacity-75 transition-opacity text-white/85">Cuidados com os Produtos</Link></li>
            <li><Link to="/perguntas-frequentes" className="hover:opacity-75 transition-opacity text-white/85">Perguntas Frequentes</Link></li>
            <li><Link to="/brindes-corporativos" className="hover:opacity-75 transition-opacity text-white/85">Brindes Corporativos</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-xs font-bold uppercase tracking-widest mb-4 text-white">Contato</h4>
          <div className="flex items-center gap-3">
            {/* WhatsApp */}
            <a
              href="https://wa.me/5566984266994"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp (66) 98426-6994"
              title="(66) 98426-6994"
              className="group relative flex items-center justify-center size-9 rounded-full bg-white/20 text-white hover:bg-white hover:text-[#e8509a] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="size-4">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
                <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.129 1.535 5.874L0 24l6.29-1.51A11.935 11.935 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.88 9.88 0 01-5.031-1.378l-.361-.214-3.735.897.935-3.625-.235-.373A9.882 9.882 0 012.118 12C2.118 6.533 6.533 2.118 12 2.118c5.467 0 9.882 4.415 9.882 9.882 0 5.467-4.415 9.882-9.882 9.882z"/>
              </svg>
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs text-[#e8509a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                (66) 98426-6994
              </span>
            </a>

            {/* E-mail */}
            <a
              href="mailto:madan.canecas@gmail.com"
              aria-label="E-mail madan.canecas@gmail.com"
              title="madan.canecas@gmail.com"
              className="group relative flex items-center justify-center size-9 rounded-full bg-white/20 text-white hover:bg-white hover:text-[#e8509a] transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4">
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs text-[#e8509a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                madan.canecas@gmail.com
              </span>
            </a>

            {/* Instagram */}
            <a
              href={INSTAGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram @madancanecas"
              title="@madancanecas"
              className="group relative flex items-center justify-center size-9 rounded-full bg-white/20 text-white hover:bg-white hover:text-[#e8509a] transition-colors"
            >
              <Instagram className="size-4" />
              <span className="pointer-events-none absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-white px-2 py-1 text-xs text-[#e8509a] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                @madancanecas
              </span>
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-white/20 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 px-6 max-w-7xl mx-auto text-[11px] uppercase tracking-[0.15em] text-white/70">
        <span>© {new Date().getFullYear()} Madan Canecas & Personalizados</span>
        <a
          href="https://boxcriativa.com.br/"
          target="_blank"
          rel="noopener noreferrer"
          className="hover:text-white transition-colors normal-case tracking-normal text-white/70"
        >
          Desenvolvido por <span className="font-semibold text-white">Box Criativa</span>
        </a>
      </div>
    </footer>
  );
}
