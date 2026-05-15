import type { CartItem } from "./cart";
import { brl } from "./format";

export function buildWhatsAppMessage(opts: {
  customerName: string;
  items: CartItem[];
  total: number;
  delivery: string;
  notes?: string;
}) {
  const lines: string[] = [];
  lines.push("*Novo Pedido — Madan Canecas & Personalizados*", "");
  lines.push(`*Cliente:* ${opts.customerName}`);
  lines.push(`*Entrega:* ${opts.delivery}`);
  lines.push("", "*Itens:*");
  for (const it of opts.items) {
    lines.push(`• ${it.quantity}x ${it.title} — ${brl(it.price * it.quantity)}`);
    if (it.customization?.text) lines.push(`   ↳ Texto: ${it.customization.text}`);
    if (it.customization?.imageUrl) lines.push(`   ↳ Arte: ${it.customization.imageUrl}`);
    if (it.customization?.variations) {
      for (const [k, v] of Object.entries(it.customization.variations)) {
        lines.push(`   ↳ ${k}: ${v}`);
      }
    }
  }
  lines.push("", `*Total:* ${brl(opts.total)}`);
  if (opts.notes) lines.push("", `*Observações:* ${opts.notes}`);
  return lines.join("\n");
}

export function whatsappLink(phone: string, message: string) {
  const clean = phone.replace(/\D/g, "");
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`;
}
