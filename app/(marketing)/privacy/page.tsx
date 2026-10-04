import type { Metadata } from "next";
import { LegalContent } from "@/components/shared/legal-content";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <LegalContent
      updated="July 1, 2026"
      sections={[
        {
          heading: "1. Information we collect",
          body: [
            "We collect information you provide directly, such as your name, email address, photos, voice recordings, and videos you upload when creating a card, as well as payment information processed by our payment provider.",
            "We also collect usage data — pages visited, cards created, and interaction patterns — to improve the product experience.",
          ],
        },
        {
          heading: "2. How we use your information",
          body: [
            "We use your information to deliver the greeting cards and gifts you create, personalize your experience, process payments, and communicate with you about your account.",
            "Voice and photo uploads are used solely to generate the card experience you request and are never used to train third-party AI models without explicit consent.",
          ],
        },
        {
          heading: "3. Sharing your information",
          body: [
            "We share information with service providers who help us operate the platform (hosting, payments, delivery) under strict confidentiality agreements. We never sell your personal data.",
          ],
        },
        {
          heading: "4. Your choices",
          body: [
            "You can access, update, or delete your account information at any time from Settings. You may also request a full export or deletion of your data by contacting privacy@pairly.com.",
          ],
        },
        {
          heading: "5. Data retention & security",
          body: [
            "We retain your data for as long as your account is active, and use industry-standard encryption both in transit and at rest to protect it.",
          ],
        },
        {
          heading: "6. Contact",
          body: ["Questions about this policy can be sent to privacy@pairly.com."],
        },
      ]}
    />
  );
}
