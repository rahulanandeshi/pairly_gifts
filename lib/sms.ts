import "server-only";

// TODO: No SMS provider is wired up yet — this is a placeholder.
//
// There isn't a genuinely free general-purpose SMS API. Firebase doesn't fit
// here either: Firebase Phone Auth sends SMS, but only one-time verification
// codes for its own sign-in flow, not arbitrary messages like "X sent you a
// card." Twilio is the standard choice for that (trial credit to start,
// ~$0.0079/SMS after, well-documented REST API) — the integration below is
// wired for it. Sign up at https://www.twilio.com, buy/verify a from-number,
// then set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, and TWILIO_FROM_NUMBER to
// enable real sending. Untested against a live account — verify before relying on it.
export async function sendSms(to: string, body: string) {
  const sid = process.env.TWILIO_ACCOUNT_SID;
  const token = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM_NUMBER;

  if (!sid || !token || !from) {
    console.log(`[sms:not-configured] to=${to} body="${body}"`);
    return { sent: false as const };
  }

  try {
    const auth = Buffer.from(`${sid}:${token}`).toString("base64");
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${auth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: from, Body: body }),
    });
    if (!res.ok) {
      console.error("[sms] Twilio send failed", await res.text());
      return { sent: false as const };
    }
    return { sent: true as const };
  } catch (err) {
    console.error("[sms] Twilio send threw", err);
    return { sent: false as const };
  }
}
