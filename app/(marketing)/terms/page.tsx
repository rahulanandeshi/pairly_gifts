import type { Metadata } from "next";
import { LegalContent } from "@/components/shared/legal-content";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <LegalContent
      updated="July 1, 2026"
      sections={[
        {
          heading: "1. Acceptance of terms",
          body: [
            "By creating an account or using Pairly, you agree to these Terms of Service and our Privacy Policy. If you do not agree, please do not use the platform.",
          ],
        },
        {
          heading: "2. Accounts & subscriptions",
          body: [
            "You are responsible for maintaining the confidentiality of your account credentials. Premium subscriptions renew automatically until cancelled and are billed to the payment method on file.",
          ],
        },
        {
          heading: "3. Content you upload",
          body: [
            "You retain ownership of the photos, videos, voice recordings, and messages you upload. By uploading content, you grant Pairly a limited license to use it solely to generate and deliver the card or gift you create.",
            "You are responsible for ensuring you have the right to use any content you upload, including photos or voices of other people.",
          ],
        },
        {
          heading: "4. Prohibited use",
          body: [
            "You may not use Pairly to send harassing, hateful, or illegal content, impersonate others without consent, or attempt to circumvent our content moderation systems.",
          ],
        },
        {
          heading: "5. Gift cards & payments",
          body: [
            "Gift cards are issued by their respective brands and subject to the issuer's own terms. Pairly is not responsible for how third-party gift cards are redeemed once delivered.",
          ],
        },
        {
          heading: "6. Termination",
          body: [
            "We reserve the right to suspend or terminate accounts that violate these terms. You may cancel your account at any time from Settings.",
          ],
        },
        {
          heading: "7. Contact",
          body: ["Questions about these terms can be sent to legal@pairly.com."],
        },
      ]}
    />
  );
}
