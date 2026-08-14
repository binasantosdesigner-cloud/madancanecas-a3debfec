import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";

export const Route = createFileRoute("/login")({ component: LoginPage });

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const signIn = async () => {
    if (!email.trim() || !password) { toast.error("Preencha e-mail e senha"); return; }
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (error) { toast.error("E-mail ou senha incorretos"); return; }
    toast.success("Bem-vinda! 💛");
    navigate({ to: "/" });
  };

  const signUp = async () => {
    if (!name.trim()) { toast.error("Informe seu nome"); return; }
    if (!email.trim()) { toast.error("Informe seu e-mail"); return; }
    if (!signupPassword || signupPassword.length < 6) {
      toast.error("A senha deve ter pelo menos 6 caracteres"); return;
    }
    setLoading(true);
    const { error } = await supabase.auth.signUp({
      email,
      password: signupPassword,
      options: { data: { full_name: name }, emailRedirectTo: window.location.origin },
    });
    setLoading(false);
    if (error) {
      toast.error(error.message.includes("already registered")
        ? "Este e-mail já tem uma conta. Faça login."
        : error.message);
      return;
    }
    toast.success("Conta criada! Bem-vinda à Madan 💛");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "#f0e6c8" }}>
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-8">
          <a href="/">
            <img
              src="https://itfknwsdynturbwgaqnc.supabase.co/storage/v1/object/public/assets/Logo-colorida-MADAN.webp"
              alt="Madan Canecas & Personalizados"
              className="h-24 w-auto object-contain"
            />
          </a>
        </div>
        <div className="bg-white/70 backdrop-blur-sm border border-white/60 rounded-2xl shadow-sm p-8">
          <Tabs defaultValue="signin">
            <TabsList className="w-full grid grid-cols-2 mb-6">
              <TabsTrigger value="signin">Entrar</TabsTrigger>
              <TabsTrigger value="signup">Criar conta</TabsTrigger>
            </TabsList>

            <TabsContent value="signin" className="space-y-4">
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signIn()} />
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" placeholder="••••••••" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signIn()} />
              </div>
              <Button onClick={signIn} disabled={loading}
                className="w-full rounded-full mt-2" style={{ background: "#e8509a" }}>
                {loading ? "Entrando..." : "Entrar"}
              </Button>
            </TabsContent>

            <TabsContent value="signup" className="space-y-4">
              <div className="space-y-1.5">
                <Label>Nome completo</Label>
                <Input placeholder="Seu nome" value={name}
                  onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>E-mail</Label>
                <Input type="email" placeholder="seu@email.com" value={email}
                  onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label>Senha</Label>
                <Input type="password" placeholder="Mínimo 6 caracteres"
                  value={signupPassword}
                  onChange={(e) => setSignupPassword(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && signUp()} />
              </div>
              <Button onClick={signUp} disabled={loading}
                className="w-full rounded-full mt-2" style={{ background: "#e8509a" }}>
                {loading ? "Criando conta..." : "Criar conta"}
              </Button>
            </TabsContent>
          </Tabs>
        </div>
        <p className="text-center mt-6 text-sm text-muted-foreground">
          <a href="/" className="hover:text-[#e8509a] transition-colors">← Voltar ao site</a>
        </p>
      </div>
    </div>
  );
}
