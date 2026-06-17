import { createFileRoute, Outlet, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import {
  SidebarProvider, Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarMenu, SidebarMenuItem, SidebarMenuButton,
  SidebarHeader, SidebarFooter, SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  LayoutDashboard, Package, ShoppingBag, Users, Tag, Palette, Settings,
  ArrowLeft, LogOut,
} from "lucide-react";

export const Route = createFileRoute("/admin")({ component: AdminLayout });

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };
const NAV: NavItem[] = [
  { to: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/admin/pedidos", label: "Pedidos", icon: ShoppingBag },
  { to: "/admin/usuarios", label: "Usuários", icon: Users },
  { to: "/admin/produtos", label: "Produtos", icon: Package },
  { to: "/admin/categorias", label: "Categorias", icon: Tag },
  { to: "/admin/pagamentos", label: "Pagamentos", icon: ShoppingBag },
  { to: "/admin/artes", label: "Aprovação de Artes", icon: Palette },
  { to: "/admin/configuracoes", label: "Configurações", icon: Settings },
];

function AdminLayout() {
  const { user, isAdmin, loading, roleLoading, signOut } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading || roleLoading) return;
    if (!user) navigate({ to: "/login" });
  }, [user, isAdmin, loading, roleLoading, navigate]);

  if (loading || roleLoading || !user) {
    return <div className="min-h-screen grid place-items-center bg-background">Verificando…</div>;
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen grid place-items-center bg-background px-4">
        <div className="max-w-md text-center space-y-4">
          <h1 className="font-serif text-3xl text-foreground">Acesso negado</h1>
          <p className="text-sm text-muted-foreground">
            Esta área é restrita à equipe administrativa da Madan.
          </p>
          <Button asChild variant="outline" className="rounded-full">
            <Link to="/">Voltar ao site</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <Sidebar collapsible="icon">
          <SidebarHeader className="px-4 py-4">
            <div className="font-serif text-lg text-primary">Madan Admin</div>
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Gerenciar</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {NAV.map((item) => (
                    <SidebarMenuItem key={item.to}>
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link
                          to={item.to}
                          activeOptions={{ exact: !!item.exact }}
                          activeProps={{ "data-active": "true" } as Record<string, string>}
                          className="flex items-center gap-2"
                        >
                          <item.icon className="h-4 w-4" />
                          <span>{item.label}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
          <SidebarFooter className="gap-1 p-2">
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Voltar para o site">
                  <Link to="/" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4" />
                    <span>Voltar ao site</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                  tooltip="Sair"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sair</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 flex flex-col min-w-0">
          <header className="h-14 flex items-center gap-3 border-b border-border bg-card px-4 sticky top-0 z-10">
            <SidebarTrigger />
            <div className="font-medium text-foreground">Painel Administrativo</div>
          </header>
          <main className="flex-1 p-4 md:p-8 overflow-x-hidden"><Outlet /></main>
        </div>
      </div>
    </SidebarProvider>
  );
}
