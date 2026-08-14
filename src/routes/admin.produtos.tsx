import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Pencil, Trash2, Plus, Heart, Star, Search, ChevronLeft, ChevronRight, X, Upload, Check } from "lucide-react";
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
  const [form, setForm] = useState<any>({ title: "", price: 0, kind: "ready", description: "", category_id: "", image_url: "", images: [], active: true, featured: false });
  const [images, setImages] = useState<{url: string, isPrimary: boolean}[]>([]);
  const [homeSection, setHomeSection] = useState<'none' | 'ready' | 'custom'>('none');
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; title: string } | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);

  // Upsell state
  const [upsellSearch, setUpsellSearch] = useState('');
  const [addingUpsell, setAddingUpsell] = useState(false);

  const { data: currentUpsells, refetch: refetchUpsells } = useQuery({
    enabled: !!editing?.id,
    queryKey: ['upsells', editing?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('product_upsells')
        .select('id, display_order, upsell_product_id, products!product_upsells_upsell_product_id_fkey(id, title, price, image_url)')
        .eq('product_id', editing!.id)
        .order('display_order', { ascending: true });
      return data ?? [];
    },
  });

  const { data: searchResults } = useQuery({
    enabled: upsellSearch.length >= 2,
    queryKey: ['products-search', upsellSearch, editing?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from('products')
        .select('id, title, price, image_url')
        .eq('active', true)
        .neq('id', editing?.id ?? '')
        .ilike('title', `%${upsellSearch}%`)
        .limit(6);
      return data ?? [];
    },
  });

  const addUpsell = async (upsellProductId: string) => {
    if (!editing) return;
    const alreadyAdded = currentUpsells?.some((u: any) => u.upsell_product_id === upsellProductId);
    if (alreadyAdded) { toast.error('Produto já adicionado'); return; }
    if ((currentUpsells?.length ?? 0) >= 4) { toast.error('Máximo de 4 produtos sugeridos'); return; }
    
    setAddingUpsell(true);
    const { error } = await supabase
      .from('product_upsells')
      .insert({
        product_id: editing.id,
        upsell_product_id: upsellProductId,
        display_order: (currentUpsells?.length ?? 0),
      });
    setAddingUpsell(false);
    if (error) { toast.error('Erro: ' + error.message); return; }
    toast.success('Produto sugerido adicionado!');
    setUpsellSearch('');
    refetchUpsells();
  };

  const removeUpsell = async (upsellId: string) => {
    const { error } = await supabase
      .from('product_upsells')
      .delete()
      .eq('id', upsellId);
    if (error) { toast.error('Erro ao remover'); return; }
    toast.success('Removido');
    refetchUpsells();
  };

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

  const openNew = () => { 
    setEditing(null); 
    setForm({ title: "", price: 0, kind: "ready", description: "", category_id: cats?.[0]?.id ?? "", image_url: "", images: [], active: true, featured: false }); 
    setImages([]);
    setHomeSection('none');
    setOpen(true); 
  };
  const openEdit = (p: any) => { 
    setEditing(p); 
    setForm({ ...p }); 
    
    // Populate images state from JSONB array
    const productImages = (p.images as any[]) ?? [];
    if (productImages.length > 0) {
      setImages(productImages);
    } else if (p.image_url) {
      setImages([{ url: p.image_url, isPrimary: true }]);
    } else {
      setImages([]);
    }

    if (p.featured === true && p.kind === 'ready') setHomeSection('ready');
    else if (p.featured === true && p.kind === 'custom') setHomeSection('custom');
    else setHomeSection('none');
    setOpen(true); 
  };


  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate type
    const validTypes = ['image/jpeg', 'image/jpg', 'image/webp', 'image/png'];
    if (!validTypes.includes(file.type)) {
      toast.error('Formato inválido. Use JPG, WebP ou PNG.');
      return;
    }

    setUploadingImage(true);

    try {
      // Compress using canvas
      const compressed = await compressImage(file, 1024); // max 1MB
      
      const ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
      const path = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      
      const { error } = await supabase.storage
        .from('products')
        .upload(path, compressed, { upsert: true, contentType: compressed.type });
      
      if (error) throw error;
      
      const { data: urlData } = supabase.storage.from('products').getPublicUrl(path);
      setForm({ ...form, image_url: urlData.publicUrl });
      toast.success('Imagem enviada!');
    } catch (err: any) {
      toast.error('Erro no upload: ' + (err.message ?? 'tente novamente'));
    } finally {
      setUploadingImage(false);
    }
  };

  // Canvas-based compression — keeps quality, targets max size in KB
  async function compressImage(file: File, maxKB: number): Promise<Blob> {
    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);
        const canvas = document.createElement('canvas');
        
        // Max dimension 1200px
        const MAX_DIM = 1200;
        let { width, height } = img;
        if (width > MAX_DIM || height > MAX_DIM) {
          const ratio = Math.min(MAX_DIM / width, MAX_DIM / height);
          width = Math.round(width * ratio);
          height = Math.round(height * ratio);
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d')!;
        ctx.drawImage(img, 0, 0, width, height);
        
        // Try webp first for better compression
        const tryCompress = (quality: number, format: string) => {
          canvas.toBlob((blob) => {
            if (!blob) { resolve(new Blob([file])); return; }
            if (blob.size <= maxKB * 1024 || quality <= 0.5) {
              resolve(blob);
            } else {
              tryCompress(quality - 0.1, format);
            }
          }, format, quality);
        };
        
        tryCompress(0.85, 'image/webp');
      };
      img.src = url;
    });
  }

  const save = async () => {
    const slug = (form.title as string).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    const payload = { 
      ...form, 
      slug, 
      price: Number(form.price),
      featured: homeSection !== 'none',
      kind: homeSection === 'none' ? form.kind : homeSection,
      images: images,
      image_url: images.find(i => i.isPrimary)?.url ?? images[0]?.url ?? null
    };
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
          <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing ? "Editar" : "Novo"} Produto</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2"><Label>Título</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2"><Label>Preço</Label><Input type="number" step="0.01" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} /></div>
                
                <div className="space-y-2">
                  <Label>Exibição na página inicial</Label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { value: 'none', label: 'Não exibir na home', desc: 'Aparece apenas no catálogo', icon: '🚫' },
                      { value: 'ready', label: 'Prontos para você', desc: 'Seção de produtos prontos (máx. 6)', icon: '🛍️' },
                      { value: 'custom', label: 'Personalize do seu jeito', desc: 'Seção de personalizáveis (máx. 4)', icon: '✏️' },
                    ].map((opt) => (
                      <label
                        key={opt.value}
                        className={cn(
                          "flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all",
                          homeSection === opt.value
                            ? "border-[#e8509a] bg-[#fce8f3]/30"
                            : "border-border hover:border-[#e8509a]/40"
                        )}
                      >
                        <input
                          type="radio"
                          name="homeSection"
                          value={opt.value}
                          checked={homeSection === opt.value}
                          onChange={() => setHomeSection(opt.value as any)}
                          className="sr-only"
                        />
                        <span className="text-lg shrink-0">{opt.icon}</span>
                        <div className="flex-1">
                          <p className="text-sm font-medium">{opt.label}</p>
                          <p className="text-xs text-muted-foreground">{opt.desc}</p>
                        </div>
                        {homeSection === opt.value && (
                          <div className="size-5 rounded-full bg-[#e8509a] flex items-center justify-center shrink-0">
                            <Check className="size-3 text-white" />
                          </div>
                        )}
                      </label>
                    ))}
                  </div>
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
              {/* Multi-image Manager */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label>Imagens do produto</Label>
                  <span className="text-xs text-muted-foreground">{images.length}/5</span>
                </div>

                {/* Existing images grid */}
                {images.length > 0 && (
                  <div className="grid grid-cols-5 gap-2">
                    {images.map((img, idx) => (
                      <div key={idx} className="relative group aspect-square">
                        <img
                          src={img.url}
                          alt=""
                          className={`w-full h-full object-cover rounded-lg border-2 transition-all ${
                            img.isPrimary ? 'border-[#e8509a]' : 'border-border'
                          }`}
                        />
                        {/* Primary badge */}
                        {img.isPrimary && (
                          <span className="absolute top-1 left-1 text-[9px] bg-[#e8509a] text-white px-1 rounded font-medium">
                            Capa
                          </span>
                        )}
                        {/* Actions overlay */}
                        <div className="absolute inset-0 bg-black/50 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-1">
                          {!img.isPrimary && (
                            <button
                              type="button"
                              onClick={() => setImages(prev => prev.map((im, i) => ({...im, isPrimary: i === idx})))}
                              className="text-[9px] text-white bg-[#e8509a] px-1.5 py-0.5 rounded font-medium"
                            >
                              Definir capa
                            </button>
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              const newImgs = images.filter((_, i) => i !== idx);
                              // If removed was primary, set first as primary
                              if (img.isPrimary && newImgs.length > 0) newImgs[0].isPrimary = true;
                              setImages(newImgs);
                            }}
                            className="text-[9px] text-white bg-red-500 px-1.5 py-0.5 rounded font-medium"
                          >
                            Remover
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Upload button — only show if < 5 images */}
                {images.length < 5 && (
                  <label className={`flex items-center justify-center gap-2 w-full py-4 border-2 border-dashed border-border rounded-xl cursor-pointer transition-colors hover:border-[#e8509a] hover:bg-[#fce8f3]/20 ${uploadingImage ? 'opacity-50 pointer-events-none' : ''}`}>
                    <Upload className="size-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">
                      {uploadingImage ? 'Enviando...' : `Adicionar imagem (${images.length}/5)`}
                    </span>
                    <input
                      type="file"
                      accept="image/jpeg,image/jpg,image/webp,image/png"
                      multiple
                      className="sr-only"
                      disabled={uploadingImage}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        const remaining = 5 - images.length;
                        const toUpload = files.slice(0, remaining);
                        if (toUpload.length === 0) return;
                        setUploadingImage(true);
                        const uploaded: {url: string, isPrimary: boolean}[] = [];
                        for (const file of toUpload) {
                          try {
                            const compressed = await compressImage(file, 1024);
                            const ext = compressed.type === 'image/webp' ? 'webp' : 'jpg';
                            const path = `product-${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
                            const { error } = await supabase.storage.from('product-images').upload(path, compressed, { upsert: true });
                            if (!error) {
                              const { data: urlData } = supabase.storage.from('product-images').getPublicUrl(path);
                              uploaded.push({ url: urlData.publicUrl, isPrimary: false });
                            } else {
                              console.error("Upload error:", error);
                              toast.error(`Erro ao subir ${file.name}`);
                            }
                          } catch (err) {
                            console.error("Processing error:", err);
                          }
                        }
                        setImages(prev => {
                          const combined = [...prev, ...uploaded];
                          // If no primary yet, set first as primary
                          if (!combined.some(i => i.isPrimary) && combined.length > 0) combined[0].isPrimary = true;
                          return combined;
                        });
                        setUploadingImage(false);
                        if (files.length > remaining) toast.error(`Apenas ${remaining} imagem(ns) adicionada(s). Limite: 5.`);
                      }}
                    />
                  </label>
                )}
                <p className="text-xs text-muted-foreground">A imagem marcada como "Capa" aparece primeiro. Passe o mouse sobre uma imagem para definir capa ou remover.</p>
              </div>
              

              <Button onClick={save} className="w-full">Salvar</Button>

              {/* Upsell section - only in edit mode */}
              {editing && (
                <div className="border-t border-border pt-5 mt-2 space-y-4">
                  <div>
                    <h3 className="text-sm font-semibold">Produtos sugeridos</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Aparecem na página do produto como "Complete seu presente". Máx. 4.
                    </p>
                  </div>

                  {/* Current upsells list */}
                  {(currentUpsells?.length ?? 0) > 0 && (
                    <div className="space-y-2">
                      {currentUpsells!.map((u: any) => {
                        const p = u.products;
                        return (
                          <div key={u.id} className="flex items-center gap-3 p-2.5 rounded-xl border border-border bg-secondary/30">
                            <div className="size-10 rounded-lg bg-secondary overflow-hidden shrink-0">
                              {p?.image_url
                                ? <img src={p.image_url} alt="" className="w-full h-full object-cover" />
                                : <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground/40 uppercase">Madan</div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium truncate">{p?.title}</p>
                              <p className="text-xs text-[#e8509a]">{p ? brl(Number(p.price)) : ''}</p>
                            </div>
                            <button
                              onClick={() => removeUpsell(u.id)}
                              className="size-7 rounded-lg flex items-center justify-center text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                              <X className="size-3.5" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {/* Search input to add new upsells */}
                  {(currentUpsells?.length ?? 0) < 4 && (
                    <div className="relative">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
                        <Input
                          value={upsellSearch}
                          onChange={(e) => setUpsellSearch(e.target.value)}
                          placeholder="Buscar produto para sugerir..."
                          className="pl-8 text-sm"
                        />
                      </div>

                      {/* Results dropdown */}
                      {upsellSearch.length >= 2 && searchResults && searchResults.length > 0 && (
                        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-xl shadow-lg z-50 overflow-hidden">
                          {searchResults
                            .filter((r: any) => !currentUpsells?.some((u: any) => u.upsell_product_id === r.id))
                            .map((r: any) => (
                              <button
                                key={r.id}
                                onClick={() => addUpsell(r.id)}
                                disabled={addingUpsell}
                                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-secondary transition-colors text-left"
                              >
                                <div className="size-8 rounded-md bg-secondary overflow-hidden shrink-0">
                                  {r.image_url
                                    ? <img src={r.image_url} alt="" className="w-full h-full object-cover" />
                                    : <div className="w-full h-full flex items-center justify-center text-[8px] text-muted-foreground/40">M</div>
                                  }
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm truncate">{r.title}</p>
                                  <p className="text-xs text-[#e8509a]">{brl(Number(r.price))}</p>
                                </div>
                                <Plus className="size-4 text-muted-foreground shrink-0" />
                              </button>
                            ))
                          }
                          {searchResults.filter((r: any) => !currentUpsells?.some((u: any) => u.upsell_product_id === r.id)).length === 0 && (
                            <p className="text-xs text-muted-foreground text-center py-3">Todos os resultados já foram adicionados</p>
                          )}
                        </div>
                      )}

                      {upsellSearch.length >= 2 && (!searchResults || searchResults.length === 0) && (
                        <p className="text-xs text-muted-foreground mt-1 px-1">Nenhum produto encontrado</p>
                      )}
                    </div>
                  )}

                  {(currentUpsells?.length ?? 0) >= 4 && (
                    <p className="text-xs text-muted-foreground text-center py-2 bg-secondary/40 rounded-lg">
                      Máximo de 4 produtos atingido
                    </p>
                  )}
                </div>
              )}
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
                  {p.featured && p.kind === 'ready' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 uppercase tracking-wider">
                      🛍️ Prontos
                    </span>
                  ) : p.featured && p.kind === 'custom' ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 uppercase tracking-wider">
                      ✏️ Personalize
                    </span>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
                </td>

                <td className="p-3 text-right">
                  <Button size="icon" variant="ghost" onClick={() => openEdit(p)}><Pencil className="size-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => setDeleteTarget({ id: p.id, title: p.title })}><Trash2 className="size-4" /></Button>
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

      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Trash2 className="size-5 text-red-500" />
              Excluir produto?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Você está prestes a excluir <strong>"{deleteTarget?.title}"</strong>.
              Esta ação não pode ser desfeita. O produto será removido permanentemente do catálogo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 hover:bg-red-600 text-white"
              onClick={() => {
                if (deleteTarget) {
                  del(deleteTarget.id);
                  setDeleteTarget(null);
                }
              }}
            >
              Sim, excluir produto
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
