import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { PlusIcon } from "@phosphor-icons/react/dist/ssr";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { GlassPanel } from "@/components/shared/glass-panel";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { AvatarSvg } from "@/components/wizard/avatar-svg";
import { auth } from "@/auth";
import { getUserAvatars } from "@/lib/dashboard";
import type { AvatarConfig } from "@/lib/store/wizard-store";

export const metadata: Metadata = { title: "Avatar Library" };

export default async function AvatarLibraryPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const avatars = await getUserAvatars(session.user.id);

  return (
    <DashboardPageShell
      title="Avatar Library"
      description="Avatars you've built — reuse them in any new card."
      action={<Button render={<Link href="/create/personalize" />} className="cursor-pointer gap-1.5 rounded-full"><PlusIcon size={14} weight="bold" /> New Avatar</Button>}
    >
      {avatars.length > 0 ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {avatars.map((a) => (
            <GlassPanel key={a.id} className="flex flex-col items-center gap-3 p-5 text-center">
              <div className="aspect-square w-24">
                <AvatarSvg config={a.config as unknown as AvatarConfig} animate={false} />
              </div>
              <p className="text-sm font-medium">{a.name}</p>
              <Button variant="outline" size="sm" render={<Link href="/create/personalize" />} className="cursor-pointer rounded-full text-xs">
                Use This Avatar
              </Button>
            </GlassPanel>
          ))}
        </div>
      ) : (
        <EmptyState title="No saved avatars yet" description="Build an avatar in the card wizard to save it here for reuse." />
      )}
    </DashboardPageShell>
  );
}
