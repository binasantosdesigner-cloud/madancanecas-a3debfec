import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { Shield, ShieldOff, Search } from "lucide-react";

export const Route = createFileRoute("/admin/usuarios")({ component: AdminUsersPage });

type Profile = { id: string; full_name: string | null; email: string | null; phone: string | null; created_at: string };
type Role = { user_id: string; role: string };

function AdminUsersPage() {
  const qc = useQueryClient();
  const [search, setSearch] = useState("");

  const profiles = useQuery({
    queryKey: ["admin", "profiles"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("profiles").select("id, full_name, email, phone, created_at")
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

  const filtered = useMemo(() => {
    const list = profiles.data ?? [];
    const q = search.trim().toLowerCase();
    if (!q) return list;
    return list.filter((p) =>
      [p.full_name, p.email, p.phone].some((v) => v?.toLowerCase().includes(q))
    );
  }, [profiles.data, search]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-serif text-2xl text-foreground">Usuários</h1>
          <p className="text-sm text-muted-foreground">{profiles.data?.length ?? 0} cadastros</p>
        </div>
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar por nome, e-mail ou telefone" className="pl-9" />
        </div>
      </header>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Nome</th>
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
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Carregando…</td></tr>
              )}
              {!profiles.isLoading && filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">Nenhum usuário encontrado.</td></tr>
              )}
              {filtered.map((p) => {
                const isAdmin = rolesByUser.get(p.id)?.has("admin") ?? false;
                const agg = orders.data?.get(p.id);
                return (
                  <tr key={p.id} className="border-t border-border">
                    <td className="px-4 py-3 font-medium text-foreground">{p.full_name || "—"}</td>
                    <td className="px-4 py-3 text-muted-foreground">
                      <div>{p.email || "—"}</div>
                      <div className="text-xs">{p.phone || ""}</div>
                    </td>
                    <td className="px-4 py-3">{agg?.count ?? 0}</td>
                    <td className="px-4 py-3">
                      {(agg?.total ?? 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {new Date(p.created_at).toLocaleDateString("pt-BR")}
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin ? <Badge className="bg-primary/10 text-primary border-primary/20">Admin</Badge>
                        : <Badge variant="secondary">Cliente</Badge>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Button size="sm" variant={isAdmin ? "outline" : "default"}
                        disabled={toggleAdmin.isPending}
                        onClick={() => toggleAdmin.mutate({ userId: p.id, makeAdmin: !isAdmin })}>
                        {isAdmin ? <><ShieldOff className="h-4 w-4 mr-1" />Remover admin</>
                          : <><Shield className="h-4 w-4 mr-1" />Tornar admin</>}
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}