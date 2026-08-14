import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Trash2, MessageCircle, CheckCircle2, Copy } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { brl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/carrinho")({ component: CartPage });

function CartPage() {
  const { items, total, setQty, remove, clear } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [delivery, setDelivery] = useState("retirada");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({
    queryKey: ["whatsapp_number"],
    queryFn: async () => (await supabase.from("settings").select("value").eq("key", "whatsapp_number").maybeSingle()).data,
  });

  const handleCheckout = async () => {
    if (!user) { toast.error("Faça login para finalizar"); navigate({ to: "/login" }); return; }
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (items.length === 0) return;

    setLoading(true);
    const { error } = await supabase.from("orders").insert({
      user_id: user.id,
      customer_name: name,
      customer_phone: phone,
      delivery_type: delivery,
      notes,
      items: items as any,
      total,
      status: "pending",
    });
    setLoading(false);
    if (error) { toast.error("Erro ao salvar pedido: " + error.message); return; }

    const msg = buildWhatsAppMessage({ customerName: name, items, total, delivery: delivery === "retirada" ? "Retirada na loja" : "Entrega", notes });
    const phoneNum = settings?.value || "5511999999999";
    window.open(whatsappLink(phoneNum, msg), "_blank");
    clear();
    navigate({ to: "/conta" });
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-2xl px-6 py-24 text-center">
          <h1 className="font-serif text-4xl">Seu carrinho está vazio</h1>
          <p className="mt-3 text-muted-foreground">Explore nossos produtos e encontre presentes únicos.</p>
          <Link to="/catalogo" className="mt-8 inline-block">
            <Button size="lg" className="rounded-full">Ver Produtos</Button>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-6xl px-6 py-12 w-full">
        <h1 className="font-serif text-4xl mb-10">Seu Carrinho</h1>
        <div className="grid lg:grid-cols-[1fr_400px] gap-12">
          <div className="space-y-4">
            {items.map((it) => (
              <div key={it.id} className="flex gap-4 p-4 border border-border rounded-xl">
                <div className="size-24 rounded-lg bg-secondary overflow-hidden shrink-0">
                  {it.image && <img src={it.image} alt="" className="w-full h-full object-cover" />}
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{it.title}</h3>
                  {it.customization?.text && <p className="text-xs text-muted-foreground italic mt-1">"{it.customization.text}"</p>}
                  {it.customization?.imageUrl && <p className="text-xs text-accent mt-1">✓ Arte enviada</p>}
                  <div className="mt-3 flex items-center gap-3">
                    <div className="flex items-center border border-border rounded-full text-sm">
                      <button onClick={() => setQty(it.id, it.quantity - 1)} className="px-3 py-1">−</button>
                      <span className="px-3">{it.quantity}</span>
                      <button onClick={() => setQty(it.id, it.quantity + 1)} className="px-3 py-1">+</button>
                    </div>
                    <button onClick={() => remove(it.id)} className="text-muted-foreground hover:text-destructive">
                      <Trash2 className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="text-right font-semibold">{brl(it.price * it.quantity)}</div>
              </div>
            ))}
          </div>

          <aside className="space-y-6 p-6 bg-secondary/40 rounded-2xl h-fit sticky top-24">
            <h2 className="font-serif text-xl">Finalizar Pedido</h2>
            <div className="space-y-2">
              <Label htmlFor="n">Seu nome *</Label>
              <Input id="n" value={name} onChange={(e) => setName(e.target.value)} placeholder="Nome completo" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="p">WhatsApp</Label>
              <Input id="p" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 99999-9999" />
            </div>
            <div className="space-y-2">
              <Label>Entrega</Label>
              <RadioGroup value={delivery} onValueChange={setDelivery}>
                <div className="flex items-center gap-2"><RadioGroupItem value="retirada" id="r1" /><Label htmlFor="r1" className="font-normal">Retirar na loja</Label></div>
                <div className="flex items-center gap-2"><RadioGroupItem value="entrega" id="r2" /><Label htmlFor="r2" className="font-normal">Entrega</Label></div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="o">Observações</Label>
              <Textarea id="o" value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} />
            </div>
            <div className="border-t border-border pt-4 flex justify-between font-semibold">
              <span>Total</span><span>{brl(total)}</span>
            </div>
            <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full rounded-full bg-whatsapp hover:bg-whatsapp/90 text-white">
              <MessageCircle className="mr-2 size-4" />
              {loading ? "Processando..." : "Finalizar no WhatsApp"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Você será redirecionado para conversar com nossa equipe.</p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
