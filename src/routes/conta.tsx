import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { brl } from "@/lib/format";
import {
  User, Package, CreditCard, ShoppingCart, Heart, Palette, MapPin,
  Bell, Award, HelpCircle, Settings, LogOut, LayoutDashboard,
  Camera, Plus, Pencil, Trash2, Check, Brush, ArrowRight,
} from "lucide-react";
import { ArtApprovalsSection, useArtApprovals } from "@/components/account/ArtApprovalsSection";

export const Route = createFileRoute("/conta")({ component: AccountPage });

type SectionId =
  | "dashboard" | "perfil" | "pedidos" | "pagamentos" | "carrinho"
  | "favoritos" | "projetos" | "aprovacao" | "enderecos" | "notificacoes"
  | "beneficios" | "ajuda" | "config";

const MENU: { id: SectionId; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { id: "dashboard", label: "Início", icon: LayoutDashboard },
  { id: "perfil", label: "Meu Perfil", icon: User },
  { id: "pedidos", label: "Meus Pedidos", icon: Package },
  { id: "aprovacao", label: "Aprovação de Arte", icon: Brush },
  { id: "pagamentos", label: "Pagamentos", icon: CreditCard },
  { id: "carrinho", label: "Meu Carrinho", icon: ShoppingCart },
  { id: "favoritos", label: "Favoritos", icon: Heart },
  { id: "projetos", label: "Projetos Personalizados", icon: Palette },
  { id: "enderecos", label: "Endereços", icon: MapPin },
  { id: "notificacoes", label: "Notificações", icon: Bell },
  { id: "beneficios", label: "Benefícios", icon: Award },
  { id: "ajuda", label: "Central de Ajuda", icon: HelpCircle },
  { id: "config", label: "Configurações", icon: Settings },
];

const statusLabel: Record<string, string> = {
  pending: "Pendente", in_production: "Em Produção", shipped: "Enviado",
  completed: "Concluído", cancelled: "Cancelado",
};
const statusTone: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_production: "bg-blue-100 text-blue-800",
  shipped: "bg-indigo-100 text-indigo-800",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-rose-100 text-rose-800",
};

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const [section, setSection] = useState<SectionId>("dashboard");

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);
  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 py-8 lg:py-12">
        <AccountHeader onSignOut={async () => { await signOut(); navigate({ to: "/" }); }} />

        {/* Mobile tabs */}
        <nav className="lg:hidden -mx-4 sm:mx-0 mb-6 overflow-x-auto">
          <div className="flex gap-2 px-4 sm:px-0">
            {MENU.map((m) => (
              <button
                key={m.id}
                onClick={() => setSection(m.id)}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-full text-sm border transition ${
                  section === m.id
                    ? "bg-accent text-accent-foreground border-accent"
                    : "bg-card border-border text-foreground/70 hover:border-accent/50"
                }`}
              >
                <m.icon className="h-4 w-4" />
                {m.label}
              </button>
            ))}
          </div>
        </nav>

        <div className="grid lg:grid-cols-[260px_minmax(0,1fr)] gap-8">
          {/* Desktop sidebar */}
          <aside className="hidden lg:block">
            <div className="sticky top-24 rounded-2xl border border-border bg-card p-2">
              {MENU.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSection(m.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition ${
                    section === m.id
                      ? "bg-accent/10 text-accent font-medium"
                      : "text-foreground/75 hover:bg-muted/60"
                  }`}
                >
                  <m.icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{m.label}</span>
                </button>
              ))}
              <button
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-foreground/75 hover:bg-muted/60 mt-1"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Sair</span>
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            {section === "dashboard" && <DashboardSection onNavigate={setSection} />}
            {section === "perfil" && <PerfilSection />}
            {section === "pedidos" && <PedidosSection />}
            {section === "enderecos" && <EnderecosSection />}
            {section === "ajuda" && <AjudaSection />}
            {section === "carrinho" && <PlaceholderLink to="/carrinho" title="Meu Carrinho" desc="Gerencie os itens que você adicionou para finalizar a compra." cta="Abrir carrinho" />}
            {section === "favoritos" && <ComingSoon title="Favoritos" desc="Em breve você poderá salvar produtos para comprar depois." />}
            {section === "projetos" && <ComingSoon title="Projetos Personalizados" desc="Acompanhe aprovações de arte e o histórico das suas personalizações." />}
            {section === "pagamentos" && <ComingSoon title="Pagamentos" desc="Em breve: acompanhe pagamentos pendentes, recibos e histórico financeiro." />}
            {section === "notificacoes" && <ComingSoon title="Notificações" desc="Aqui aparecerão atualizações de pedidos, artes para aprovar e novidades." />}
            {section === "beneficios" && <ComingSoon title="Benefícios" desc="Programa de fidelidade Bronze, Prata e Ouro chegando em breve." />}
            {section === "config" && <ComingSoon title="Configurações" desc="Preferências de comunicação e exclusão de conta em breve." />}
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}

