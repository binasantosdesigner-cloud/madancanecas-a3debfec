import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/lib/cart";
import { FavoriteButton } from "@/components/site/FavoriteButton";
import { brl } from "@/lib/format";
import { toast } from "sonner";
import { Minus, Plus, ShoppingCart, MessageCircle, ArrowLeft, ZoomIn, X, ChevronLeft, ChevronRight } from "lucide-react";

export const Route = createFileRoute("/produto/$slug")({ component: ProdutoPage });

function UpsellCard({ product: p }: { product: any }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);

  const handleAdd = () => {
    add({
      id: p.id,
      productId: p.id,
      title: p.title,
      price: Number(p.price),
      quantity: 1,
      image: p.image_url,
    });
    setAdded(true);
    toast.success(`${p.title} adicionado! 🛍️`);
    setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="group flex flex-col rounded-2xl border border-border bg-background overflow-hidden hover:border-[#e8509a]/40 hover:shadow-md transition-all duration-300">
      {/* Imagem */}
      <Link
        to="/produto/$slug"
        params={{ slug: p.slug }}
        className="block aspect-square bg-secondary overflow-hidden"
      >
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] uppercase tracking-widest text-muted-foreground/30">
            Madan
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col gap-2 flex-1">
        <Link
          to="/produto/$slug"
          params={{ slug: p.slug }}
          className="text-sm font-medium leading-tight hover:text-[#e8509a] transition-colors line-clamp-2"
        >
          {p.title}
        </Link>
        <p className="text-sm font-semibold text-[#e8509a]">{brl(Number(p.price))}</p>

        <button
          onClick={handleAdd}
          className={`mt-auto w-full rounded-full py-2 text-xs font-medium transition-all ${
            added
              ? 'bg-green-500 text-white'
              : 'bg-[#e8509a] text-white hover:bg-[#d4458c]'
          }`}
        >
          {added ? '✓ Adicionado!' : '+ Adicionar'}
        </button>
      </div>
    </div>
  );
}

