import { createFileRoute } from "@tanstack/react-router";
import { Fragment, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Plus, Trash2, Upload } from "lucide-react";
import { cn } from "@/lib/utils";


export const Route = createFileRoute("/admin/categorias")({ component: AdminCategoriesPage });

type Category = {
  id: string; slug: string; name: string;
  description: string | null; image_url: string | null; display_order: number;
  featured?: boolean;
  parent_id?: string | null;
};


const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

function AdminCategoriesPage() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<Partial<Category> | null>(null);
  const [featured, setFeatured] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [uploadingImage, setUploadingImage] = useState(false);


  const list = useQuery({
    queryKey: ["admin", "categories"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .order("parent_id", { ascending: true, nullsFirst: true })
        .order("display_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Category[];
    },
  });

  const save = useMutation({
    mutationFn: async (c: Partial<Category>) => {
      const payload = {
        name: c.name!,
        slug: c.slug?.trim() ? slugify(c.slug) : slugify(c.name!),
        description: c.description ?? null,
        display_order: Number(c.display_order ?? 0),
        featured: featured,
        image_url: imageUrl || null,
        parent_id: c.parent_id || null,
      };


      if (c.id) {
        const { error } = await supabase.from("categories").update(payload).eq("id", c.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("categories").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      toast.success("Categoria salva");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
      setEditing(null);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("categories").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Categoria excluída");
      qc.invalidateQueries({ queryKey: ["admin", "categories"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const all = list.data ?? [];
  const rootCategories = all.filter((c) => !c.parent_id);
  const subCategories = all.filter((c) => !!c.parent_id);
  const getSubcats = (parentId: string) => subCategories.filter((c) => c.parent_id === parentId);

  const openEdit = (c: Category) => {
    setEditing(c);
    setFeatured(c.featured ?? false);
    setImageUrl(c.image_url ?? "");
  };

  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Categorias</h1>
          <p className="text-sm text-muted-foreground">{list.data?.length ?? 0} categorias</p>
        </div>
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditing({ display_order: (list.data?.length ?? 0) + 1, parent_id: null });
              setFeatured(false);
              setImageUrl('');
            }}>
              <Plus className="h-4 w-4 mr-1" />Nova categoria
            </Button>
          </DialogTrigger>

          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editing?.id ? "Editar categoria" : "Nova categoria"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label>Tipo</Label>
                <select
                  value={editing?.parent_id ?? ""}
                  onChange={(e) => setEditing({ ...editing, parent_id: e.target.value || null })}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#e8509a]"
                >
                  <option value="">Categoria principal</option>
                  {(list.data ?? [])
                    .filter((c) => !c.parent_id && (!editing?.id || c.id !== editing.id))
                    .map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <p className="text-xs text-muted-foreground">
                  Deixe em branco para categoria principal. Selecione uma categoria para criar como subcategoria dela.
                </p>
              </div>
              <div>
                <Label>Nome</Label>
                <Input value={editing?.name ?? ""}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })} />
              </div>
              <div>
                <Label>Slug (opcional)</Label>
                <Input placeholder="gerado automaticamente" value={editing?.slug ?? ""}
                  onChange={(e) => setEditing({ ...editing, slug: e.target.value })} />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={editing?.description ?? ""}
                  onChange={(e) => setEditing({ ...editing, description: e.target.value })} />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Imagem da categoria</label>

                {/* Preview */}
                {imageUrl && (
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-[#e8509a]/30">
                    <img src={imageUrl} alt="preview" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity text-white text-xs"
                    >
                      Remover
                    </button>
                  </div>
                )}

                {/* Input de upload */}
                <label className={cn(
                  "flex items-center gap-2 cursor-pointer border border-dashed border-border rounded-xl px-4 py-3 text-sm text-muted-foreground hover:border-[#e8509a] hover:text-[#e8509a] transition-colors",
                  uploadingImage && "opacity-50 pointer-events-none"
                )}>
                  <Upload className="size-4" />
                  {uploadingImage ? "Enviando..." : imageUrl ? "Trocar imagem" : "Fazer upload da imagem"}
                  <input
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    disabled={uploadingImage}
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      setUploadingImage(true);
                      const ext = file.name.split('.').pop();
                      const path = `${editing?.id ?? 'new'}-${Date.now()}.${ext}`;
                      const { error } = await supabase.storage
                        .from('categories')
                        .upload(path, file, { upsert: true });
                      if (!error) {
                        const { data: urlData } = supabase.storage
                          .from('categories')
                          .getPublicUrl(path);
                        setImageUrl(urlData.publicUrl);
                      } else {
                        toast.error('Erro no upload: ' + error.message);
                      }
                      setUploadingImage(false);
                    }}
                  />
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Recomendado: imagem quadrada, mínimo 400x400px. Formatos: JPG, PNG, WebP.
                </p>
              </div>

              <div className="flex items-center justify-between py-3 border-t border-border">
                <div>
                  <label className="text-sm font-medium">Categoria em destaque</label>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Aparece na seção de categorias da página inicial (máx. 6)
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setFeatured((v: boolean) => !v)}
                  className={cn(
                    "relative inline-flex h-6 w-11 items-center rounded-full transition-colors",
                    featured ? "bg-[#e8509a]" : "bg-muted"
                  )}
                >
                  <span className={cn(
                    "inline-block size-4 rounded-full bg-white shadow transition-transform",
                    featured ? "translate-x-6" : "translate-x-1"
                  )} />
                </button>
              </div>

              <div>
                <Label>Ordem</Label>
                <Input type="number" value={editing?.display_order ?? 0}
                  onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button disabled={!editing?.name || save.isPending} onClick={() => save.mutate(editing!)}>
                Salvar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Ordem</th>
                <th className="px-4 py-3">Nome</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Descrição</th>
                <th className="px-4 py-3 text-center">Destaque</th>
                <th className="px-4 py-3 text-right">Ações</th>

              </tr>
            </thead>
            <tbody>
              {list.isLoading && <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Carregando…</td></tr>}
              {!list.isLoading && (list.data?.length ?? 0) === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Nenhuma categoria.</td></tr>
              )}
              {rootCategories.map((cat) => (
                <Fragment key={cat.id}>
                  <tr className="border-t border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3 w-16 text-muted-foreground">{cat.display_order}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {cat.image_url && (
                          <img src={cat.image_url} alt="" className="size-8 rounded-full object-cover border border-border" />
                        )}
                        <span className="text-sm font-semibold text-foreground">{cat.name}</span>
                        {getSubcats(cat.id).length > 0 && (
                          <span className="text-[10px] bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                            {getSubcats(cat.id).length} subcats
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{cat.slug}</td>
                    <td className="px-4 py-3 text-muted-foreground max-w-md truncate">{cat.description ?? "—"}</td>
                    <td className="text-center">
                      {cat.featured ? (
                        <span className="inline-flex items-center gap-1 text-xs text-[#e8509a] bg-[#fce8f3] px-2 py-0.5 rounded-full font-medium">
                          ⭐ Destaque
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right space-x-2">
                      <Button size="sm" variant="outline" onClick={() => openEdit(cat)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="outline"
                        onClick={() => { if (confirm(`Excluir "${cat.name}"?`)) remove.mutate(cat.id); }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>

                  {getSubcats(cat.id).map((sub) => (
                    <tr key={sub.id} className="border-t border-border/40 bg-secondary/5 hover:bg-secondary/10 transition-colors">
                      <td className="px-4 py-3 pl-8 w-16 text-xs text-muted-foreground/60">{sub.display_order}</td>
                      <td className="px-4 py-3 pl-8">
                        <div className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-[#e8509a]/40 shrink-0" />
                          {sub.image_url && (
                            <img src={sub.image_url} alt="" className="size-6 rounded-full object-cover border border-border" />
                          )}
                          <span className="text-sm text-muted-foreground">{sub.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/60">{sub.slug}</td>
                      <td className="px-4 py-3 text-xs text-muted-foreground/60 max-w-md truncate">{sub.description ?? "—"}</td>
                      <td className="text-center">
                        {sub.featured ? (
                          <span className="text-xs text-[#a57840] font-medium">⭐</span>
                        ) : (
                          <span className="text-xs text-muted-foreground/40">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-right space-x-2">
                        <Button size="sm" variant="outline" onClick={() => openEdit(sub)}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button size="sm" variant="outline"
                          onClick={() => { if (confirm(`Excluir "${sub.name}"?`)) remove.mutate(sub.id); }}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}