/* ---------------- Header ---------------- */

function AccountHeader({ onSignOut }: { onSignOut: () => void }) {
  const { user } = useAuth();
  const { profile, avatarUrl } = useProfile();
  const firstName = (profile?.full_name || user?.email || "Cliente").split(" ")[0];
  const initials = (profile?.full_name || user?.email || "C").slice(0, 2).toUpperCase();

  return (
    <header className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-4 mb-8">
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-14 w-14 shrink-0 ring-2 ring-accent/30">
          {avatarUrl && <AvatarImage src={avatarUrl} alt={firstName} />}
          <AvatarFallback className="bg-accent/10 text-accent font-semibold">{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">Olá, 👋</p>
          <h1 className="font-serif text-2xl sm:text-3xl truncate">{firstName}</h1>
        </div>
      </div>
      <Button variant="outline" onClick={onSignOut} className="hidden sm:inline-flex">
        <LogOut className="h-4 w-4 mr-2" /> Sair
      </Button>
    </header>
  );
}

/* ---------------- Profile hook ---------------- */

function useProfile() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const { data: profile } = useQuery({
    enabled: !!user,
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle();
      return data;
    },
  });

  useEffect(() => {
    let active = true;
    (async () => {
      if (!profile?.avatar_url) { setAvatarUrl(null); return; }
      const { data } = await supabase.storage.from("avatars").createSignedUrl(profile.avatar_url, 3600);
      if (active) setAvatarUrl(data?.signedUrl ?? null);
    })();
    return () => { active = false; };
  }, [profile?.avatar_url]);

  const refresh = () => qc.invalidateQueries({ queryKey: ["profile", user?.id] });
  return { profile, avatarUrl, refresh };
}

/* ---------------- Dashboard ---------------- */

