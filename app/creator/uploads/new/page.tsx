import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardPageShell } from "@/components/dashboard/page-shell";
import { CreateCardForm } from "@/components/creator/create-card-form";
import { CREATOR_NAV } from "@/lib/dashboard-nav";
import { auth } from "@/auth";
import { getAllOccasions, getAllCultures } from "@/lib/cards";

export const metadata: Metadata = { title: "Upload New Card" };

export default async function NewCardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const [occasions, cultures] = await Promise.all([getAllOccasions(), getAllCultures()]);

  return (
    <DashboardPageShell title="Upload New Card" description="Submit a new card design for review." nav={CREATOR_NAV} brand="Pairly Creator">
      <CreateCardForm occasions={occasions} cultures={cultures} />
    </DashboardPageShell>
  );
}
