import "server-only";
import { prisma } from "@/lib/prisma";

export async function getSentGreetingById(id: string) {
  return prisma.sentGreeting.findUnique({
    where: { id },
    include: {
      card: true,
      sender: { select: { name: true } },
      giftCard: { include: { brand: true } },
    },
  });
}
