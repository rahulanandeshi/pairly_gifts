import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { sendSms } from "@/lib/sms";
import { cardDeliveredEmail } from "@/lib/email-templates";
import { SITE_URL } from "@/lib/site";

// Vercel Cron (see vercel.json) hits this on a schedule to deliver SentGreeting
// rows whose scheduledFor time has arrived. Also safe to call manually/from
// another scheduler — it's idempotent (only touches status=SCHEDULED rows).
export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const due = await prisma.sentGreeting.findMany({
    where: { status: "SCHEDULED", scheduledFor: { lte: new Date() } },
    include: { card: true, sender: true },
  });

  let delivered = 0;
  let failed = 0;

  for (const greeting of due) {
    try {
      await prisma.sentGreeting.update({
        where: { id: greeting.id },
        data: { status: "DELIVERED", sentAt: new Date() },
      });

      const senderName = greeting.sender.name || "Someone";
      if (greeting.deliveryChannel === "EMAIL") {
        const { subject, html } = cardDeliveredEmail({
          recipientName: greeting.recipientName,
          senderName,
          cardTitle: greeting.card.title,
          message: greeting.message ?? "",
          greetingId: greeting.id,
        });
        await sendEmail({ to: greeting.recipientEmail, subject, html });
      } else if (greeting.deliveryChannel === "SMS" && greeting.recipientPhone) {
        await sendSms(
          greeting.recipientPhone,
          `${senderName} sent you "${greeting.card.title}" on Pairly! Open it: ${SITE_URL}/gift/${greeting.id}`,
        );
      }
      // "LINK" channel: nothing sent automatically — sender shares the link themselves.

      delivered += 1;
    } catch (err) {
      console.error(`[cron:process-scheduled] failed to deliver ${greeting.id}`, err);
      failed += 1;
    }
  }

  return NextResponse.json({ processed: due.length, delivered, failed });
}
