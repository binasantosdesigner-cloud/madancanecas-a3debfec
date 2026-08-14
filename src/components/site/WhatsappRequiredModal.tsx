import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface Props {
  userId: string;
  onSaved: () => void;
}

function formatPhone(val: string) {
  const digits = val.replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function WhatsappRequiredModal({ userId, onSaved }: Props) {
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);

  const save = async () => {
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      toast.error("Informe um WhatsApp válido com DDD");
      return;
    }
    setLoading(true);
    const { error } = await supabase
      .from("profiles")
      .update({ phone: digits })
      .eq("id", userId);
    setLoading(false);
    if (error) {
      toast.error("Erro ao salvar: " + error.message);
      return;
    }
    toast.success("WhatsApp salvo! 💛");
    onSaved();
  };

  return (
    /* Overlay — cobre toda a tela, sem fechar ao clicar fora, sem botão X */
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(4px)" }}
    >
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl p-8">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <img
            src="https://itfknwsdynturbwgaqnc.supabase.co/storage/v1/object/public/assets/Logo-colorida-MADAN.webp"
            alt="Madan"
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Título */}
        <h2 className="text-xl font-semibold text-center mb-1">
          Seu WhatsApp, por favor 💬
        </h2>
        <p className="text-sm text-muted-foreground text-center mb-6">
          Precisamos do seu WhatsApp para enviar atualizações sobre seu pedido.
          Esta etapa é obrigatória.
        </p>

        {/* Campo */}
        <div className="space-y-1.5 mb-4">
          <Label>WhatsApp com DDD</Label>
          <Input
            type="tel"
            placeholder="(66) 99999-9999"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            maxLength={15}
            onKeyDown={(e) => e.key === "Enter" && save()}
            className="text-center text-lg tracking-widest"
          />
        </div>

        {/* Botão — sem alternativa de fechar */}
        <Button
          onClick={save}
          disabled={loading}
          className="w-full rounded-full"
          style={{ background: "#e8509a" }}
        >
          {loading ? "Salvando..." : "Salvar e continuar"}
        </Button>

        <p className="text-[11px] text-muted-foreground text-center mt-4">
          Seu número é usado apenas para contato sobre pedidos. Nunca compartilhamos com terceiros.
        </p>
      </div>
    </div>
  );
}
