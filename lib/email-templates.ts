import "server-only";
import { SITE_URL } from "@/lib/site";

function layout(bodyHtml: string) {
  return `
  <div style="background:#0b1220;padding:40px 20px;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;">
    <div style="max-width:480px;margin:0 auto;background:#121a2c;border-radius:20px;padding:36px;color:#f3f1ea;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:28px;">
        <div style="width:32px;height:32px;border-radius:50%;background:linear-gradient(135deg,#7c6fff,#c7b9ff,#4cc9ff);"></div>
        <span style="font-size:18px;font-weight:600;">Pairly</span>
      </div>
      ${bodyHtml}
      <p style="margin-top:32px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.1);font-size:12px;color:#9aa0b8;">
        Pairly — every celebration deserves to feel personal.
      </p>
    </div>
  </div>`;
}

function button(url: string, label: string) {
  return `<a href="${url}" style="display:inline-block;margin-top:20px;padding:12px 24px;background:#7c6fff;color:#0b1220;font-weight:600;text-decoration:none;border-radius:999px;font-size:14px;">${label}</a>`;
}

export function cardDeliveredEmail(input: { recipientName: string; senderName: string; cardTitle: string; message: string; greetingId: string }) {
  const url = `${SITE_URL}/gift/${input.greetingId}`;
  return {
    subject: `${input.senderName} sent you something 🎉`,
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">Hi ${input.recipientName},</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        ${input.senderName} just sent you "${input.cardTitle}" on Pairly.
      </p>
      <p style="font-size:14px;line-height:1.6;color:#9aa0b8;font-style:italic;margin:16px 0 0;">
        "${input.message.length > 160 ? `${input.message.slice(0, 160)}…` : input.message}"
      </p>
      ${button(url, "Open Your Card")}
    `),
  };
}

export function paymentSuccessEmail(input: { cardTitle: string; total: number; greetingId: string }) {
  const url = `${SITE_URL}/gift/${input.greetingId}`;
  return {
    subject: "Payment successful",
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">Payment successful</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        Your $${input.total.toFixed(2)} payment for "${input.cardTitle}" went through.
      </p>
      ${button(url, "View Card")}
    `),
  };
}

export function cardOpenedEmail(input: { recipientName: string; cardTitle: string; greetingId: string }) {
  const url = `${SITE_URL}/gift/${input.greetingId}`;
  return {
    subject: "Your card was opened",
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">${input.recipientName} opened your card</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        They just opened "${input.cardTitle}" — say hi!
      </p>
      ${button(url, "View Card")}
    `),
  };
}

export function replyReceivedEmail(input: { recipientName: string; cardTitle: string; replyMessage: string; greetingId: string }) {
  const url = `${SITE_URL}/gift/${input.greetingId}`;
  return {
    subject: `${input.recipientName} replied to your card`,
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">You got a reply!</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        ${input.recipientName} replied to "${input.cardTitle}":
      </p>
      <p style="font-size:14px;line-height:1.6;color:#9aa0b8;font-style:italic;margin:16px 0 0;">
        "${input.replyMessage}"
      </p>
      ${button(url, "View Card")}
    `),
  };
}

export function reactionReceivedEmail(input: { recipientName: string; cardTitle: string; emoji: string; greetingId: string }) {
  const url = `${SITE_URL}/gift/${input.greetingId}`;
  return {
    subject: `${input.recipientName} reacted ${input.emoji} to your card`,
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">You got a reaction!</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        ${input.recipientName} reacted ${input.emoji} to "${input.cardTitle}".
      </p>
      ${button(url, "View Card")}
    `),
  };
}

export function cardApprovedEmail(input: { cardTitle: string }) {
  return {
    subject: "Your card was approved!",
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">"${input.cardTitle}" is live</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        Your card passed review and is now visible in the Pairly marketplace.
      </p>
      ${button(`${SITE_URL}/creator/uploads`, "View Your Uploads")}
    `),
  };
}

export function cardRejectedEmail(input: { cardTitle: string; reason: string | null }) {
  return {
    subject: "Your card needs changes",
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">"${input.cardTitle}" wasn't approved</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        ${input.reason ? input.reason : "Your card didn't pass review this time. Feel free to revise and resubmit."}
      </p>
      ${button(`${SITE_URL}/creator/uploads`, "View Your Uploads")}
    `),
  };
}

export function passwordResetEmail(input: { resetUrl: string }) {
  return {
    subject: "Reset your Pairly password",
    html: layout(`
      <h1 style="font-size:22px;font-weight:600;margin:0 0 12px;">Reset your password</h1>
      <p style="font-size:15px;line-height:1.6;color:#e7e4dc;margin:0;">
        Click below to choose a new password. This link expires in an hour.
      </p>
      ${button(input.resetUrl, "Reset Password")}
    `),
  };
}
