import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface AuthCtx {
  user: User | null;
  session: Session | null;
  loading: boolean;
  roleLoading: boolean;
  isAdmin: boolean;
  profile: any;
  fetchUserData: (userId: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [roleLoading, setRoleLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [profile, setProfile] = useState<any>(null);

  const fetchUserData = async (userId: string) => {
    setRoleLoading(true);
    const [roleRes, profileRes] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userId)
        .eq("role", "admin")
        .maybeSingle(),
      supabase
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle()
    ]);
    
    setIsAdmin(!roleRes.error && !!roleRes.data);
    setProfile(profileRes.data || null);
    setRoleLoading(false);
  };

  useEffect(() => {
    let mounted = true;

    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      setSession(s);
      setLoading(false);
      if (s?.user) {
        fetchUserData(s.user.id);
      } else {
        setIsAdmin(false);
        setProfile(null);
        setRoleLoading(false);
      }
    });
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session);
      setLoading(false);
      if (data.session?.user) {
        fetchUserData(data.session.user.id);
      } else {
        setIsAdmin(false);
        setProfile(null);
        setRoleLoading(false);
      }
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return (
    <Ctx.Provider value={{
      user: session?.user ?? null,
      session,
      loading,
      roleLoading,
      isAdmin,
      profile,
      fetchUserData,
      signOut: async () => { await supabase.auth.signOut(); },
    }}>
      {children}
    </Ctx.Provider>
  );
}

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth requires AuthProvider");
  return c;
};
