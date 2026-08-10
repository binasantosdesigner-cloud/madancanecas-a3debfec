import { Link } from "@tanstack/react-router";
import { Plus, MessageCircle } from "lucide-react";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface ProductCardData {
  id: string;
  slug: string;
  title: string;
  price: number;
  image_url: string | null;
  kind: "ready" | "custom";
}

export function ProductCard({ p }: { p: ProductCardData }) {
  const { add } = useCart();

  const onAdd = () => {
    if (p.kind === "custom") return; // requires customization page
    add({
      id: p.id,
      productId: p.id,
      title: p.title,
      price: Number(p.price),
      quantity: 1,
      image: p.image_url,
    });
    toast.success("Adicionado ao carrinho");
  };

  return (
    <article className="group flex flex-col">
      <Link to="/catalogo" className="relative block overflow-hidden rounded-xl bg-secondary aspect-[4/5]">
        {p.image_url ? (
          <img src={p.image_url} alt={p.title} loading="lazy" className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" />
        ) : (
          <div className="grid h-full w-full place-items-center text-xs uppercase tracking-widest text-muted-foreground/60">Madan</div>
        )}
        {p.kind === "custom" && (
          <span className="absolute left-3 top-3 rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
            Personalize
          </span>
        )}
      </Link>
      <div className="mt-4 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">
            <Link to="/catalogo">{p.title}</Link>
          </h3>
          <p className="text-sm font-semibold mt-1">{brl(Number(p.price))}</p>
        </div>
        {p.kind === "ready" ? (
          <Button onClick={onAdd} size="icon" variant="secondary" className="rounded-full shrink-0" aria-label="Adicionar">
            <Plus className="size-4" />
          </Button>
        ) : (
          <a
            href={`https://wa.me/5566984266994?text=${encodeURIComponent(`Olá! Quero personalizar ${p.title}. Pode me ajudar?`)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" variant="outline" className="rounded-full gap-1.5">
              <MessageCircle className="size-3.5" /> Personalizar
            </Button>
          </a>
        )}
      </div>
    </article>
  );
}
