import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { brl } from "@/lib/format";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/pedidos")({ component: AdminOrders });

const statuses = [
  { v: "pending", l: "Pendente" },
  { v: "in_production", l: "Em Produção" },
  { v: "shipped", l: "Enviado" },
  { v: "completed", l: "Concluído" },
  { v: "cancelled", l: "Cancelado" },
] as const;
type OrderStatus = typeof statuses[number]["v"];

function AdminOrders() {
  const qc = useQueryClient();
  const { data: orders } = useQuery({
    queryKey: ["admin-all-orders"],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  const updateStatus = async (id: string, status: OrderStatus) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Status atualizado"); qc.invalidateQueries({ queryKey: ["admin-all-orders"] }); }
  };

  return (
    <div>
      <h1 className="font-serif text-3xl mb-6">Pedidos</h1>
      <div className="space-y-4">
        {orders?.map((o: any) => (
          <div key={o.id} className="p-6 bg-card border border-border rounded-xl">
            <div className="flex flex-wrap gap-4 justify-between items-start">
              <div>
                <p className="text-xs text-muted-foreground">#{o.id.slice(0, 8)} · {new Date(o.created_at).toLocaleString("pt-BR")}</p>
                <p className="font-medium mt-1">{o.customer_name} · {o.customer_phone || "—"}</p>
                <p className="text-xs text-muted-foreground">Entrega: {o.delivery_type}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{brl(Number(o.total))}</span>
                <Select value={o.status} onValueChange={(v) => updateStatus(o.id, v as OrderStatus)}>
                  <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{statuses.map((s) => <SelectItem key={s.v} value={s.v}>{s.l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-4 border-t border-border pt-4 space-y-2 text-sm">
              {(o.items as any[]).map((i: any, idx: number) => (
                <div key={idx} className="flex justify-between">
                  <div>
                    <p>{i.quantity}x {i.title}</p>
                    {i.customization?.text && <p className="text-xs text-muted-foreground italic">"{i.customization.text}"</p>}
                    {i.customization?.imageUrl && <a href={i.customization.imageUrl} target="_blank" rel="noreferrer" className="text-xs text-accent underline">Ver arte enviada</a>}
                  </div>
                  <span>{brl(i.price * i.quantity)}</span>
                </div>
              ))}
            </div>
            {o.notes && <p className="mt-3 text-xs text-muted-foreground">Obs: {o.notes}</p>}
          </div>
        ))}
        {orders?.length === 0 && <p className="text-muted-foreground">Nenhum pedido ainda.</p>}
      </div>
    </div>
  );
}
