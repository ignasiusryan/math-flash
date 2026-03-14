import { prisma } from "./db";

const DEV_MODE = !process.env.CLERK_SECRET_KEY || process.env.CLERK_SECRET_KEY === "sk_test_placeholder";
const DEV_CLERK_ID = "dev_user_001";

export async function getOrCreateUser() {
  if (DEV_MODE) {
    // Dev mode: use a fixed mock user
    let user = await prisma.user.findUnique({ where: { clerkId: DEV_CLERK_ID } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          clerkId: DEV_CLERK_ID,
          name: "Parent",
          email: "dev@mathflash.local",
          role: "PARENT",
        },
      });
    }
    return user;
  }

  // Production mode: use Clerk
  const { auth, currentUser } = await import("@clerk/nextjs/server");
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  let user = await prisma.user.findUnique({ where: { clerkId } });

  if (!user) {
    const clerkUser = await currentUser();
    user = await prisma.user.create({
      data: {
        clerkId,
        name: clerkUser?.firstName || clerkUser?.username || "Player",
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        role: "PARENT",
      },
    });
  }

  return user;
}
