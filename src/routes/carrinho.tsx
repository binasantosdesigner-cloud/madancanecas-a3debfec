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

function buildPixPayload({
  key, keyType, name, city, amount, txid,
}: {
  key: string; keyType: string; name: string;
  city: string; amount: number; txid: string;
}): string {
  const fmt = (id: string, val: string) => {
    const len = val.length.toString().padStart(2, '0');
    return `${id}${len}${val}`;
  };
  const merchantAccountInfo = fmt('00', 'BR.GOV.BCB.PIX') + fmt('01', key);
  const payload = [
    fmt('00', '01'),
    fmt('26', merchantAccountInfo),
    fmt('52', '0000'),
    fmt('53', '986'),
    fmt('54', amount.toFixed(2)),
    fmt('58', 'BR'),
    fmt('59', name.slice(0, 25).toUpperCase()),
    fmt('60', city.slice(0, 15).toUpperCase()),
    fmt('62', fmt('05', txid.slice(0, 25).replace(/\W/g, '').toUpperCase())),
  ].join('');
  const withCrc = payload + '6304';
  let crc = 0xFFFF;
  for (const c of withCrc) {
    crc ^= c.charCodeAt(0) << 8;
    for (let i = 0; i < 8; i++) crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
  }
  return withCrc + (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
}

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
  const [showPix, setShowPix] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const { data: pixSettings } = useQuery({
    queryKey: ['pix_settings'],
    queryFn: async () => {
      const { data } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['pix_key', 'pix_key_type', 'pix_beneficiary', 'pix_city', 'pix_percent_due', 'whatsapp_number']);
      return Object.fromEntries((data ?? []).map(r => [r.key, r.value]));
    },
  });

  const pixPercent = Number(pixSettings?.pix_percent_due ?? 50) / 100;
  const amountDue = Math.ceil(total * pixPercent * 100) / 100;

  const handleCheckout = async () => {
    if (!user) { toast.error('Faça login para finalizar'); navigate({ to: '/login' }); return; }
    if (!name.trim()) { toast.error('Informe seu nome'); return; }
    if (items.length === 0) return;

    setLoading(true);
    const txid = `MADAN${Date.now()}`;

    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: user.id,
        customer_name: name,
        customer_phone: phone,
        delivery_type: delivery,
        notes,
        items: items as any,
        total,
        status: 'pending',
        payment_status: 'pending',
        amount_due: amountDue,
        amount_paid: 0,
      })
      .select()
      .single();

    setLoading(false);
    if (error || !order) { toast.error('Erro ao salvar pedido: ' + error?.message); return; }

    setOrderId(order.id);
    setShowPix(true);
  };

  if (showPix) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 mx-auto max-w-lg px-6 py-12 w-full text-center">
          <div className="rounded-2xl border border-border bg-background p-8 space-y-6">
            <div className="mx-auto size-16 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle2 className="size-8 text-green-600" />
            </div>

            <div>
              <h1 className="font-serif text-2xl">Pedido realizado!</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Para confirmar, pague o sinal de <strong>{Math.round(pixPercent * 100)}%</strong> via PIX agora.
              </p>
            </div>

            <div className="rounded-xl bg-accent/10 p-4">
              <p className="text-sm text-muted-foreground">Valor do sinal ({Math.round(pixPercent * 100)}%)</p>
              <p className="text-3xl font-bold text-accent mt-1">{brl(amountDue)}</p>
              <p className="text-xs text-muted-foreground mt-1">Total do pedido: {brl(total)}</p>
            </div>

            <div className="flex flex-col items-center gap-3">
              <p className="text-sm font-medium">Escaneie o QR Code:</p>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(
                  buildPixPayload({
                    key: pixSettings?.pix_key ?? '46960905000104',
                    keyType: pixSettings?.pix_key_type ?? 'cnpj',
                    name: pixSettings?.pix_beneficiary ?? 'ELMADAN QUEIROZ SILVEIRA BENITES',
                    city: pixSettings?.pix_city ?? 'Rondonopolis',
                    amount: amountDue,
                    txid: orderId?.replace(/-/g, '').slice(0, 25) ?? 'MADAN',
                  })
                )}`}
                alt="QR Code PIX"
                className="rounded-xl border border-border"
                width={200}
                height={200}
              />
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Ou copie o código PIX:</p>
              <div className="flex gap-2">
                <input
                  readOnly
                  value={buildPixPayload({
                    key: pixSettings?.pix_key ?? '46960905000104',
                    keyType: pixSettings?.pix_key_type ?? 'cnpj',
                    name: pixSettings?.pix_beneficiary ?? 'ELMADAN QUEIROZ SILVEIRA BENITES',
                    city: pixSettings?.pix_city ?? 'Rondonopolis',
                    amount: amountDue,
                    txid: orderId?.replace(/-/g, '').slice(0, 25) ?? 'MADAN',
                  })}
                  className="flex-1 text-xs font-mono rounded-lg border border-border bg-secondary px-3 py-2 truncate"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    navigator.clipboard.writeText(buildPixPayload({
                      key: pixSettings?.pix_key ?? '46960905000104',
                      keyType: pixSettings?.pix_key_type ?? 'cnpj',
                      name: pixSettings?.pix_beneficiary ?? 'ELMADAN QUEIROZ SILVEIRA BENITES',
                      city: pixSettings?.pix_city ?? 'Rondonopolis',
                      amount: amountDue,
                      txid: orderId?.replace(/-/g, '').slice(0, 25) ?? 'MADAN',
                    }));
                    toast.success('Código copiado!');
                  }}
                >
                  <Copy className="size-4" />
                </Button>
              </div>
            </div>

            <p className="text-xs text-muted-foreground">
              Após o pagamento, nossa equipe confirmará e iniciará a produção.
              Você receberá uma notificação pelo WhatsApp.
            </p>

            <div className="space-y-3">
              <a
                href={`https://wa.me/${pixSettings?.whatsapp_number ?? '5566984266994'}?text=${encodeURIComponent(
                  `Olá! Acabei de fazer o pedido #${orderId?.slice(0, 8)} no site e realizei o pagamento do PIX de R$ ${amountDue.toFixed(2).replace('.', ',')}. Pode confirmar?`
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full rounded-full bg-[#25d366] text-white py-3 text-sm font-medium hover:opacity-90 transition-opacity"
                onClick={() => { clear(); }}
              >
                <MessageCircle className="size-4" />
                Confirmar pagamento pelo WhatsApp
              </a>
              <Button
                variant="ghost"
                className="w-full text-sm"
                onClick={() => { clear(); navigate({ to: '/conta' }); }}
              >
                Ver meus pedidos
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

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
            <Button onClick={handleCheckout} disabled={loading} size="lg" className="w-full rounded-full bg-primary hover:bg-primary/90 text-white">
              {loading ? "Processando..." : "Pagar Sinal via PIX"}
            </Button>
            <p className="text-[11px] text-muted-foreground text-center">Você verá os dados do PIX para o pagamento do sinal.</p>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
}
