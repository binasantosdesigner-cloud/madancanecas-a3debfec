import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Plus, Upload, MessageSquare } from "lucide-react";

export const Route = createFileRoute("/admin/artes")({ component: AdminArtsPage });

const STATUS: Record<string, { label: string; tone: string }> = {
  waiting: { label: "Aguardando aprovação", tone: "bg-yellow-100 text-yellow-800" },
  adjustment_requested: { label: "Ajuste solicitado", tone: "bg-blue-100 text-blue-800" },
  new_version: { label: "Nova versão enviada", tone: "bg-purple-100 text-purple-800" },
  approved: { label: "Aprovada", tone: "bg-emerald-100 text-emerald-800" },
  expired: { label: "Expirada", tone: "bg-zinc-200 text-zinc-700" },
  cancelled: { label: "Cancelada", tone: "bg-rose-100 text-rose-800" },
};

type Approval = {
  id: string; user_id: string; order_id: string | null; product_id: string | null;
  project_name: string; product_name: string | null;
  preview_image_url: string | null; download_url: string | null;
  status: keyof typeof STATUS; team_notes: string | null;
  approval_deadline: string | null; approved_at: string | null;
  created_at: string; updated_at: string;
};

type Feedback = { id: string; art_approval_id: string; user_id: string; message: string; created_at: string };

