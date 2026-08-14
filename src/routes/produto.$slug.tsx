import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronRight, Minus, Plus, MessageCircle, ShoppingBag, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$slug")({
  component: ProdutoPage,
});

function ProdutoPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [observation, setObservation] = useState("");

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("*, categories(name, slug)")
        .eq("slug", slug)
        .eq("active", true)
        .maybeSingle();
      return data;
    },
  });

  const handleAddToCart = () => {
    if (!product) return;

    add({
      id: product.id,
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: quantity,
      image: product.image_url,
      customization: observation ? { text: observation } : undefined,
    });

    toast.success("Adicionado ao carrinho ✓");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-cream">
        <Header />
        <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl animate-pulse" />
            <div className="space-y-6">
              <Skeleton className="h-6 w-1/3" />
              <Skeleton className="h-10 w-2/3" />
              <Skeleton className="h-8 w-1/4" />
              <Separator />
              <Skeleton className="h-24 w-full" />
              <Skeleton className="h-14 w-full rounded-full" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col bg-brand-cream">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <h2 className="text-2xl font-serif mb-4">Produto não encontrado.</h2>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/catalogo">
              <ArrowLeft className="mr-2 size-4" /> Voltar ao catálogo
            </Link>
          </Button>
        </main>
        <Footer />
      </div>
    );
  }

  const total = Number(product.price) * quantity;

  return (
    <div className="min-h-screen flex flex-col bg-brand-cream">
      <Header />
      <main className="flex-1 max-w-5xl mx-auto px-6 py-12 w-full">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-muted-foreground mb-8 overflow-hidden whitespace-nowrap">
          <Link to="/catalogo" className="hover:text-brand-gold transition-colors">Catálogo</Link>
          <ChevronRight className="size-3 shrink-0" />
          <Link 
            to="/catalogo" 
            search={{ categoria: product.categories?.slug }} 
            className="hover:text-brand-gold transition-colors"
          >
            {product.categories?.name}
          </Link>
          <ChevronRight className="size-3 shrink-0" />
          <span className="text-brand-dark font-medium truncate">{product.title}</span>
        </nav>

        <div className="grid grid-cols-1 md:grid-cols-10 gap-12">
          {/* Imagem */}
          <div className="md:col-span-6">
            <div className="aspect-square rounded-2xl overflow-hidden bg-secondary border border-border/40 shadow-sm">
              {product.image_url ? (
                <img 
                  src={product.image_url} 
                  alt={product.title} 
                  className="h-full w-full object-cover" 
                />
              ) : (
                <div className="grid h-full w-full place-items-center text-xs uppercase tracking-widest text-muted-foreground/40 font-bold">
                  Madan
                </div>
              )}
            </div>
          </div>

          {/* Informações */}
          <div className="md:col-span-4 flex flex-col">
            <h1 className="font-serif text-3xl text-brand-dark mb-2">{product.title}</h1>
            <p className="text-2xl font-semibold text-brand-gold mb-6">{brl(Number(product.price))}</p>

            <Separator className="mb-8" />

            <div className="space-y-8">
              {/* Quantidade */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Quantidade</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center border border-border rounded-full p-1 bg-white">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full size-10"
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                    >
                      <Minus className="size-4" />
                    </Button>
                    <span className="w-10 text-center font-medium">{quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="rounded-full size-10"
                      onClick={() => setQuantity(Math.min(99, quantity + 1))}
                      disabled={quantity >= 99}
                    >
                      <Plus className="size-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Observação */}
              <div className="space-y-3">
                <label className="text-sm font-semibold text-brand-dark uppercase tracking-wider">Observação (opcional)</label>
                <Textarea 
                  placeholder="Ex: Nome para personalizar, cor preferida, data do evento..."
                  className="resize-none h-32 bg-white rounded-xl focus-visible:ring-brand-gold"
                  maxLength={300}
                  value={observation}
                  onChange={(e) => setObservation(e.target.value)}
                />
                <p className="text-[10px] text-right text-muted-foreground">{observation.length}/300</p>
              </div>

              {/* Valor Total */}
              <div className="pt-4">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-sm font-medium text-muted-foreground">Subtotal</span>
                  <span className="text-xl font-bold text-brand-dark">{brl(total)}</span>
                </div>
                <p className="text-[10px] text-muted-foreground italic text-right">Preço final baseado na quantidade</p>
              </div>

              {/* Ações */}
              <div className="space-y-3">
                <Button 
                  onClick={handleAddToCart}
                  className="w-full bg-[#e8509a] hover:bg-[#e8509a]/90 text-white rounded-full py-7 text-lg font-bold gap-3 shadow-lg"
                >
                  <ShoppingBag className="size-5" /> Adicionar ao carrinho
                </Button>

                <a 
                  href={`https://wa.me/5566984266994?text=${encodeURIComponent(`Olá! Tenho interesse no produto: ${product.title}. Pode me ajudar?`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full"
                >
                  <Button variant="outline" className="w-full rounded-full py-7 gap-2 border-brand-gold text-brand-gold hover:bg-brand-gold/5">
                    <MessageCircle className="size-5" /> Pedir pelo WhatsApp
                  </Button>
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
