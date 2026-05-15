import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/configuracoes")({ component: AdminSettings });

function AdminSettings() {
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);

  const { data } = useQuery({
    queryKey: ["whatsapp_number_admin"],
    queryFn: async () => (await supabase.from("settings").select("value").eq("key", "whatsapp_number").maybeSingle()).data,
  });

  useEffect(() => { if (data?.value) setPhone(data.value); }, [data]);

  const save = async () => {
    setSaving(true);
    const { error } = await supabase.from("settings").update({ value: phone, updated_at: new Date().toISOString() }).eq("key", "whatsapp_number");
    setSaving(false);
    if (error) toast.error(error.message);
    else toast.success("Salvo!");
  };

  return (
    <div className="max-w-lg">
      <h1 className="font-serif text-3xl mb-6">Configurações</h1>
      <div className="p-6 bg-card border border-border rounded-xl space-y-4">
        <div className="space-y-2">
          <Label>WhatsApp para receber pedidos</Label>
          <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="5511999999999" />
          <p className="text-xs text-muted-foreground">Inclua o código do país (55) sem espaços ou símbolos.</p>
        </div>
        <Button onClick={save} disabled={saving}>{saving ? "Salvando..." : "Salvar"}</Button>
      </div>
    </div>
  );
}
