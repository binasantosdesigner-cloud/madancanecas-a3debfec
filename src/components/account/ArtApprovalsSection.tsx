import { useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  ArrowLeft, Check, Download, ImageOff, Maximize2, Pencil, Paperclip,
  CheckCircle2, Clock, MessageCircle,
} from "lucide-react";

const WHATSAPP_URL = "https://wa.me/5566984266994";

const STATUS = {
  waiting: { label: "Aguardando aprovação", tone: "bg-yellow-100 text-yellow-800" },
  adjustment_requested: { label: "Ajuste solicitado", tone: "bg-blue-100 text-blue-800" },
  new_version: { label: "Nova versão enviada", tone: "bg-purple-100 text-purple-800" },
  approved: { label: "Arte aprovada", tone: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Expirada", tone: "bg-zinc-200 text-zinc-700" },
  cancelled: { label: "Cancelada", tone: "bg-rose-100 text-rose-800" },
} as const;
type Status = keyof typeof STATUS;

export type ArtApproval = {
  id: string; user_id: string; order_id: string | null; product_id: string | null;
  project_name: string; product_name: string | null;
  preview_image_url: string | null; download_url: string | null;
  status: Status; team_notes: string | null;
  approval_deadline: string | null; approved_at: string | null;
  created_at: string; updated_at: string;
};

export function useArtApprovals() {
  const { user } = useAuth();
  return useQuery({
    enabled: !!user,
    queryKey: ["art_approvals", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("art_approvals").select("*")
        .order("created_at", { ascending: false });
      return (data ?? []) as ArtApproval[];
    },
  });
}

export function ArtApprovalsSection() {
  const { data: approvals, isLoading } = useArtApprovals();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = approvals?.find((a) => a.id === selectedId) ?? null;

  if (selected) return <ArtApprovalDetail item={selected} onBack={() => setSelectedId(null)} />;

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="font-serif text-2xl">Aprovação de Arte</h2>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[...Array(2)].map((_, i) => <div key={i} className="h-32 rounded-xl bg-muted/60 animate-pulse" />)}
        </div>
      ) : (approvals?.length ?? 0) === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl">
          <p className="text-muted-foreground">Você ainda não possui nenhuma arte aguardando aprovação.</p>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 gap-4">
          {approvals!
            .slice()
            .sort((a, b) => Number(isPending(b.status)) - Number(isPending(a.status)))
            .map((a) => <ApprovalCard key={a.id} item={a} onOpen={() => setSelectedId(a.id)} />)}
        </div>
      )}
    </div>
  );
}

