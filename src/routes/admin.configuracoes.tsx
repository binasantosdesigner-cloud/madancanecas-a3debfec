import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin/configuracoes")({ component: AdminSettings });

function AdminSettings() {
  const queryClient = useQueryClient();
  const [settings, setSettings] = useState({
    whatsapp_number: "",
    pix_key: "",
    pix_key_type: "",
    pix_beneficiary: "",
    pix_city: "",
    pix_percent_due: "50",
    cnpj: "",
  });
  const [saving, setSaving] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ["admin_settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('settings')
        .select('key, value')
        .in('key', ['whatsapp_number', 'pix_key', 'pix_key_type', 'pix_beneficiary', 'pix_city', 'pix_percent_due', 'cnpj']);
      
      if (error) throw error;
      
      const map: Record<string, string> = {};
      data?.forEach(item => {
        if (item.key) {
          map[item.key] = item.value || "";
        }
      });
      return map;
    },
  });

  useEffect(() => {
    if (data) {
      setSettings(prev => ({
        ...prev,
        ...data
      }));
    }
  }, [data]);

  const formatCNPJ = (v: string) => {
    const d = v.replace(/\D/g, '').slice(0, 14);
    if (d.length <= 2) return d;
    if (d.length <= 5) return d.slice(0, 2) + '.' + d.slice(2);
    if (d.length <= 8) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5);
    if (d.length <= 12) return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8);
    return d.slice(0, 2) + '.' + d.slice(2, 5) + '.' + d.slice(5, 8) + '/' + d.slice(8, 12) + '-' + d.slice(12);
  };

  const handleSave = async (keys: string[], cardId: string) => {
    setSaving(cardId);
    try {
      const updates = keys.map(key => ({
        key,
        value: (settings as any)[key] || "",
        updated_at: new Date().toISOString()
      }));

      const { error } = await supabase.from('settings').upsert(updates, { onConflict: 'key' });
      
      if (error) throw error;
      
      toast.success("Configurações salvas!");
      queryClient.invalidateQueries({ queryKey: ["admin_settings"] });
    } catch (error: any) {
      toast.error(error.message || "Erro ao salvar configurações");
    } finally {
      setSaving(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl space-y-8 pb-12">
      <header>
        <h1 className="font-serif text-3xl text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">Gerencie os dados de contato, pagamentos e informações da empresa.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* CARD 1 — Contato e Pedidos */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Contato e Pedidos</CardTitle>
            <CardDescription>Defina o número que receberá as notificações de pedidos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp_number">WhatsApp para receber pedidos</Label>
              <Input 
                id="whatsapp_number"
                value={settings.whatsapp_number} 
                onChange={(e) => setSettings(prev => ({ ...prev, whatsapp_number: e.target.value }))} 
                placeholder="5566984266994" 
              />
              <p className="text-xs text-muted-foreground">Inclua o código do país (55) sem espaços ou símbolos.</p>
            </div>
            <Button 
              onClick={() => handleSave(['whatsapp_number'], 'contact')} 
              disabled={saving === 'contact'}
              className="bg-primary hover:bg-primary/90"
            >
              {saving === 'contact' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </CardContent>
        </Card>

        {/* CARD 3 — Dados da Empresa */}
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Dados da Empresa</CardTitle>
            <CardDescription>Informações legais exibidas no rodapé e documentos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="cnpj">CNPJ</Label>
              <Input 
                id="cnpj"
                value={settings.cnpj} 
                onChange={(e) => setSettings(prev => ({ ...prev, cnpj: formatCNPJ(e.target.value) }))} 
                placeholder="00.000.000/0000-00" 
              />
            </div>
            <Button 
              onClick={() => handleSave(['cnpj'], 'company')} 
              disabled={saving === 'company'}
              className="bg-primary hover:bg-primary/90"
            >
              {saving === 'company' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar
            </Button>
          </CardContent>
        </Card>

        {/* CARD 2 — Configurações de Pagamento PIX */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="font-serif text-xl text-primary">Configurações de Pagamento PIX</CardTitle>
            <CardDescription>Configure os dados para geração automática do QR Code PIX no checkout.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="pix_key_type">Tipo da chave</Label>
                <Select 
                  value={settings.pix_key_type} 
                  onValueChange={(v) => setSettings(prev => ({ ...prev, pix_key_type: v }))}
                >
                  <SelectTrigger id="pix_key_type">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cnpj">CNPJ</SelectItem>
                    <SelectItem value="cpf">CPF</SelectItem>
                    <SelectItem value="email">E-mail</SelectItem>
                    <SelectItem value="telefone">Telefone</SelectItem>
                    <SelectItem value="aleatoria">Chave aleatória</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_key">Chave PIX</Label>
                <Input 
                  id="pix_key"
                  value={settings.pix_key} 
                  onChange={(e) => setSettings(prev => ({ ...prev, pix_key: e.target.value }))} 
                  placeholder="46960905000104" 
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_beneficiary">Nome do beneficiário</Label>
                <Input 
                  id="pix_beneficiary"
                  value={settings.pix_beneficiary} 
                  onChange={(e) => setSettings(prev => ({ ...prev, pix_beneficiary: e.target.value.toUpperCase() }))} 
                  placeholder="NOME COMPLETO EM MAIÚSCULAS" 
                />
                <p className="text-xs text-muted-foreground">Exatamente como aparece na conta bancária, em maiúsculas, sem acentos.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_city">Cidade</Label>
                <Input 
                  id="pix_city"
                  value={settings.pix_city} 
                  onChange={(e) => setSettings(prev => ({ ...prev, pix_city: e.target.value.slice(0, 15) }))} 
                  placeholder="Rondonopolis" 
                  maxLength={15}
                />
                <p className="text-xs text-muted-foreground">Sem acento, máx. 15 caracteres.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pix_percent_due">Percentual do sinal (%)</Label>
                <div className="flex items-center gap-2">
                  <Input 
                    id="pix_percent_due"
                    type="number"
                    min={1}
                    max={100}
                    value={settings.pix_percent_due} 
                    onChange={(e) => setSettings(prev => ({ ...prev, pix_percent_due: e.target.value }))} 
                    className="w-24"
                  />
                  <span className="text-muted-foreground">%</span>
                </div>
                <p className="text-xs text-muted-foreground">Percentual cobrado antecipado (padrão: 50%).</p>
              </div>
            </div>

            <Button 
              onClick={() => handleSave(['pix_key', 'pix_key_type', 'pix_beneficiary', 'pix_city', 'pix_percent_due'], 'pix')} 
              disabled={saving === 'pix'}
              className="bg-primary hover:bg-primary/90"
            >
              {saving === 'pix' ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Salvar Configurações PIX
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
