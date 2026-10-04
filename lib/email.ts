import "server-only";
import { Resend } from "resend";

const FROM = process.env.RESEND_FROM_EMAIL || "Pairly <onboarding@resend.dev>";

interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail({ to, subject, html }: SendEmailInput) {
  const apiKey = process.env.RESEND_API_KEY;

  if (!apiKey) {
    // No email provider configured — log instead of failing so the rest of
    // the notification flow still works end-to-end in dev. Add RESEND_API_KEY
    // (and verify a sending domain) to actually deliver these.
    console.log(`[email:not-configured] to=${to} subject="${subject}"`);
    return { sent: false as const };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({ from: FROM, to, subject, html });
    if (error) {
      console.error("[email] Resend send failed", error);
      return { sent: false as const };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[email] Resend send threw", err);
    return { sent: false as const };
  }
}
