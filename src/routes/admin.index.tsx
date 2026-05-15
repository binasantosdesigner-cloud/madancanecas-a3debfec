import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { brl } from "@/lib/format";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";

export const Route = createFileRoute("/admin/")({ component: AdminDashboard });

function AdminDashboard() {
  const { data: orders } = useQuery({
    queryKey: ["admin-orders"],
    queryFn: async () => (await supabase.from("orders").select("*")).data ?? [],
  });

  const total = orders?.reduce((a, b: any) => a + Number(b.total), 0) ?? 0;
  const pending = orders?.filter((o: any) => o.status === "pending").length ?? 0;

  // pedidos por dia (últimos 7)
  const byDay: Record<string, number> = {};
  const now = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(now); d.setDate(d.getDate() - i);
    byDay[d.toLocaleDateString("pt-BR", { weekday: "short" })] = 0;
  }
  orders?.forEach((o: any) => {
    const d = new Date(o.created_at);
    if ((now.getTime() - d.getTime()) < 7 * 86400000) {
      const k = d.toLocaleDateString("pt-BR", { weekday: "short" });
      if (k in byDay) byDay[k]++;
    }
  });
  const chartData = Object.entries(byDay).map(([day, count]) => ({ day, count }));

  // top produtos
  const counts: Record<string, number> = {};
  orders?.forEach((o: any) => (o.items as any[]).forEach((i) => { counts[i.title] = (counts[i.title] ?? 0) + i.quantity; }));
  const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-8">
      <h1 className="font-serif text-3xl">Dashboard</h1>
      <div className="grid sm:grid-cols-3 gap-4">
        <Card label="Pedidos" value={String(orders?.length ?? 0)} />
        <Card label="Pendentes" value={String(pending)} />
        <Card label="Faturamento Estimado" value={brl(total)} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="font-serif text-xl mb-4">Pedidos (últimos 7 dias)</h2>
          <div className="h-64">
            <ResponsiveContainer>
              <BarChart data={chartData}>
                <XAxis dataKey="day" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" fill="oklch(0.72 0.11 70)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="p-6 bg-card border border-border rounded-xl">
          <h2 className="font-serif text-xl mb-4">Mais Vendidos</h2>
          {top.length === 0 ? <p className="text-muted-foreground text-sm">Sem dados</p> : (
            <ul className="space-y-3">
              {top.map(([title, qty]) => (
                <li key={title} className="flex justify-between text-sm">
                  <span>{title}</span><span className="font-semibold">{qty}x</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl">
      <p className="text-xs uppercase tracking-widest text-muted-foreground">{label}</p>
      <p className="font-serif text-3xl mt-2">{value}</p>
    </div>
  );
}