function AdminArtsPage() {
  const qc = useQueryClient();
  const { user } = useAuth();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [creating, setCreating] = useState(false);
  const [versionFor, setVersionFor] = useState<Approval | null>(null);
  const [feedbackFor, setFeedbackFor] = useState<Approval | null>(null);

  const approvals = useQuery({
    queryKey: ["admin", "art_approvals"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("art_approvals").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Approval[];
    },
  });

  const profiles = useQuery({
    queryKey: ["admin", "profiles", "minimal"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("id, full_name, email");
      if (error) throw error;
      return data ?? [];
    },
  });

  const profileById = useMemo(() => {
    const m = new Map<string, { full_name: string | null; email: string | null }>();
    for (const p of profiles.data ?? []) m.set(p.id, { full_name: p.full_name, email: p.email });
    return m;
  }, [profiles.data]);

  const filtered = (approvals.data ?? []).filter(
    (a) => statusFilter === "all" || a.status === statusFilter
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Aprovação de Artes</h1>
          <p className="text-sm text-muted-foreground">{approvals.data?.length ?? 0} projetos</p>
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-56"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os status</SelectItem>
              {Object.entries(STATUS).map(([k, v]) => (
                <SelectItem key={k} value={k}>{v.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setCreating(true)}>
            <Plus className="h-4 w-4 mr-1" />Nova aprovação
          </Button>
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Projeto</th>
                <th className="px-4 py-3">Cliente</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Prazo</th>
                <th className="px-4 py-3">Criada</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {approvals.isLoading && <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Carregando…</td></tr>}
              {!approvals.isLoading && filtered.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Nenhuma aprovação.</td></tr>
              )}
              {filtered.map((a) => {
                const p = profileById.get(a.user_id);
                const s = STATUS[a.status] ?? { label: a.status, tone: "bg-zinc-200 text-zinc-700" };
                return (
                  <tr key={a.id} className="border-t border-border">
                    <td className="px-4 py-3">
                      <div className="font-medium text-foreground">{a.project_name}</div>
                      <div className="text-xs text-muted-foreground">{a.product_name}</div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{p?.full_name || "—"}</div>
                      <div className="text-xs">{p?.email}</div>
                    </td>
                    <td className="px-4 py-3"><Badge className={s.tone}>{s.label}</Badge></td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {a.approval_deadline ? new Date(a.approval_deadline).toLocaleDateString("pt-BR") : "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(a.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => setVersionFor(a)}>
                        <Upload className="h-4 w-4 mr-1" />Nova versão
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setFeedbackFor(a)}>
                        <MessageSquare className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {creating && (
        <CreateApprovalDialog
          users={profiles.data ?? []}
          adminId={user!.id}
          onClose={() => setCreating(false)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin", "art_approvals"] });
            setCreating(false);
          }}
        />
      )}

      {versionFor && (
        <NewVersionDialog
          approval={versionFor}
          adminId={user!.id}
          onClose={() => setVersionFor(null)}
          onSaved={() => {
            qc.invalidateQueries({ queryKey: ["admin", "art_approvals"] });
            setVersionFor(null);
          }}
        />
      )}

      {feedbackFor && (
        <FeedbackDialog approval={feedbackFor} onClose={() => setFeedbackFor(null)} />
      )}
    </div>
  );
}

async function uploadArtFile(file: File, userId: string): Promise<string | null> {
  const ext = file.name.split(".").pop();
  const path = `${userId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from("art-approvals").upload(path, file);
  if (error) { toast.error(error.message); return null; }
  const { data } = await supabase.storage.from("art-approvals").createSignedUrl(path, 60 * 60 * 24 * 365);
  return data?.signedUrl ?? null;
}

function CreateApprovalDialog({
  users, adminId, onClose, onSaved,
}: {
  users: { id: string; full_name: string | null; email: string | null }[];
  adminId: string; onClose: () => void; onSaved: () => void;
}) {
  const [userId, setUserId] = useState("");
  const [projectName, setProjectName] = useState("");
  const [productName, setProductName] = useState("");
  const [deadline, setDeadline] = useState("");
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!userId || !projectName || !file) {
      toast.error("Selecione cliente, nome do projeto e mockup.");
      return;
    }
    setBusy(true);
    try {
      const url = await uploadArtFile(file, userId);
      if (!url) return;
      const { data, error } = await supabase.from("art_approvals").insert({
        user_id: userId,
        project_name: projectName,
        product_name: productName || null,
        preview_image_url: url, download_url: url,
        team_notes: notes || null,
        approval_deadline: deadline ? new Date(deadline).toISOString() : null,
        status: "waiting",
      }).select("id").single();
      if (error) throw error;
      await supabase.from("art_approval_versions").insert({
        art_approval_id: data!.id, version_number: 1,
        preview_image_url: url, download_url: url, team_notes: notes || null,
      });
      await supabase.from("art_approval_events").insert({
        art_approval_id: data!.id, event_type: "created",
        title: "Aprovação criada", description: notes || null, responsible: adminId,
      });
      toast.success("Aprovação criada");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Nova aprovação de arte</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div>
            <Label>Cliente</Label>
            <Select value={userId} onValueChange={setUserId}>
              <SelectTrigger><SelectValue placeholder="Selecionar cliente" /></SelectTrigger>
              <SelectContent>
                {users.map((u) => (
                  <SelectItem key={u.id} value={u.id}>{u.full_name || u.email || u.id}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>Nome do projeto</Label>
            <Input value={projectName} onChange={(e) => setProjectName(e.target.value)} /></div>
          <div><Label>Produto (opcional)</Label>
            <Input value={productName} onChange={(e) => setProductName(e.target.value)} /></div>
          <div><Label>Prazo para aprovação</Label>
            <Input type="date" value={deadline} onChange={(e) => setDeadline(e.target.value)} /></div>
          <div><Label>Observações da equipe</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
          <div><Label>Mockup / Arte</Label>
            <Input type="file" accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={busy}>Criar aprovação</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function NewVersionDialog({
  approval, adminId, onClose, onSaved,
}: { approval: Approval; adminId: string; onClose: () => void; onSaved: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (!file) { toast.error("Selecione o arquivo da nova versão."); return; }
    setBusy(true);
    try {
      const url = await uploadArtFile(file, approval.user_id);
      if (!url) return;
      const { data: versions } = await supabase.from("art_approval_versions")
        .select("version_number").eq("art_approval_id", approval.id)
        .order("version_number", { ascending: false }).limit(1);
      const next = (versions?.[0]?.version_number ?? 0) + 1;
      await supabase.from("art_approval_versions").insert({
        art_approval_id: approval.id, version_number: next,
        preview_image_url: url, download_url: url, team_notes: notes || null,
      });
      await supabase.from("art_approvals").update({
        preview_image_url: url, download_url: url,
        team_notes: notes || approval.team_notes, status: "new_version",
      }).eq("id", approval.id);
      await supabase.from("art_approval_events").insert({
        art_approval_id: approval.id, event_type: "new_version",
        title: `Nova versão (v${next})`, description: notes || null, responsible: adminId,
      });
      toast.success("Nova versão enviada");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader><DialogTitle>Enviar nova versão — {approval.project_name}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <div><Label>Arquivo</Label>
            <Input type="file" accept="image/*,.pdf"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)} /></div>
          <div><Label>Observações</Label>
            <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} /></div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={submit} disabled={busy}>Enviar versão</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FeedbackDialog({ approval, onClose }: { approval: Approval; onClose: () => void }) {
  const { data, isLoading } = useQuery({
    queryKey: ["admin", "art_feedback", approval.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("art_approval_feedback")
        .select("*").eq("art_approval_id", approval.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Feedback[];
    },
  });

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>Feedback do cliente — {approval.project_name}</DialogTitle></DialogHeader>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {isLoading && <p className="text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && (data?.length ?? 0) === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum feedback ainda.</p>
          )}
          {data?.map((f) => (
            <Card key={f.id} className="p-3">
              <div className="text-xs text-muted-foreground mb-1">
                {new Date(f.created_at).toLocaleString("pt-BR")}
              </div>
              <p className="text-sm whitespace-pre-wrap">{f.message}</p>
            </Card>
          ))}
        </div>
        <DialogFooter><Button onClick={onClose}>Fechar</Button></DialogFooter>
      </DialogContent>
    </Dialog>
  );
}