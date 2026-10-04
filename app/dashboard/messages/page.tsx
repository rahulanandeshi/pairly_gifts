import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";
import { SavedMessagesList } from "@/components/dashboard/saved-messages-list";
import { auth } from "@/auth";
import { getSavedMessages } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Saved Messages" };

export default async function SavedMessagesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const messages = await getSavedMessages(session.user.id);

  return (
    <DashboardPageShell
      title="Saved Messages"
      description="AI-generated and hand-written messages you've saved for later."
      action={<Button render={<Link href="/create/personalize" />} className="cursor-pointer rounded-full">New Message</Button>}
    >
      {messages.length > 0 ? (
        <SavedMessagesList messages={messages} />
      ) : (
        <EmptyState title="No saved messages yet" description="Messages you write in the card wizard can be saved for reuse." />
      )}
    </DashboardPageShell>
  );
}
