import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

export function useFavorites() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: favorites = [] } = useQuery({
    enabled: !!user,
    queryKey: ["favorites", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("product_id")
        .eq("user_id", user!.id);
      return (data ?? []).map((f) => f.product_id);
    },
  });

  const isFavorite = (productId: string) => favorites.includes(productId);

  const toggle = useMutation({
    mutationFn: async (productId: string) => {
      if (!user) {
        toast.error("Faça login para favoritar");
        return;
      }
      if (isFavorite(productId)) {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("product_id", productId);
      } else {
        await supabase
          .from("favorites")
          .insert({ user_id: user.id, product_id: productId });
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["favorites", user?.id] });
    },
  });

  return { favorites, isFavorite, toggle: toggle.mutate };
}
