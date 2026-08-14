import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Heart, Star, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";

import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { brl } from "@/lib/format";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export const Route = createFileRoute("/admin/produtos")({ component: AdminProducts });

function AdminProducts() {
  const qc = useQueryClient();
  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("created_at", { ascending: false })).data ?? [],
  });
  const { data: cats } = useQuery({
    queryKey: ["admin-cats"],
    queryFn: async () => (await supabase.from("categories").select("*").order("display_order")).data ?? [],
  });

  // Query adicional para contar favoritos por produto
  const { data: favCounts } = useQuery({
    queryKey: ["admin", "fav-counts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("product_id");
      const counts: Record<string, number> = {};
      (data ?? []).forEach((f) => {
        counts[f.product_id] = (counts[f.product_id] ?? 0) + 1;
      });
      return counts;
    },
  });

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState<any>({ title: "", price: 0, kind: "ready", description: "", category_id: "", image_url: "", active: true, featured: false });
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);

  // Filtering states
  const [search, setSearch] = useState("");
  const [filterKind, setFilterKind] = useState<"all" | "ready" | "custom">("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [filterFeatured, setFilterFeatured] = useState(false);
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 20;

  useEffect(() => {
    setPage(1);
  }, [search, filterKind, filterCategory, filterFeatured]);

  const filtered = (products ?? []).filter((p: any) => {
    const matchSearch = !search || p.title.toLowerCase().includes(search.toLowerCase());
    const matchKind = filterKind === "all" || p.kind === filterKind;
    const matchCat = filterCategory === "all" || p.category_id === filterCategory;
    const matchFeat = !filterFeatured || p.featured === true;
    return matchSearch && matchKind && matchCat && matchFeat;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  const openNew = () => { setEditing(null); setForm({ title: "", price: 0, kind: "ready", description: "", category_id: cats?.[0]?.id ?? "", image_url: "", active: true, featured: false }); setOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ ...p }); setOpen(true); };


  const save = async () => {
    const slug = (form.title as string).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { ...form, slug, price: Number(form.price) };
    delete (payload as any).categories;
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", editing.id)
      : await supabase.from("products").insert(payload);
    if (error) toast.error(error.message);
    else { toast.success("Salvo!"); setOpen(false); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  const del = async (id: string) => {
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Excluído"); qc.invalidateQueries({ queryKey: ["admin-products"] }); }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="font-serif text-3xl">Produtos</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button onClick={openNew}><Plus className="mr-2 size-4" />Novo</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Produto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                <div className="space-y-2">
                  <Label>Tipo do produto</Label>
                  <Select value={form.kind} onValueChange={(v) => setForm({ ...form, kind: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ready">Pronto para venda</SelectItem>
                      <SelectItem value="custom">Personalizável</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-[11px] text-muted-foreground">Define em qual seção da página inicial este produto aparece.</p>
                </div>

              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select value={form.category_id ?? ""} onValueChange={(v) => setForm({ ...form, category_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>{cats?.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>Descrição</Label><Textarea value={form.description ?? ""} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
              <div className="space-y-2"><Label>URL da Imagem</Label><Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} /></div>
              
              <div className="flex items-center justify-between py-3 border-t border-border mt-2">
                <div>
                  <Label className="text-sm font-medium">Produto em destaque</Label>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Produtos destacados aparecem primeiro nas seções da página inicial. Máx. 6 prontos e 4 personalizáveis.
                  </p>
                </div>
                <Switch 
                  checked={form.featured || false} 
                  onCheckedChange={(v) => setForm({ ...form, featured: v })}
                />
              </div>

              <Button onClick={save} className="w-full">Salvar</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Toolbar */}
      <div className="space-y-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar produto..." 
            className="pl-10" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <div className="flex bg-muted p-1 rounded-lg">
            {(["all", "ready", "custom"] as const).map((k) => (
              <button
                key={k}
                onClick={() => setFilterKind(k)}
                className={cn(
                  "px-4 py-1.5 text-xs font-medium rounded-md transition-all",
                  filterKind === k ? "bg-[#e8509a] text-white shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}
              >
                {k === "all" ? "Todos" : k === "ready" ? "Pronto" : "Personalizável"}
              </button>
            ))}
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Todas as categorias" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {cats?.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilterFeatured(!filterFeatured)}
            className={cn(
              "h-10 px-4 transition-all",
              filterFeatured ? "bg-amber-100 text-amber-700 border-amber-300 hover:bg-amber-200" : "bg-background"
            )}
          >
            <Star className={cn("size-4 mr-2", filterFeatured && "fill-amber-700")} />
            Destaque
          </Button>

          <span className="text-xs text-muted-foreground ml-auto">
            {filtered.length} produto{filtered.length !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-secondary/50"><tr><th className="text-left p-3">Produto</th><th className="text-left p-3">Categoria</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Preço</th><th className="text-center p-3">❤️</th><th className="text-center p-3">Destaque</th><th className="text-right p-3">Ações</th></tr></thead>
          <tbody>
            {paginated.map((p: any) => (
              <tr key={p.id} className="border-t border-border">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-muted-foreground">{p.categories?.name ?? "—"}</td>
                <td className="p-3">
                  <span className={cn(
                    "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                    p.kind === "custom" ? "bg-[#fce8f3] text-[#e8509a]" : "bg-muted text-muted-foreground"
                  )}>
                    {p.kind === "custom" ? "Personalize" : "Pronto"}
                  </span>
                </td>

                <td className="p-3">{brl(Number(p.price))}</td>
                <td className="p-3 text-sm text-muted-foreground text-center">
                  {favCounts?.[p.id] ? (
                    <span className="inline-flex items-center gap-1 text-[#e8509a]">
                      <Heart className="size-3 fill-[#e8509a]" />
                      {favCounts[p.id]}
                    </span>
                  ) : "—"}
                </td>
                <td className="p-3 text-center">
                  {p.featured ? (
                    <span className="inline-flex items-center justify-center size-6 rounded-full bg-[#fce8f3] text-[#e8509a]" title="Em destaque na Home">
                      <Star className="size-3.5 fill-[#e8509a]" />
                    </span>
                  ) : "—"}
                </td>

                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => del(p.id)}><Trash2 className="size-4" /></Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
            >
              <ChevronLeft className="size-4" />
            </Button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
              .map((p, i, arr) => (
                <div key={p} className="flex items-center">
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span className="px-2 text-muted-foreground">...</span>
                  )}
                  <Button
                    variant="outline"
                    className={cn(
                      "size-8 p-0 rounded-lg",
                      page === p && "bg-[#e8509a] text-white border-[#e8509a] hover:bg-[#e8509a] hover:text-white"
                    )}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                </div>
              ))}

            <Button
              variant="outline"
              size="icon"
              className="size-8 rounded-lg"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
