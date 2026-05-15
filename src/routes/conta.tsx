import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { brl } from "@/lib/format";

export const Route = createFileRoute("/conta")({ component: AccountPage });

const statusLabel: Record<string, string> = {
  pending: "Pendente", in_production: "Em Produção", shipped: "Enviado", completed: "Concluído", cancelled: "Cancelado",
};

function AccountPage() {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading, navigate]);

  const { data: orders } = useQuery({
    enabled: !!user,
    queryKey: ["orders", user?.id],
    queryFn: async () => (await supabase.from("orders").select("*").order("created_at", { ascending: false })).data ?? [],
  });

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1 mx-auto max-w-5xl px-6 py-12 w-full">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-serif text-4xl">Minha Conta</h1>
            <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          </div>
          <Button variant="outline" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>Sair</Button>
        </div>

        <h2 className="font-serif text-2xl mb-6">Meus Pedidos</h2>
        {orders?.length === 0 ? (
          <div className="text-center py-12 border border-dashed border-border rounded-xl">
            <p className="text-muted-foreground">Você ainda não fez nenhum pedido.</p>
            <Link to="/produtos" className="inline-block mt-4"><Button>Ver Produtos</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders?.map((o: any) => (
              <div key={o.id} className="p-6 border border-border rounded-xl bg-card">
                <div className="flex flex-wrap justify-between gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Pedido #{o.id.slice(0, 8)}</p>
                    <p className="text-sm mt-1">{new Date(o.created_at).toLocaleDateString("pt-BR")}</p>
                  </div>
                  <Badge className="h-fit">{statusLabel[o.status]}</Badge>
                </div>
                <div className="mt-4 text-sm text-muted-foreground">
                  {(o.items as any[]).map((i: any, idx: number) => <div key={idx}>{i.quantity}x {i.title}</div>)}
                </div>
                <div className="mt-4 flex justify-between border-t border-border pt-4">
                  <span className="text-sm">Total</span>
                  <span className="font-semibold">{brl(Number(o.total))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
