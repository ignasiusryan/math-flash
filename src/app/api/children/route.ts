import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET: list children for the logged-in parent
export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const children = await prisma.user.findMany({
    where: { parentId: user.id },
    select: { id: true, name: true, streakCurrent: true, streakBest: true, totalStars: true },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json({ children });
}

// POST: create a new child profile
export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { name } = await req.json();
  if (!name || typeof name !== "string" || name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const child = await prisma.user.create({
    data: {
      clerkId: `child_${user.id}_${Date.now()}`,
      name: name.trim(),
      role: "CHILD",
      parentId: user.id,
    },
  });

  return NextResponse.json({ child: { id: child.id, name: child.name } });
}
