import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Header } from "@/components/site/Header";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

function AdminLayout() {
  const { user, isAdmin, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (!isAdmin) navigate({ to: "/" });
  }, [user, isAdmin, loading, navigate]);

  if (loading || !user || !isAdmin) {
    return <div className="min-h-screen grid place-items-center">Verificando...</div>;
  }

  const tabs = [
    { to: "/admin", label: "Dashboard", exact: true },
    { to: "/admin/produtos", label: "Produtos" },
    { to: "/admin/pedidos", label: "Pedidos" },
    { to: "/admin/configuracoes", label: "Configurações" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <div className="border-b border-border bg-card">
        <div className="mx-auto max-w-7xl px-6 flex gap-6 overflow-x-auto">
          {tabs.map((t) => (
            <Link key={t.to} to={t.to} activeOptions={{ exact: t.exact }}
              activeProps={{ className: "border-b-2 border-accent text-foreground" }}
              className="py-4 text-sm whitespace-nowrap text-muted-foreground hover:text-foreground">
              {t.label}
            </Link>
          ))}
        </div>
      </div>
      <main className="flex-1 mx-auto max-w-7xl px-6 py-8 w-full"><Outlet /></main>
    </div>
  );
}
