import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { WhatsappRequiredModal } from "@/components/site/WhatsappRequiredModal";

export function WhatsappGuard({ children }: { children: React.ReactNode }) {
  const { user, profile, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);
  const { user: authUser, profile: authProfile, loading: authLoading, fetchUserData } = useAuth();

  useEffect(() => {
    if (!authLoading && authUser && authProfile && !authProfile.phone) {
      setShowModal(true);
    } else {
      setShowModal(false);
    }
  }, [authLoading, authUser, authProfile]);

  const handleSaved = useCallback(async () => {
    if (authUser?.id && fetchUserData) {
      await fetchUserData(authUser.id);
    }
    setShowModal(false);
  }, [authUser?.id, fetchUserData]);

  if (authLoading) return null;

  return (
    <>
      {children}
      {showModal && authUser && (
        <WhatsappRequiredModal 
          userId={authUser.id} 
          onSaved={handleSaved} 
        />
      )}
    </>
  );
}
