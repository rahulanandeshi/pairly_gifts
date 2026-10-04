"use server";

import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

const contactSchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  topic: z.string().trim().min(1),
  message: z.string().trim().min(1).max(4000),
});

// Delivery issues and billing problems are more urgent than general questions.
const HIGH_PRIORITY_TOPICS = new Set(["billing", "delivery"]);

export async function submitContactForm(input: z.infer<typeof contactSchema>) {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) return { error: "Please fill in all fields." };
  const data = parsed.data;

  const session = await auth();

  await prisma.supportTicket.create({
    data: {
      userId: session?.user?.id ?? null,
      name: data.name,
      email: data.email.toLowerCase(),
      topic: data.topic,
      message: data.message,
      priority: HIGH_PRIORITY_TOPICS.has(data.topic) ? "HIGH" : "MEDIUM",
    },
  });

  return { success: true as const };
}
