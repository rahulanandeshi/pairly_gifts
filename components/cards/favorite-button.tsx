"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { HeartIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { toggleFavorite } from "@/app/dashboard/actions";
import { cn } from "@/lib/utils";

export function FavoriteButton({ cardId, initialFavorited }: { cardId: string; initialFavorited: boolean }) {
  const router = useRouter();
  const [favorited, setFavorited] = React.useState(initialFavorited);
  const [pending, setPending] = React.useState(false);

  const handleClick = async () => {
    setPending(true);
    const result = await toggleFavorite(cardId);
    setPending(false);
    if (result.error || result.favorited === undefined) {
      toast.error(result.error ?? "Something went wrong.");
      return;
    }
    setFavorited(result.favorited);
    router.refresh();
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={handleClick}
      className="cursor-pointer gap-1.5 rounded-full text-sm"
    >
      <HeartIcon size={15} weight={favorited ? "fill" : "regular"} className={cn(favorited && "text-coral")} />
      {favorited ? "Saved to Favorites" : "Add to Favorites"}
    </Button>
  );
}
