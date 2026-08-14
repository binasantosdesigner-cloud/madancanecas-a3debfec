import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ShieldOff, Search, Eye, Trash2, UserPlus, Mail, Phone, Calendar, CreditCard, ExternalLink } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/admin/usuarios")({ component: AdminUsersPage });

type Profile = { 
  id: string; 
  full_name: string | null; 
  email: string | null; 
  phone: string | null; 
  cpf: string | null;
  avatar_url: string | null;
  created_at: string;
};

type Role = { user_id: string; role: string };

function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "admin" | "customer">("all");
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Get current logged in user to prevent self-deletion
  useQuery({
    queryKey: ["auth-user"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setCurrentUser(user);
      return user;
    }
  });

  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as Profile[];
    },
  });

  const roles = useQuery({
    queryKey: ["admin", "user_roles"],
    queryFn: async () => {
      const { data, error } = await supabase.from("user_roles").select("user_id, role");
      if (error) throw error;
      return (data ?? []) as Role[];
    },
  });

  const orders = useQuery({
    queryKey: ["admin", "orders-aggregate"],
    queryFn: async () => {
      const { data, error } = await supabase.from("orders").select("user_id, total");
      if (error) throw error;
      const map = new Map<string, { count: number; total: number }>();
      for (const o of data ?? []) {
        const cur = map.get(o.user_id as string) ?? { count: 0, total: 0 };
        cur.count += 1;
        cur.total += Number((o as { total: number | string }).total ?? 0);
        map.set(o.user_id as string, cur);
      }
      return map;
    },
  });

  const rolesByUser = useMemo(() => {
    const m = new Map<string, Set<string>>();
    for (const r of roles.data ?? []) {
      if (!m.has(r.user_id)) m.set(r.user_id, new Set());
      m.get(r.user_id)!.add(r.role);
    }
    return m;
  }, [roles.data]);

  const toggleAdmin = useMutation({
    mutationFn: async ({ userId, makeAdmin }: { userId: string; makeAdmin: boolean }) => {
      if (makeAdmin) {
        const { error } = await supabase.from("user_roles").insert({ user_id: userId, role: "admin" });
        if (error) throw error;
      } else {
        const { error } = await supabase.from("user_roles").delete().eq("user_id", userId).eq("role", "admin");
        if (error) throw error;
      }
    },
    onSuccess: (_d, v) => {
      toast.success(v.makeAdmin ? "Promovido a admin" : "Permissão de admin removida");
      qc.invalidateQueries({ queryKey: ["admin", "user_roles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const updateProfile = useMutation({
    mutationFn: async (data: Partial<Profile> & { id: string }) => {
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: data.full_name,
          phone: data.phone,
          cpf: data.cpf,
        })
        .eq("id", data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Perfil atualizado");
      qc.invalidateQueries({ queryKey: ["admin", "profiles"] });
      setIsDetailsOpen(false);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteUser = useMutation({
    mutationFn: async (userId: string) => {
      const { error } = await supabase.from("profiles").delete().eq("id", userId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Usuário removido");
      qc.invalidateQueries({ queryKey: ["admin", "profiles"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = useMemo(() => {
    let list = profiles.data ?? [];
    
    // Apply role filter
    if (roleFilter !== "all") {
      list = list.filter(p => {
        const userRoles = rolesByUser.get(p.id);
        if (roleFilter === "admin") return userRoles?.has("admin");
        if (roleFilter === "customer") return !userRoles?.has("admin") || userRoles?.has("customer");
        return true;
      });
    }

    // Apply search filter
    const q = search.trim().toLowerCase();
    if (q) {
      list = list.filter((p) =>
        [p.full_name, p.email, p.phone].some((v) => v?.toLowerCase().includes(q))
      );
    }
    
    return list;
  }, [profiles.data, search, roleFilter, rolesByUser]);

  const getInitials = (name: string | null, email: string | null = null) => {
    if (name) {
      return name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase();
    }
    if (email) {
      return email[0].toUpperCase();
    }
    return "??";
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">{profiles.data?.length ?? 0} cadastros</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <UserPlus className="h-4 w-4 mr-2" />
              Novo usuário
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar novo usuário</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Para criar um novo usuário com segurança, utilize o painel de autenticação do backend.
              </p>
              <div className="bg-muted p-4 rounded-md space-y-3">
                <ol className="text-sm space-y-2 list-decimal list-inside">
                  <li>Acesse o painel do backend → Authentication → Users</li>
                  <li>Clique em "Add user" → "Create new user"</li>
                  <li>Preencha e-mail e senha, marque "Auto Confirm User"</li>
                  <li>Após criar, volte aqui para definir a permissão se necessário</li>
                </ol>
              </div>
              <Button asChild className="w-full bg-primary" variant="default">
                <a 
                  href="https://supabase.com/dashboard/project/ryurpwegsowynonkrfxj/auth/users" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Abrir Painel do Backend
                </a>
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="flex items-center gap-2 p-1 bg-muted rounded-lg w-fit">
          <Button 
            variant={roleFilter === "all" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setRoleFilter("all")}
            className={roleFilter === "all" ? "bg-primary text-white" : ""}
          >
            Todos
          </Button>
          <Button 
            variant={roleFilter === "admin" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setRoleFilter("admin")}
            className={roleFilter === "admin" ? "bg-primary text-white" : ""}
          >
            Admin
          </Button>
          <Button 
            variant={roleFilter === "customer" ? "default" : "ghost"} 
            size="sm" 
            onClick={() => setRoleFilter("customer")}
            className={roleFilter === "customer" ? "bg-primary text-white" : ""}
          >
            Cliente
          </Button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            value={search} 
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone" 
            className="pl-9" 
          />
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Usuário</th>
                <th className="px-4 py-3">Contato</th>
                <th className="px-4 py-3">Pedidos</th>
                <th className="px-4 py-3">Total gasto</th>
                <th className="px-4 py-3">Cadastro</th>
                <th className="px-4 py-3">Permissão</th>
                <th className="px-4 py-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {profiles.isLoading && (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-t border-border">
                    <td colSpan={7} className="px-4 py-4"><Skeleton className="h-4 w-full" /></td>
                  </tr>
                ))
              )}
              
              {!profiles.isLoading && filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-muted-foreground">
                    Nenhum usuário encontrado.
                  </td>
                </tr>
              )}

              {filtered.map((p) => {
                const isAdmin = rolesByUser.get(p.id)?.has("admin") ?? false;
                const agg = orders.data?.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-border hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="size-9 rounded-full bg-[#fce8f3] text-[#e8509a] text-sm font-semibold flex items-center justify-center overflow-hidden border border-[#e8509a]/20">
                          {p.avatar_url ? (
                            <img 
                              src={p.avatar_url} 
                              alt={p.full_name || ""} 
                              className="h-full w-full object-cover" 
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display = 'none';
                                (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(p.full_name, p.email);
                              }}
                            />
                          ) : getInitials(p.full_name, p.email)}
                        </div>
                        <span className="font-medium text-foreground">{p.full_name || "—"}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {p.email || "—"}</div>
                      <div className="text-xs flex items-center gap-1.5 mt-1"><Phone className="h-3 w-3" /> {p.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3 font-medium">{agg?.count ?? 0}</td>
                    <td className="px-4 py-3 font-medium text-[#e8509a]">
                      {(agg?.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div className="flex items-center gap-1.5"><Calendar className="h-3 w-3" /> {new Date(p.created_at).toLocaleDateString("pt-BR")}</div>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? (
                        <Badge className="bg-[#fce8f3] text-[#e8509a] border-[#e8509a]/20 hover:bg-[#fce8f3]">Admin</Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-muted text-muted-foreground border-transparent">Cliente</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className="size-8 rounded-lg flex items-center justify-center transition-colors bg-transparent border border-border text-muted-foreground hover:bg-[#fce8f3] hover:border-[#e8509a] hover:text-[#e8509a]"
                          onClick={() => {
                            setSelectedUser(p);
                            setIsDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>

                        <Button 
                          size="icon" 
                          variant="ghost" 
                          className={`size-8 rounded-lg flex items-center justify-center transition-colors bg-transparent border border-border ${isAdmin ? "text-[#e8509a] border-[#e8509a]" : "text-muted-foreground"} hover:bg-[#fce8f3] hover:border-[#e8509a] hover:text-[#e8509a]`}
                          disabled={toggleAdmin.isPending}
                          onClick={() => toggleAdmin.mutate({ userId: p.id, makeAdmin: !isAdmin })}
                        >
                          {isAdmin ? <ShieldOff className="h-4 w-4" /> : <Shield className="h-4 w-4" />}
                        </Button>

                        {currentUser?.id !== p.id && (
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button 
                                size="icon" 
                                variant="ghost" 
                                className="size-8 rounded-lg flex items-center justify-center transition-colors bg-transparent border border-border text-muted-foreground hover:bg-red-50 hover:border-red-300 hover:text-red-600"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Excluir usuário?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta ação não pode ser desfeita. O perfil e todos os dados associados a 
                                  <span className="font-bold text-foreground"> {p.full_name || p.email}</span> serão removidos permanentemente.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteUser.mutate(p.id)}
                                  className="bg-destructive hover:bg-destructive/90 text-white"
                                >
                                  Excluir
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>

      {/* MODAL DE DETALHES/EDIÇÃO */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>

          {selectedUser && (
            <Tabs defaultValue="perfil" className="w-full mt-4">
              <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1">
                <TabsTrigger value="perfil">Perfil</TabsTrigger>
                <TabsTrigger value="pedidos">Pedidos</TabsTrigger>
              </TabsList>

              <TabsContent value="perfil" className="space-y-6 pt-4">
                <div className="flex flex-col items-center gap-4 mb-6">
                  <div className="h-24 w-24 rounded-full bg-[#fce8f3] text-[#e8509a] flex items-center justify-center font-bold text-2xl border-2 border-[#e8509a]/20 shadow-sm overflow-hidden">
                    {selectedUser.avatar_url ? (
                      <img 
                        src={selectedUser.avatar_url} 
                        alt="" 
                        className="h-full w-full object-cover" 
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).parentElement!.innerHTML = getInitials(selectedUser.full_name, selectedUser.email);
                        }}
                      />
                    ) : getInitials(selectedUser.full_name, selectedUser.email)}
                  </div>
                  <div className="text-center">
                    <h3 className="font-bold text-lg">{selectedUser.full_name || "Sem nome"}</h3>
                    <div className="flex items-center justify-center gap-2 mt-1">
                      {rolesByUser.get(selectedUser.id)?.has("admin") ? (
                        <Badge className="bg-[#fce8f3] text-[#e8509a] border-[#e8509a]/20">Admin</Badge>
                      ) : (
                        <Badge variant="secondary">Cliente</Badge>
                      )}
                    </div>
                  </div>
                </div>

                <form className="space-y-4" onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.currentTarget);
                  updateProfile.mutate({
                    id: selectedUser.id,
                    full_name: formData.get("full_name") as string,
                    phone: formData.get("phone") as string,
                    cpf: formData.get("cpf") as string,
                  });
                }}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="full_name">Nome completo</Label>
                      <Input id="full_name" name="full_name" defaultValue={selectedUser.full_name || ""} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail (Leitura)</Label>
                      <Input id="email" value={selectedUser.email || ""} readOnly className="bg-muted text-muted-foreground" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input id="phone" name="phone" defaultValue={selectedUser.phone || ""} placeholder="(66) 99999-9999" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cpf">CPF</Label>
                      <Input id="cpf" name="cpf" defaultValue={selectedUser.cpf || ""} placeholder="000.000.000-00" />
                    </div>
                  </div>

                  <div className="p-4 bg-muted/30 rounded-lg flex items-center gap-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Membro desde {new Date(selectedUser.created_at).toLocaleDateString("pt-BR")}</span>
                  </div>

                  <DialogFooter className="pt-4">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsDetailsOpen(false)}
                    >
                      Cancelar
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-primary text-white"
                      disabled={updateProfile.isPending}
                    >
                      {updateProfile.isPending ? "Salvando..." : "Salvar alterações"}
                    </Button>
                  </DialogFooter>
                </form>
              </TabsContent>

              <TabsContent value="pedidos" className="pt-4">
                <UserOrdersList userId={selectedUser.id} />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function UserOrdersList({ userId }: { userId: string }) {
  const { data: userOrders, isLoading } = useQuery({
    queryKey: ["admin", "user-orders", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) return <div className="space-y-4 py-4">{Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>;

  if (!userOrders || userOrders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-muted-foreground bg-muted/10 rounded-lg border-2 border-dashed border-border mt-4">
        <CreditCard className="h-12 w-12 mb-3 opacity-20" />
        <p>Este usuário ainda não fez pedidos.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 overflow-hidden rounded-md border border-border">
      <table className="w-full text-sm">
        <thead className="bg-muted text-xs uppercase font-medium">
          <tr>
            <th className="px-4 py-2 text-left">Data</th>
            <th className="px-4 py-2 text-left">Status</th>
            <th className="px-4 py-2 text-right">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {userOrders.map((order) => (
            <tr key={order.id} className="hover:bg-muted/30">
              <td className="px-4 py-3 text-muted-foreground">
                {new Date(order.created_at).toLocaleDateString("pt-BR")}
              </td>
              <td className="px-4 py-3">
                <OrderStatusBadge status={order.status} />
              </td>
              <td className="px-4 py-3 text-right font-medium text-primary">
                {(order.total || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function OrderStatusBadge({ status }: { status: string }) {
  const configs: Record<string, { label: string; className: string }> = {
    pending: { label: "Pendente", className: "bg-slate-100 text-slate-600 border-slate-200" },
    in_production: { label: "Em Produção", className: "bg-amber-100 text-amber-600 border-amber-200" },
    shipped: { label: "Enviado", className: "bg-blue-100 text-blue-600 border-blue-200" },
    completed: { label: "Concluído", className: "bg-emerald-100 text-emerald-600 border-emerald-200" },
    cancelled: { label: "Cancelado", className: "bg-rose-100 text-rose-600 border-rose-200" },
  };

  const config = configs[status] || { label: status, className: "" };

  return (
    <Badge variant="outline" className={`font-normal ${config.className}`}>
      {config.label}
    </Badge>
  );
}
