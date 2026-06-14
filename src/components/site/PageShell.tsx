import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

export function PageHero({ eyebrow, title, subtitle }: { eyebrow?: string; title: string; subtitle?: string }) {
  return (
    <section className="border-b border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-4xl px-6 py-20 text-center">
        {eyebrow && (
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground mb-4">{eyebrow}</p>
        )}
        <h1 className="font-serif text-4xl md:text-5xl tracking-tight">{title}</h1>
        {subtitle && <p className="mt-5 text-muted-foreground max-w-2xl mx-auto text-lg">{subtitle}</p>}
      </div>
    </section>
  );
}

export const WHATSAPP_URL = "https://wa.me/5566984266994";
export const EMAIL = "madan.canecas@gmail.com";