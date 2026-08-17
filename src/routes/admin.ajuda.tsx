import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, GripVertical, Eye, EyeOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/admin/ajuda")({ component: AdminAjuda });

type Topic = {
  id: string;
  title: string;
  content: string;
  display_order: number;
  active: boolean;
};

function AdminAjuda() {
  const qc = useQueryClient();
  const [editingTopic, setEditingTopic] = useState<Topic | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Topic | null>(null);
  const [form, setForm] = useState({ title: "", content: "" });
  const [saving, setSaving] = useState(false);

  const { data: topics = [], isLoading } = useQuery({
    queryKey: ["help_topics_admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("help_topics")
        .select("*")
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Topic[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["help_topics_admin"] });
    qc.invalidateQueries({ queryKey: ["help_topics"] });
  };

  const openCreate = () => {
    setForm({ title: "", content: "" });
    setEditingTopic(null);
    setIsCreating(true);
  };

  const openEdit = (t: Topic) => {
    setForm({ title: t.title, content: t.content });
    setEditingTopic(t);
    setIsCreating(true);
  };

  const save = async () => {
    if (!form.title.trim()) { toast.error("Informe o título"); return; }
    if (!form.content.trim()) { toast.error("Informe o conteúdo"); return; }
    setSaving(true);
    try {
      if (editingTopic) {
        const { error } = await supabase
          .from("help_topics")
          .update({ title: form.title, content: form.content })
          .eq("id", editingTopic.id);
        if (error) throw error;
        toast.success("Tópico atualizado!");
      } else {
        const maxOrder = topics.length > 0 ? Math.max(...topics.map((t) => t.display_order)) + 1 : 1;
        const { error } = await supabase
          .from("help_topics")
          .insert({ title: form.title, content: form.content, display_order: maxOrder });
        if (error) throw error;
        toast.success("Tópico criado!");
      }
      setIsCreating(false);
      setEditingTopic(null);
      invalidate();
    } catch (e) {
      toast.error("Erro: " + (e instanceof Error ? e.message : "falha ao salvar"));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (t: Topic) => {
    const { error } = await supabase
      .from("help_topics")
      .update({ active: !t.active })
      .eq("id", t.id);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success(t.active ? "Tópico ocultado" : "Tópico ativado");
    invalidate();
  };

  const deleteTopic = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("help_topics").delete().eq("id", deleteTarget.id);
    if (error) { toast.error("Erro: " + error.message); return; }
    toast.success("Tópico excluído");
    setDeleteTarget(null);
    invalidate();
  };

  const moveOrder = async (id: string, direction: "up" | "down") => {
    const idx = topics.findIndex((t) => t.id === id);
    const swapIdx = direction === "up" ? idx - 1 : idx + 1;
    if (idx < 0 || swapIdx < 0 || swapIdx >= topics.length) return;
    const a = topics[idx];
    const b = topics[swapIdx];
    await Promise.all([
      supabase.from("help_topics").update({ display_order: b.display_order }).eq("id", a.id),
      supabase.from("help_topics").update({ display_order: a.display_order }).eq("id", b.id),
    ]);
    invalidate();
  };

  return (
    <div className="p-6 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-serif text-3xl">Central de Ajuda</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Gerencie os tópicos exibidos para os clientes
          </p>
        </div>
        <Button onClick={openCreate} className="gap-2 rounded-full" style={{ background: "#e8509a" }}>
          <Plus className="size-4" /> Novo tópico
        </Button>
      </div>

      {isCreating && (
        <div className="mb-8 rounded-2xl border-2 border-[#e8509a]/30 bg-[#fce8f3]/10 p-6 space-y-4">
          <h2 className="text-base font-semibold">
            {editingTopic ? "Editar tópico" : "Novo tópico"}
          </h2>
          <div className="space-y-1.5">
            <Label>Título</Label>
            <Input
              value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
              placeholder="Ex: Política de Trocas"
            />
          </div>
          <div className="space-y-1.5">
            <Label>Conteúdo</Label>
            <Textarea
              value={form.content}
              onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
              placeholder="Escreva o conteúdo do tópico..."
              rows={8}
              className="resize-y font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Use linhas em branco para separar parágrafos. O texto aparece exatamente como digitado.
            </p>
          </div>
          <div className="flex gap-3 pt-1">
            <Button onClick={save} disabled={saving} className="gap-2 rounded-full" style={{ background: "#e8509a" }}>
              {saving && <Loader2 className="size-4 animate-spin" />}
              {saving ? "Salvando..." : "Salvar tópico"}
            </Button>
            <Button
              variant="outline"
              className="rounded-full"
              onClick={() => { setIsCreating(false); setEditingTopic(null); }}
            >
              Cancelar
            </Button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="size-6 animate-spin text-muted-foreground" />
        </div>
      ) : topics.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          Nenhum tópico ainda. Crie o primeiro!
        </div>
      ) : (
        <div className="space-y-3">
          {topics.map((t, idx) => (
            <div
              key={t.id}
              className={cn(
                "flex gap-3 rounded-xl border p-4 transition-all",
                t.active ? "bg-background border-border" : "bg-secondary/30 border-border/50 opacity-60"
              )}
            >
              <div className="flex flex-col items-center gap-1 pt-0.5">
                <button
                  onClick={() => moveOrder(t.id, "up")}
                  disabled={idx === 0}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                  title="Mover para cima"
                  aria-label="Mover para cima"
                >
                  <GripVertical className="size-4" style={{ transform: "rotate(90deg) scaleX(-1)" }} />
                </button>
                <span className="text-xs text-muted-foreground font-mono">{idx + 1}</span>
                <button
                  onClick={() => moveOrder(t.id, "down")}
                  disabled={idx === topics.length - 1}
                  className="text-muted-foreground hover:text-foreground disabled:opacity-20 transition-colors"
                  title="Mover para baixo"
                  aria-label="Mover para baixo"
                >
                  <GripVertical className="size-4" style={{ transform: "rotate(270deg) scaleX(-1)" }} />
                </button>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-sm font-semibold truncate">{t.title}</h3>
                  {!t.active && (
                    <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full font-medium shrink-0">
                      Oculto
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                  {t.content}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={() => toggleActive(t)}
                  title={t.active ? "Ocultar" : "Exibir"}
                  aria-label={t.active ? "Ocultar tópico" : "Exibir tópico"}
                  className="size-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-[#e8509a] hover:border-[#e8509a]/40 hover:bg-[#fce8f3]/30 transition-colors"
                >
                  {t.active ? <Eye className="size-3.5" /> : <EyeOff className="size-3.5" />}
                </button>
                <button
                  onClick={() => openEdit(t)}
                  title="Editar"
                  aria-label="Editar tópico"
                  className="size-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-[#e8509a] hover:border-[#e8509a]/40 hover:bg-[#fce8f3]/30 transition-colors"
                >
                  <Pencil className="size-3.5" />
                </button>
                <button
                  onClick={() => setDeleteTarget(t)}
                  title="Excluir"
                  aria-label="Excluir tópico"
                  className="size-8 flex items-center justify-center rounded-lg border border-border text-muted-foreground hover:text-destructive hover:border-destructive/40 hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="size-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-destructive" /> Excluir tópico?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>"{deleteTarget?.title}"</strong>.
              Esta ação não pode ser desfeita e o tópico deixará de aparecer para os clientes imediatamente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteTopic}>
              Sim, excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
