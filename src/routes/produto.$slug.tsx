import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ShoppingBag, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { brl } from "@/lib/format";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export const Route = createFileRoute("/produto/$slug")({ component: ProductPage });

function ProductPage() {
  const { slug } = Route.useParams();
  const { add } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [qty, setQty] = useState(1);
  const [uploading, setUploading] = useState(false);

  const { data: product, isLoading } = useQuery({
    queryKey: ["product", slug],
    queryFn: async () => (await supabase.from("products").select("*").eq("slug", slug).maybeSingle()).data,
  });

  if (isLoading) return <div className="p-12">Carregando...</div>;
  if (!product) return <div className="p-12">Produto não encontrado.</div>;

  const isCustom = product.kind === "custom";

  const handleAdd = async () => {
    let imageUrl: string | undefined;
    if (isCustom && file) {
      if (!user) {
        toast.error("Faça login para enviar sua arte");
        navigate({ to: "/login" });
        return;
      }
      setUploading(true);
      const path = `${user.id}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("customizations").upload(path, file);
      setUploading(false);
      if (error) { toast.error("Erro ao enviar arte: " + error.message); return; }
      const { data } = supabase.storage.from("customizations").getPublicUrl(path);
      imageUrl = data.publicUrl;
    }

    add({
      id: product.id + (isCustom ? `-${Date.now()}` : ""),
      productId: product.id,
      title: product.title,
      price: Number(product.price),
      quantity: qty,
      image: product.image_url,
      customization: isCustom ? { text: text || undefined, imageUrl } : undefined,
    });
    toast.success("Adicionado ao carrinho!");
    navigate({ to: "/carrinho" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <div className="grid md:grid-cols-2 gap-12">
          <div className="rounded-2xl overflow-hidden bg-secondary aspect-square">
            {product.image_url ? (
              <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="grid place-items-center h-full text-muted-foreground/40 font-serif text-6xl">Madan</div>
            )}
          </div>
          <div>
            {isCustom && (
              <span className="inline-block rounded-full bg-accent px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-accent-foreground">
                Personalizável
              </span>
            )}
            <h1 className="mt-3 font-serif text-4xl">{product.title}</h1>
            <p className="mt-2 text-2xl font-semibold">{brl(Number(product.price))}</p>
            <p className="mt-6 text-muted-foreground leading-relaxed">{product.description}</p>

            {isCustom && (
              <div className="mt-8 space-y-5 p-6 rounded-2xl bg-secondary/50 border border-border">
                <h3 className="font-serif text-xl">Personalize seu produto</h3>
                <div className="space-y-2">
                  <Label htmlFor="text">Texto / Frase</Label>
                  <Textarea id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Ex: 'Para a melhor mãe do mundo'" maxLength={300} rows={3} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Sua arte ou foto (opcional)</Label>
                  <div className="flex items-center gap-3">
                    <Input id="file" type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
                    <Upload className="size-4 text-muted-foreground" />
                  </div>
                  {file && <p className="text-xs text-muted-foreground">{file.name}</p>}
                </div>
              </div>
            )}

            <div className="mt-8 flex items-center gap-4">
              <div className="flex items-center border border-border rounded-full">
                <button onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-2">−</button>
                <span className="px-4 min-w-[2ch] text-center">{qty}</span>
                <button onClick={() => setQty(qty + 1)} className="px-4 py-2">+</button>
              </div>
              <Button onClick={handleAdd} disabled={uploading} size="lg" className="flex-1 rounded-full">
                <ShoppingBag className="mr-2 size-4" />
                {uploading ? "Enviando..." : "Adicionar ao Carrinho"}
              </Button>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
