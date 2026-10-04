import "server-only";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";

type NotificationType = "DELIVERY" | "GIFT" | "BILLING" | "SYSTEM";

interface NotifyUserInput {
  userId: string;
  type: NotificationType;
  title: string;
  body: string;
  /** In-app path to navigate to when the notification is clicked, e.g. a sent card's detail page. */
  link?: string;
  /** When provided, also emails the user (in addition to the in-app Notification row). */
  email?: { subject: string; html: string };
}

/** Creates the in-app Notification row and, if an email payload is given, sends it too. */
export async function notifyUser({ userId, type, title, body, link, email }: NotifyUserInput) {
  const [user] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { email: true } }),
    prisma.notification.create({ data: { userId, type, title, body, link } }),
  ]);

  if (email && user?.email) {
    await sendEmail({ to: user.email, subject: email.subject, html: email.html });
  }
}
