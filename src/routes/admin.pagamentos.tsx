import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/admin/pagamentos")({ component: AdminPaymentsPage });

function AdminPaymentsPage() {
  const { data: orders, isLoading } = useQuery({
    queryKey: ["admin", "payments-overview"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("id, customer_name, total, status, created_at")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const total = orders?.reduce((sum, order) => sum + Number(order.total ?? 0), 0) ?? 0;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-serif text-3xl text-foreground">Pagamentos</h1>
        <p className="text-sm text-muted-foreground">Visão inicial até a integração do gateway.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Pedidos</p>
          <p className="mt-2 font-serif text-3xl">{orders?.length ?? 0}</p>
        </Card>
        <Card className="p-5 sm:col-span-2">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Valor total em pedidos</p>
          <p className="mt-2 font-serif text-3xl">{brl(total)}</p>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="border-b border-border p-4">
          <h2 className="font-serif text-xl">Últimos pedidos</h2>
        </div>
        <div className="divide-y divide-border">
          {isLoading && <p className="p-4 text-sm text-muted-foreground">Carregando…</p>}
          {!isLoading && orders?.length === 0 && (
            <p className="p-4 text-sm text-muted-foreground">Nenhum pedido encontrado.</p>
          )}
          {orders?.map((order) => (
            <div key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4 text-sm">
              <div>
                <p className="font-medium">{order.customer_name}</p>
                <p className="text-xs text-muted-foreground">
                  #{order.id.slice(0, 8)} · {new Date(order.created_at).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge variant="outline">{order.status}</Badge>
                <span className="font-semibold">{brl(Number(order.total))}</span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}