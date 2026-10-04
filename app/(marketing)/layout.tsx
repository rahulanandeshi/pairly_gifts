import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { auth } from "@/auth";
import { getUnreadNotificationCount } from "@/lib/dashboard";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  const unreadCount = session?.user ? await getUnreadNotificationCount(session.user.id) : 0;

  return (
    <>
      <Navbar initialUnreadCount={unreadCount} />
      <main className="flex-1">{children}</main>
      <Footer />
    </>
  );
}