function DashboardSection({ onNavigate }: { onNavigate: (s: SectionId) => void }) {
  const { user } = useAuth();
  const { data: orders } = useQuery({
    enabled: !!user,
    queryKey: ["orders", user?.id],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });
  const active = orders?.filter((o: any) => !["completed", "cancelled"].includes(o.status)) ?? [];
  const total = orders?.reduce((s: number, o: any) => s + Number(o.total || 0), 0) ?? 0;

  const cards = [
    { label: "Pedidos em andamento", value: active.length, icon: Package, onClick: () => onNavigate("pedidos") },
    { label: "Total de pedidos", value: orders?.length ?? 0, icon: ShoppingCart, onClick: () => onNavigate("pedidos") },
    { label: "Total gasto", value: brl(total), icon: Award, onClick: () => onNavigate("beneficios") },
    { label: "Endereços salvos", value: "—", icon: MapPin, onClick: () => onNavigate("enderecos") },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c) => (
          <button
            key={c.label}
            onClick={c.onClick}
            className="text-left rounded-2xl border border-border bg-card p-5 hover:border-accent/50 transition group"
          >
            <c.icon className="h-5 w-5 text-accent mb-3" />
            <p className="text-2xl font-semibold">{c.value}</p>
            <p className="text-xs text-muted-foreground mt-1">{c.label}</p>
          </button>
        ))}
      </div>

      <SectionCard title="Pedidos recentes" action={<button onClick={() => onNavigate("pedidos")} className="text-sm text-accent hover:underline">Ver todos</button>}>
        {(orders?.length ?? 0) === 0 ? (
          <EmptyState text="Você ainda não fez nenhum pedido." ctaTo="/produtos" ctaText="Ver produtos" />
        ) : (
          <div className="space-y-3">
            {orders!.slice(0, 3).map((o: any) => <OrderRow key={o.id} order={o} compact />)}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

/* ---------------- Perfil ---------------- */

function PerfilSection() {
  const { user } = useAuth();
  const { profile, avatarUrl, refresh } = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState({ full_name: "", phone: "", cpf: "" });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (profile) setForm({
      full_name: profile.full_name ?? "",
      phone: profile.phone ?? "",
      cpf: (profile as any).cpf ?? "",
    });
  }, [profile]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("profiles").update(form).eq("id", user!.id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Perfil atualizado"); refresh(); },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  const onUpload = async (file: File) => {
    if (!user) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "jpg";
      const path = `${user.id}/avatar.${ext}`;
      const { error: upErr } = await supabase.storage.from("avatars").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { error } = await supabase.from("profiles").update({ avatar_url: path }).eq("id", user.id);
      if (error) throw error;
      toast.success("Foto atualizada");
      refresh();
    } catch (e: any) {
      toast.error(e.message ?? "Erro no upload");
    } finally { setUploading(false); }
  };

  const resetPassword = async () => {
    if (!user?.email) return;
    const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
      redirectTo: `${window.location.origin}/login`,
    });
    if (error) toast.error(error.message); else toast.success("Enviamos um e-mail para redefinir sua senha.");
  };

  return (
    <SectionCard title="Meu Perfil">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 pb-6 border-b border-border">
        <div className="relative w-fit">
          <Avatar className="h-24 w-24 ring-2 ring-accent/30">
            {avatarUrl && <AvatarImage src={avatarUrl} />}
            <AvatarFallback className="text-xl bg-accent/10 text-accent">
              {(form.full_name || user?.email || "C").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="absolute -bottom-1 -right-1 h-9 w-9 rounded-full bg-accent text-accent-foreground grid place-items-center shadow hover:opacity-90"
            aria-label="Alterar foto"
          >
            <Camera className="h-4 w-4" />
          </button>
          <input
            ref={fileRef} type="file" accept="image/*" className="hidden"
            onChange={(e) => { const f = e.target.files?.[0]; if (f) onUpload(f); }}
          />
        </div>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">{uploading ? "Enviando foto..." : "Clique no ícone para alterar sua foto"}</p>
          <p className="text-sm mt-1 truncate">{user?.email}</p>
        </div>
      </div>

      <form
        className="grid sm:grid-cols-2 gap-4 pt-6"
        onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
      >
        <Field label="Nome completo">
          <Input value={form.full_name} onChange={(e) => setForm(f => ({ ...f, full_name: e.target.value }))} maxLength={120} />
        </Field>
        <Field label="E-mail">
          <Input value={user?.email ?? ""} disabled />
        </Field>
        <Field label="Telefone">
          <Input value={form.phone} onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))} maxLength={20} placeholder="(00) 00000-0000" />
        </Field>
        <Field label="CPF">
          <Input value={form.cpf} onChange={(e) => setForm(f => ({ ...f, cpf: e.target.value }))} maxLength={14} placeholder="000.000.000-00" />
        </Field>
        <div className="sm:col-span-2 flex flex-wrap gap-3 pt-2">
          <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar alterações"}</Button>
          <Button type="button" variant="outline" onClick={resetPassword}>Alterar senha</Button>
        </div>
      </form>
    </SectionCard>
  );
}

/* ---------------- Pedidos ---------------- */

