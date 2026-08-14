import { Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/lib/favorites";
import { useAuth } from "@/lib/auth";
import { useNavigate } from "@tanstack/react-router";

interface Props {
  productId: string;
  className?: string;
  size?: "sm" | "md";
}

export function FavoriteButton({ productId, className, size = "md" }: Props) {
  const { user } = useAuth();
  const { isFavorite, toggle } = useFavorites();
  const navigate = useNavigate();
  const active = isFavorite(productId);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate({ to: "/login" });
      return;
    }
    toggle(productId);
  };

  return (
    <button
      onClick={handleClick}
      aria-label={active ? "Remover dos favoritos" : "Adicionar aos favoritos"}
      className={cn(
        "flex items-center justify-center rounded-full transition-all",
        size === "md" ? "size-9" : "size-7",
        active
          ? "bg-[#fce8f3] text-[#e8509a]"
          : "bg-white/80 text-muted-foreground hover:text-[#e8509a] hover:bg-[#fce8f3]",
        className
      )}
    >
      <Heart
        className={cn(size === "md" ? "size-4" : "size-3.5",
          active && "fill-[#e8509a]")}
      />
    </button>
  );
}
