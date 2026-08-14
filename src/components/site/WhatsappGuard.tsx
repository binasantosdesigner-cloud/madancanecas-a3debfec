import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { WhatsappRequiredModal } from "@/components/site/WhatsappRequiredModal";

export function WhatsappGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!loading && user && profile && !profile.phone) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [loading, user, profile]);

  if (loading) return null;

  return (
    <>
      {children}
      {showModal && user && (
        <WhatsappRequiredModal 
          userId={user.id} 
          onSaved={() => setShowModal(false)} 
        />
      )}
    </>
  );
}