function PedidosSection() {
  const { user } = useAuth();
  const { data: orders, isLoading } = useQuery({
    enabled: !!user,
    queryKey: ["orders", user?.id],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  if (isLoading) return <SkeletonCard />;
  return (
    <SectionCard title="Meus Pedidos">
      {(orders?.length ?? 0) === 0 ? (
        <EmptyState text="Você ainda não fez nenhum pedido." ctaTo="/produtos" ctaText="Ver produtos" />
      ) : (
        <div className="space-y-4">{orders!.map((o: any) => <OrderRow key={o.id} order={o} />)}</div>
      )}
    </SectionCard>
  );
}

const TIMELINE = ["pending", "in_production", "shipped", "completed"] as const;
function OrderRow({ order, compact }: { order: any; compact?: boolean }) {
  const idx = TIMELINE.indexOf(order.status);
  return (
    <div className="p-5 border border-border rounded-xl bg-background">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Pedido #{order.id.slice(0, 8)}</p>
          <p className="text-sm mt-0.5">{new Date(order.created_at).toLocaleDateString("pt-BR")}</p>
        </div>
        <Badge className={`shrink-0 ${statusTone[order.status] ?? ""}`} variant="secondary">
          {statusLabel[order.status] ?? order.status}
        </Badge>
      </div>
      {!compact && (
        <div className="mt-4 text-sm text-muted-foreground space-y-0.5">
          {(order.items as any[]).map((i: any, k: number) => <div key={k}>{i.quantity}x {i.title}</div>)}
        </div>
      )}
      {!compact && idx >= 0 && order.status !== "cancelled" && (
        <div className="mt-5 flex items-center gap-1">
          {TIMELINE.map((s, i) => (
            <div key={s} className="flex-1 flex items-center gap-1">
              <div className={`h-2 flex-1 rounded-full ${i <= idx ? "bg-accent" : "bg-muted"}`} />
              {i === TIMELINE.length - 1 && i <= idx && <Check className="h-3 w-3 text-accent" />}
            </div>
          ))}
        </div>
      )}
      <div className="mt-4 flex flex-wrap justify-between gap-3 border-t border-border pt-4">
        <span className="text-sm text-muted-foreground">Total</span>
        <span className="font-semibold">{brl(Number(order.total))}</span>
      </div>
    </div>
  );
}

/* ---------------- Endereços ---------------- */

type Address = {
  id: string; user_id: string; label: string | null; recipient: string | null;
  cep: string; street: string; number: string; complement: string | null;
  neighborhood: string; city: string; state: string; is_default: boolean;
};
const blankAddress = {
  label: "", recipient: "", cep: "", street: "", number: "",
  complement: "", neighborhood: "", city: "", state: "", is_default: false,
};

function EnderecosSection() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Address | null>(null);

  const { data: addresses } = useQuery({
    enabled: !!user,
    queryKey: ["addresses", user?.id],
    queryFn: async () => (await supabase.from("addresses").select("*").order("is_default", { ascending: false })).data as Address[] ?? [],
  });

  const remove = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("addresses").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { toast.success("Endereço removido"); qc.invalidateQueries({ queryKey: ["addresses", user?.id] }); },
  });

  const setDefault = useMutation({
    mutationFn: async (id: string) => {
      await supabase.from("addresses").update({ is_default: false }).eq("user_id", user!.id);
      const { error } = await supabase.from("addresses").update({ is_default: true }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => { toast.success("Endereço padrão atualizado"); qc.invalidateQueries({ queryKey: ["addresses", user?.id] }); },
  });

  return (
    <SectionCard
      title="Endereços"
      action={
        <Button size="sm" onClick={() => { setEditing(null); setOpen(true); }}>
          <Plus className="h-4 w-4 mr-1" /> Novo
        </Button>
      }
    >
      {(addresses?.length ?? 0) === 0 ? (
        <EmptyState text="Você ainda não cadastrou endereços." />
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {addresses!.map((a) => (
            <div key={a.id} className="p-4 border border-border rounded-xl bg-background">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-medium truncate">{a.label || "Endereço"}</p>
                  {a.is_default && <Badge variant="secondary" className="bg-accent/10 text-accent mt-1">Padrão</Badge>}
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(a); setOpen(true); }}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove.mutate(a.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
              <p className="text-sm text-muted-foreground mt-2">{a.street}, {a.number}{a.complement ? ` - ${a.complement}` : ""}</p>
              <p className="text-sm text-muted-foreground">{a.neighborhood} — {a.city}/{a.state}</p>
              <p className="text-xs text-muted-foreground mt-1">CEP {a.cep}</p>
              {!a.is_default && (
                <button onClick={() => setDefault.mutate(a.id)} className="text-xs text-accent hover:underline mt-3">
                  Definir como padrão
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <AddressDialog open={open} onOpenChange={setOpen} editing={editing} />
    </SectionCard>
  );
}

function AddressDialog({ open, onOpenChange, editing }: { open: boolean; onOpenChange: (v: boolean) => void; editing: Address | null }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(blankAddress);

  useEffect(() => {
    if (open) {
      setForm(editing ? {
        label: editing.label ?? "", recipient: editing.recipient ?? "", cep: editing.cep,
        street: editing.street, number: editing.number, complement: editing.complement ?? "",
        neighborhood: editing.neighborhood, city: editing.city, state: editing.state,
        is_default: editing.is_default,
      } : blankAddress);
    }
  }, [open, editing]);

  const save = useMutation({
    mutationFn: async () => {
      const payload: any = { ...form, user_id: user!.id };
      if (editing) {
        const { error } = await supabase.from("addresses").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("addresses").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success(editing ? "Endereço atualizado" : "Endereço cadastrado");
      qc.invalidateQueries({ queryKey: ["addresses", user?.id] });
      onOpenChange(false);
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao salvar"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? "Editar endereço" : "Novo endereço"}</DialogTitle></DialogHeader>
        <form
          className="grid grid-cols-2 gap-3"
          onSubmit={(e) => { e.preventDefault(); save.mutate(); }}
        >
          <Field label="Apelido" className="col-span-2">
            <Input value={form.label} maxLength={50} onChange={(e) => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Casa, Trabalho..." />
          </Field>
          <Field label="CEP"><Input required value={form.cep} maxLength={9} onChange={(e) => setForm(f => ({ ...f, cep: e.target.value }))} /></Field>
          <Field label="Estado"><Input required value={form.state} maxLength={2} onChange={(e) => setForm(f => ({ ...f, state: e.target.value.toUpperCase() }))} /></Field>
          <Field label="Rua" className="col-span-2"><Input required value={form.street} maxLength={120} onChange={(e) => setForm(f => ({ ...f, street: e.target.value }))} /></Field>
          <Field label="Número"><Input required value={form.number} maxLength={20} onChange={(e) => setForm(f => ({ ...f, number: e.target.value }))} /></Field>
          <Field label="Complemento"><Input value={form.complement} maxLength={60} onChange={(e) => setForm(f => ({ ...f, complement: e.target.value }))} /></Field>
          <Field label="Bairro"><Input required value={form.neighborhood} maxLength={80} onChange={(e) => setForm(f => ({ ...f, neighborhood: e.target.value }))} /></Field>
          <Field label="Cidade"><Input required value={form.city} maxLength={80} onChange={(e) => setForm(f => ({ ...f, city: e.target.value }))} /></Field>
          <label className="col-span-2 flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.is_default} onChange={(e) => setForm(f => ({ ...f, is_default: e.target.checked }))} />
            Definir como endereço padrão
          </label>
          <DialogFooter className="col-span-2 mt-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
            <Button type="submit" disabled={save.isPending}>{save.isPending ? "Salvando..." : "Salvar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ---------------- Ajuda ---------------- */

function AjudaSection() {
  const links = [
    { to: "/politica-de-trocas", label: "Política de Trocas e Devoluções" },
    { to: "/cuidados-com-os-produtos", label: "Como cuidar dos produtos" },
    { to: "/perguntas-frequentes", label: "Perguntas Frequentes" },
    { to: "/sobre-nos", label: "Sobre a Madan" },
  ];
  return (
    <SectionCard title="Central de Ajuda">
      <div className="grid sm:grid-cols-2 gap-3">
        {links.map((l) => (
          <Link key={l.to} to={l.to} className="p-4 rounded-xl border border-border bg-background hover:border-accent/50 transition flex items-center justify-between gap-3">
            <span className="text-sm">{l.label}</span>
            <HelpCircle className="h-4 w-4 text-accent shrink-0" />
          </Link>
        ))}
      </div>
    </SectionCard>
  );
}

/* ---------------- Reusable ---------------- */

function SectionCard({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="font-serif text-2xl">{title}</h2>
        {action}
      </div>
      {children}
    </div>
  );
}

function Field({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`space-y-1.5 ${className ?? ""}`}>
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}

function EmptyState({ text, ctaTo, ctaText }: { text: string; ctaTo?: string; ctaText?: string }) {
  return (
    <div className="text-center py-10 border border-dashed border-border rounded-xl">
      <p className="text-muted-foreground">{text}</p>
      {ctaTo && ctaText && (
        <Link to={ctaTo} className="inline-block mt-4"><Button>{ctaText}</Button></Link>
      )}
    </div>
  );
}

function ComingSoon({ title, desc }: { title: string; desc: string }) {
  return (
    <SectionCard title={title}>
      <div className="py-10 text-center">
        <p className="text-muted-foreground max-w-md mx-auto">{desc}</p>
        <Badge variant="secondary" className="mt-4 bg-accent/10 text-accent">Em breve</Badge>
      </div>
    </SectionCard>
  );
}

function PlaceholderLink({ to, title, desc, cta }: { to: string; title: string; desc: string; cta: string }) {
  return (
    <SectionCard title={title}>
      <div className="py-10 text-center">
        <p className="text-muted-foreground max-w-md mx-auto">{desc}</p>
        <Link to={to} className="inline-block mt-4"><Button>{cta}</Button></Link>
      </div>
    </SectionCard>
  );
}

function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-border bg-card p-8 space-y-3">
      {[...Array(3)].map((_, i) => <div key={i} className="h-16 rounded-lg bg-muted/60 animate-pulse" />)}
    </div>
  );
}