function ApprovalCard({ item, onOpen }: { item: ArtApproval; onOpen: () => void }) {
  const s = STATUS[item.status];
  const pending = isPending(item.status);
  return (
    <button
      onClick={onOpen}
      className={`text-left rounded-2xl border bg-background overflow-hidden hover:border-accent/60 transition ${
        pending ? "border-accent/40 ring-1 ring-accent/20" : "border-border"
      }`}
    >
      <div className="aspect-[4/3] bg-muted grid place-items-center overflow-hidden">
        {item.preview_image_url ? (
          <img src={item.preview_image_url} alt={item.project_name} className="w-full h-full object-cover" />
        ) : (
          <ImageOff className="h-8 w-8 text-muted-foreground" />
        )}
      </div>
      <div className="p-4 space-y-2">
        <div className="flex items-start justify-between gap-2">
          <p className="font-medium truncate">{item.project_name}</p>
          <Badge className={`shrink-0 ${s.tone}`} variant="secondary">{s.label}</Badge>
        </div>
        <div className="text-xs text-muted-foreground space-y-0.5">
          {item.product_name && <p>Produto: {item.product_name}</p>}
          {item.order_id && <p>Pedido #{item.order_id.slice(0, 8)}</p>}
          <p>Enviada em {fmtDate(item.created_at)}</p>
          {item.approval_deadline && pending && (
            <p className="text-accent flex items-center gap-1">
              <Clock className="h-3 w-3" /> Aprovar até {fmtDate(item.approval_deadline)}
            </p>
          )}
        </div>
      </div>
    </button>
  );
}

function ArtApprovalDetail({ item, onBack }: { item: ArtApproval; onBack: () => void }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const s = STATUS[item.status];
  const canApprove = item.status === "waiting" || item.status === "new_version";
  const isApproved = item.status === "approved";
  const isExpired = item.status === "expired";

  const [approveOpen, setApproveOpen] = useState(false);
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [zoom, setZoom] = useState(false);

  const { data: versions } = useQuery({
    queryKey: ["art_versions", item.id],
    queryFn: async () => (await supabase
      .from("art_approval_versions").select("*").eq("art_approval_id", item.id)
      .order("version_number", { ascending: true })).data ?? [],
  });
  const { data: events } = useQuery({
    queryKey: ["art_events", item.id],
    queryFn: async () => (await supabase
      .from("art_approval_events").select("*").eq("art_approval_id", item.id)
      .order("created_at", { ascending: true })).data ?? [],
  });
  const { data: feedback } = useQuery({
    queryKey: ["art_feedback", item.id],
    queryFn: async () => (await supabase
      .from("art_approval_feedback").select("*").eq("art_approval_id", item.id)
      .order("created_at", { ascending: true })).data ?? [],
  });

  const refreshAll = () => {
    qc.invalidateQueries({ queryKey: ["art_approvals", user?.id] });
    qc.invalidateQueries({ queryKey: ["art_events", item.id] });
    qc.invalidateQueries({ queryKey: ["art_feedback", item.id] });
  };

  return (
    <div className="space-y-4 pb-28 lg:pb-0">
      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-foreground/70 hover:text-accent">
        <ArrowLeft className="h-4 w-4" /> Voltar para artes
      </button>

      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="relative bg-muted">
          {item.preview_image_url ? (
            <img src={item.preview_image_url} alt={item.project_name} className="w-full max-h-[520px] object-contain bg-background" />
          ) : (
            <div className="aspect-[4/3] grid place-items-center"><ImageOff className="h-10 w-10 text-muted-foreground" /></div>
          )}
          {item.preview_image_url && (
            <div className="absolute top-3 right-3 flex gap-2">
              <Button size="icon" variant="secondary" onClick={() => setZoom(true)} aria-label="Tela cheia">
                <Maximize2 className="h-4 w-4" />
              </Button>
              <a href={item.download_url || item.preview_image_url} target="_blank" rel="noreferrer">
                <Button size="icon" variant="secondary" aria-label="Baixar prévia"><Download className="h-4 w-4" /></Button>
              </a>
            </div>
          )}
        </div>

        <div className="p-6 space-y-4">
          <div className="grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-start">
            <div className="min-w-0">
              <h2 className="font-serif text-2xl truncate">{item.project_name}</h2>
              <div className="text-sm text-muted-foreground mt-1 space-y-0.5">
                {item.product_name && <p>Produto: {item.product_name}</p>}
                {item.order_id && <p>Pedido #{item.order_id.slice(0, 8)}</p>}
                <p>Enviada em {fmtDate(item.created_at)}</p>
                {item.approval_deadline && <p>Prazo: {fmtDate(item.approval_deadline)}</p>}
                {item.approved_at && <p>Aprovada em {fmtDate(item.approved_at)}</p>}
              </div>
            </div>
            <div className="flex flex-col items-end gap-2 shrink-0">
              <Badge className={s.tone} variant="secondary">{s.label}</Badge>
              {isApproved && (
                <Badge variant="secondary" className="bg-accent/10 text-accent">
                  <CheckCircle2 className="h-3 w-3 mr-1" /> Aprovado pelo cliente
                </Badge>
              )}
            </div>
          </div>

          {item.team_notes && (
            <div className="rounded-xl bg-muted/50 p-4 text-sm">
              <p className="text-xs uppercase tracking-wide text-muted-foreground mb-1">Observações da equipe Madan</p>
              <p>{item.team_notes}</p>
            </div>
          )}

          <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm text-foreground/80">
            Confira cuidadosamente nomes, frases, datas, cores, imagens e posicionamento da arte. Após a aprovação, o produto seguirá para produção conforme a arte aprovada.
          </div>

          {/* Desktop actions */}
          <div className="hidden lg:flex gap-3 pt-2">
            <ActionButtons
              item={item} canApprove={canApprove} isExpired={isExpired} isApproved={isApproved}
              onApprove={() => setApproveOpen(true)} onAdjust={() => setAdjustOpen(true)}
            />
          </div>
        </div>
      </div>

      {(versions?.length ?? 0) > 1 && (
        <SectionPanel title="Versões anteriores">
          <div className="flex gap-3 overflow-x-auto pb-1">
            {versions!.map((v: any) => (
              <div key={v.id} className="shrink-0 w-32">
                <div className="aspect-square rounded-lg overflow-hidden bg-muted">
                  {v.preview_image_url
                    ? <img src={v.preview_image_url} className="w-full h-full object-cover" />
                    : <div className="w-full h-full grid place-items-center"><ImageOff className="h-5 w-5 text-muted-foreground" /></div>}
                </div>
                <p className="text-xs text-muted-foreground mt-1">v{v.version_number} · {fmtDate(v.created_at)}</p>
              </div>
            ))}
          </div>
        </SectionPanel>
      )}

      <SectionPanel title="Histórico">
        <Timeline events={events ?? []} feedback={feedback ?? []} item={item} />
      </SectionPanel>

      {/* Mobile fixed action bar */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-card border-t border-border p-3 flex gap-2 safe-area">
        <ActionButtons
          item={item} canApprove={canApprove} isExpired={isExpired} isApproved={isApproved}
          onApprove={() => setApproveOpen(true)} onAdjust={() => setAdjustOpen(true)}
          compact
        />
      </div>

      <ApproveDialog open={approveOpen} onOpenChange={setApproveOpen} item={item} onDone={refreshAll} />
      <AdjustDialog open={adjustOpen} onOpenChange={setAdjustOpen} item={item} onDone={refreshAll} />

      {zoom && item.preview_image_url && (
        <div className="fixed inset-0 z-50 bg-black/90 grid place-items-center p-4" onClick={() => setZoom(false)}>
          <img src={item.preview_image_url} className="max-w-full max-h-full object-contain" alt={item.project_name} />
        </div>
      )}
    </div>
  );
}

function ActionButtons({
  item, canApprove, isExpired, isApproved, onApprove, onAdjust, compact,
}: {
  item: ArtApproval; canApprove: boolean; isExpired: boolean; isApproved: boolean;
  onApprove: () => void; onAdjust: () => void; compact?: boolean;
}) {
  if (isExpired) {
    return (
      <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="flex-1">
        <Button className="w-full bg-[#25d366] hover:bg-[#25d366]/90 text-white">
          <MessageCircle className="h-4 w-4 mr-2" /> Falar com a Madan no WhatsApp
        </Button>
      </a>
    );
  }
  if (isApproved) {
    return <div className="text-sm text-muted-foreground">Esta arte já foi aprovada e está em produção.</div>;
  }
  return (
    <>
      <Button onClick={onApprove} disabled={!canApprove} className="flex-1">
        <Check className="h-4 w-4 mr-2" />
        {compact ? "Aprovar" : "Aprovar arte e liberar produção"}
      </Button>
      <Button onClick={onAdjust} variant="outline" disabled={item.status === "adjustment_requested"} className="flex-1 border-accent text-accent hover:bg-accent/10 hover:text-accent">
        <Pencil className="h-4 w-4 mr-2" />
        {compact ? "Ajuste" : "Solicitar ajuste"}
      </Button>
    </>
  );
}

/* ---------- Approve dialog ---------- */

function ApproveDialog({ open, onOpenChange, item, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; item: ArtApproval; onDone: () => void;
}) {
  const [confirmed, setConfirmed] = useState(false);
  useEffect(() => { if (open) setConfirmed(false); }, [open]);

  const approve = useMutation({
    mutationFn: async () => {
      const now = new Date().toISOString();
      const { error } = await supabase.from("art_approvals")
        .update({ status: "approved", approved_at: now })
        .eq("id", item.id);
      if (error) throw error;
      await supabase.from("art_approval_events").insert({
        art_approval_id: item.id, event_type: "approved",
        title: "Cliente aprovou a arte",
        description: "Pedido liberado para produção conforme a prévia apresentada.",
        responsible: "client",
      });
      if (item.order_id) {
        await supabase.from("orders").update({ status: "in_production" }).eq("id", item.order_id);
      }
    },
    onSuccess: () => {
      toast.success("Arte aprovada com sucesso! Seu pedido seguirá para produção.");
      onOpenChange(false); onDone();
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao aprovar"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Confirmar aprovação</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          Você confirma que revisou todos os detalhes da arte e autoriza a produção do produto personalizado conforme a prévia apresentada?
        </p>
        <label className="flex items-start gap-2 text-sm">
          <Checkbox checked={confirmed} onCheckedChange={(v) => setConfirmed(!!v)} className="mt-0.5" />
          <span>Confirmo que revisei nomes, textos, imagens, cores e posicionamento da arte.</span>
        </label>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={!confirmed || approve.isPending} onClick={() => approve.mutate()}>
            {approve.isPending ? "Aprovando..." : "Confirmar aprovação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Adjust dialog ---------- */

function AdjustDialog({ open, onOpenChange, item, onDone }: {
  open: boolean; onOpenChange: (v: boolean) => void; item: ArtApproval; onDone: () => void;
}) {
  const { user } = useAuth();
  const fileRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => { if (open) { setMessage(""); setFile(null); } }, [open]);

  const send = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sessão expirada");
      if (!message.trim()) throw new Error("Descreva o ajuste desejado");
      let reference_file_url: string | null = null;
      if (file) {
        const ext = file.name.split(".").pop() || "bin";
        const path = `${user.id}/${item.id}/${Date.now()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("art-approvals")
          .upload(path, file, { contentType: file.type });
        if (upErr) throw upErr;
        reference_file_url = path;
      }
      const { error: fErr } = await supabase.from("art_approval_feedback").insert({
        art_approval_id: item.id, user_id: user.id, message: message.trim(), reference_file_url,
      });
      if (fErr) throw fErr;
      const { error: sErr } = await supabase.from("art_approvals")
        .update({ status: "adjustment_requested" }).eq("id", item.id);
      if (sErr) throw sErr;
      await supabase.from("art_approval_events").insert({
        art_approval_id: item.id, event_type: "adjustment_requested",
        title: "Cliente solicitou ajuste", description: message.trim().slice(0, 280),
        responsible: "client",
      });
    },
    onSuccess: () => {
      toast.success("Solicitação enviada! Nossa equipe revisará sua mensagem e enviará uma nova versão da arte.");
      onOpenChange(false); onDone();
    },
    onError: (e: any) => toast.error(e.message ?? "Erro ao enviar"),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader><DialogTitle>Solicitar ajuste na arte</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <Textarea
            value={message} onChange={(e) => setMessage(e.target.value)} rows={5} maxLength={1000}
            placeholder="Exemplo: trocar o nome para Ana Clara, aumentar o tamanho da frase, mudar a cor para rosa, centralizar a imagem etc."
          />
          <div>
            <input
              ref={fileRef} type="file" accept=".png,.jpg,.jpeg,.pdf,.svg,image/*,application/pdf"
              className="hidden" onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()}>
              <Paperclip className="h-4 w-4 mr-2" /> {file ? file.name : "Anexar arquivo de referência (opcional)"}
            </Button>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button disabled={send.isPending || !message.trim()} onClick={() => send.mutate()}>
            {send.isPending ? "Enviando..." : "Enviar solicitação"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/* ---------- Timeline ---------- */

function Timeline({ events, feedback, item }: { events: any[]; feedback: any[]; item: ArtApproval }) {
  const merged = useMemo(() => {
    const base = events.map((e) => ({
      id: `e-${e.id}`, when: e.created_at, title: e.title,
      description: e.description as string | null, who: e.responsible as string,
    }));
    const fb = feedback.map((f) => ({
      id: `f-${f.id}`, when: f.created_at, title: "Mensagem do cliente",
      description: f.message as string, who: "client",
    }));
    const seed = [{ id: "seed", when: item.created_at, title: "Projeto personalizado criado", description: null, who: "team" }];
    return [...seed, ...base, ...fb].sort((a, b) => +new Date(a.when) - +new Date(b.when));
  }, [events, feedback, item.created_at]);

  return (
    <ol className="relative border-l border-border ml-2 space-y-5">
      {merged.map((e) => (
        <li key={e.id} className="pl-5 relative">
          <span className="absolute -left-[6px] top-1.5 h-3 w-3 rounded-full bg-accent" />
          <p className="text-sm font-medium">{e.title}</p>
          {e.description && <p className="text-sm text-muted-foreground mt-0.5">{e.description}</p>}
          <p className="text-xs text-muted-foreground mt-1">
            {fmtDateTime(e.when)} · {e.who === "client" ? "Cliente" : "Equipe Madan"}
          </p>
        </li>
      ))}
    </ol>
  );
}

function SectionPanel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <h3 className="font-serif text-lg mb-4">{title}</h3>
      {children}
    </div>
  );
}

/* ---------- helpers ---------- */

function isPending(s: Status) {
  return s === "waiting" || s === "new_version" || s === "adjustment_requested";
}
function fmtDate(s: string) {
  return new Date(s).toLocaleDateString("pt-BR");
}
function fmtDateTime(s: string) {
  return new Date(s).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
}