function ProdutoPage() {
  const { slug } = Route.useParams();
  const navigate = useNavigate();
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const [obs, setObs] = useState("");
  const [activeImg, setActiveImg] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: upsells = [] } = useQuery({
    enabled: !!product?.id,
    queryKey: ['upsells', product?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_upsells')
        .select('upsell_product_id, display_order, products!product_upsells_upsell_product_id_fkey(id, title, slug, price, image_url, kind)')
        .eq('product_id', product!.id)
        .order('display_order', { ascending: true });
      return (data ?? []).map((u: any) => u.products).filter(Boolean);
    },
  });

  const productImages = useMemo(() => {
    if (!product) return [];
    const imgs = (product.images as any[]) ?? [];
    if (imgs.length > 0) return imgs.map((i: any) => i.url);
    if (product.image_url) return [product.image_url];
    return [];
  }, [product]);

  const handleAdd = () => {
    if (!product) return;
    add({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: qty,
      image: product.image_url,
      customization: obs.trim() ? { text: obs.trim() } : undefined,
    });
    toast.success("Adicionado ao carrinho ✓");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
          <div className="grid md:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square rounded-2xl bg-secondary" />
            <div className="space-y-4">
              <div className="h-4 w-32 bg-secondary rounded" />
              <div className="h-8 w-3/4 bg-secondary rounded" />
              <div className="h-6 w-24 bg-secondary rounded" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center gap-4 py-24">
          <h1 className="font-serif text-3xl">Produto não encontrado.</h1>
          <Link to="/catalogo">
            <Button variant="outline" className="rounded-full gap-2">
              <ArrowLeft className="size-4" /> Voltar ao catálogo
            </Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const category = product.categories as any;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8">
          <Link to="/catalogo" className="hover:text-[#e8509a] transition-colors">Catálogo</Link>
          {category && (
            <>
              <span>/</span>
              <Link
                to="/catalogo"
                search={{ categoria: category.slug }}
                className="hover:text-[#e8509a] transition-colors"
              >
                {category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.title}</span>
        </nav>

        <div className="grid md:grid-cols-[1fr_420px] gap-12">

          {/* Imagem */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-secondary">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-xs uppercase tracking-widest text-muted-foreground/40">Madan</span>
              </div>
            )}
            {/* Botão favoritar sobre a imagem */}
            <div className="absolute top-4 right-4">
              <FavoriteButton productId={product.id} />
            </div>
          </div>

          {/* Informações */}
          <div className="flex flex-col gap-5">

            {/* Badge categoria */}
            {category && (
              <span className="inline-flex w-fit items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#fce8f3] text-[#b03578]">
                {category.name}
              </span>
            )}

            {/* Nome */}
            <h1 className="font-serif text-3xl leading-tight">{product.title}</h1>

            {/* Preço */}
            <p className="text-2xl font-semibold text-[#e8509a]">{brl(Number(product.price))}</p>

            {/* Descrição */}
            {product.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">{product.description}</p>
            )}

            <hr className="border-border" />

            {/* Quantidade */}
            <div>
              <label className="text-sm font-medium mb-2 block">Quantidade</label>
              <div className="inline-flex items-center border border-border rounded-full text-sm">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 hover:text-[#e8509a] transition-colors"
                  aria-label="Diminuir"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="px-4 py-2 font-medium min-w-[3rem] text-center">{qty}</span>
                <button
                  onClick={() => setQty((q) => Math.min(99, q + 1))}
                  className="px-4 py-2 hover:text-[#e8509a] transition-colors"
                  aria-label="Aumentar"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>
            </div>

            {/* Observação */}
            <div>
              <label className="text-sm font-medium mb-2 block">
                Observação / Personalização
                <span className="text-muted-foreground font-normal ml-1">(opcional)</span>
              </label>
              <Textarea
                placeholder="Ex: Nome para personalizar, cor preferida, data do evento..."
                value={obs}
                onChange={(e) => setObs(e.target.value)}
                maxLength={300}
                rows={3}
                className="resize-none text-sm"
              />
              <p className="text-[11px] text-muted-foreground mt-1 text-right">{obs.length}/300</p>
            </div>

            {/* Subtotal */}
            <div className="flex items-center justify-between text-sm bg-secondary/60 rounded-xl px-4 py-3">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-semibold">{brl(Number(product.price) * qty)}</span>
            </div>

            {/* Botões de ação */}
            <div className="space-y-3">
              <Button
                onClick={handleAdd}
                className="w-full rounded-full gap-2"
                size="lg"
                style={{ background: "#e8509a" }}
              >
                <ShoppingCart className="size-4" />
                Adicionar ao carrinho
              </Button>
              <a
                href={`https://wa.me/5566984266994?text=${encodeURIComponent(
                  `Olá! Tenho interesse no produto: ${product.title} (R$ ${Number(product.price).toFixed(2).replace(".", ",")}). Pode me ajudar?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" className="w-full rounded-full gap-2" size="lg">
                  <MessageCircle className="size-4" />
                  Pedir pelo WhatsApp
                </Button>
              </a>
            </div>

            {/* Selos de confiança */}
            <div className="flex flex-wrap gap-3 text-[11px] text-muted-foreground pt-2">
              <span>🎨 Arte exclusiva inclusa</span>
              <span>✅ Aprovação prévia</span>
              <span>📦 Embalagem especial</span>
              <span>🚴 Entrega em Rondonópolis-MT</span>
            </div>

          </div>
        </div>

        {/* SEÇÃO UPSELL */}
        {upsells.length > 0 && (
          <section className="mt-16 pt-12 border-t border-border">
            <div className="text-center mb-8">
              <span className="inline-block text-xs font-bold uppercase tracking-[0.2em] text-[#a57840] bg-[#a57840]/10 px-3 py-1 rounded-full mb-3">
                Complete seu presente
              </span>
              <h2 className="font-serif text-2xl">Que tal adicionar também?</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Produtos que combinam muito bem com {product?.title}
              </p>
            </div>

            <div className={`grid gap-6 ${
              upsells.length === 1 ? 'grid-cols-1 max-w-xs mx-auto' :
              upsells.length === 2 ? 'grid-cols-2 max-w-lg mx-auto' :
              upsells.length === 3 ? 'grid-cols-3' :
              'grid-cols-2 md:grid-cols-4'
            }`}>
              {upsells.map((up: any) => (
                <UpsellCard key={up.id} product={up} />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Lightbox Modal */}
      {lightboxOpen && productImages.length > 0 && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxOpen(false)}
        >
          {/* Close button */}
          <button
            className="absolute top-4 right-4 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
            onClick={() => setLightboxOpen(false)}
          >
            <X className="size-5" />
          </button>

          {/* Prev */}
          {productImages.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i - 1 + productImages.length) % productImages.length); }}
            >
              <ChevronLeft className="size-5" />
            </button>
          )}

          {/* Main image */}
          <img
            src={productImages[activeImg]}
            alt=""
            className="max-w-full max-h-full object-contain rounded-xl"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Next */}
          {productImages.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 size-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors"
              onClick={(e) => { e.stopPropagation(); setActiveImg(i => (i + 1) % productImages.length); }}
            >
              <ChevronRight className="size-5" />
            </button>
          )}

          {/* Dot indicators */}
          {productImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
              {productImages.map((_, idx) => (
                <button
                  key={idx}
                  onClick={(e) => { e.stopPropagation(); setActiveImg(idx); }}
                  className={`size-2 rounded-full transition-all ${activeImg === idx ? 'bg-white w-4' : 'bg-white/40'}`}
                />
              ))}
            </div>
          )}

          {/* Counter */}
          <span className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm">
            {activeImg + 1} / {productImages.length}
          </span>
        </div>
      )}

      <Footer />
    </div>
  );
}
