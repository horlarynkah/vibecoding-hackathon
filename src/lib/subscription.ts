import { prisma } from "@/lib/prisma";

export type SubscriptionStatus = "FREE" | "PRO";

export async function getSubscriptionStatus(
  userId: string
): Promise<SubscriptionStatus> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { subscriptionStatus: true },
  });
  if (!user) return "FREE";

  return user.subscriptionStatus === "PRO" ? "PRO" : "FREE";
}

export async function isProUser(userId: string): Promise<boolean> {
  return (await getSubscriptionStatus(userId)) === "PRO";
}

