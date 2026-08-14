import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Outlet, Link, createRootRouteWithContext, useRouter, HeadContent } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/lib/auth";
import { CartProvider } from "@/lib/cart";
import { WhatsAppFloat } from "@/components/site/WhatsAppFloat";
import { WhatsappGuard } from "@/components/site/WhatsappGuard";


function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-serif">404</h1>
        <p className="mt-2 text-sm text-muted-foreground">Página não encontrada.</p>
        <Link to="/" className="mt-6 inline-flex rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">Voltar ao início</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="font-serif text-2xl">Algo deu errado</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-full bg-primary px-6 py-2 text-sm text-primary-foreground">Tentar novamente</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { title: "Madan Canecas & Personalizados | Presentes únicos" },
      { name: "description", content: "Canecas, camisetas, copos e canetas personalizadas com acabamento premium." },
      { property: "og:title", content: "Madan Canecas & Personalizados | Presentes únicos" },
      { name: "twitter:title", content: "Madan Canecas & Personalizados | Presentes únicos" },
      { property: "og:description", content: "Canecas, camisetas, copos e canetas personalizadas com acabamento premium." },
      { name: "twitter:description", content: "Canecas, camisetas, copos e canetas personalizadas com acabamento premium." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8d85bf47-563e-4c91-85f6-f4cbd35c7cc9/id-preview-a3ba7c22--da58ec83-7f1f-4c56-8319-14cc37b713b6.lovable.app-1781476258886.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/8d85bf47-563e-4c91-85f6-f4cbd35c7cc9/id-preview-a3ba7c22--da58ec83-7f1f-4c56-8319-14cc37b713b6.lovable.app-1781476258886.png" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <WhatsappGuard>
            <HeadContent />
            <Outlet />
            <Toaster position="top-center" />
            <WhatsAppFloat />
          </WhatsappGuard>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
