import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const factStates = await prisma.factState.findMany({
    where: { userId: childId },
    orderBy: { factKey: "asc" },
  });

  const totalAttempts = await prisma.attempt.count({ where: { userId: childId } });
  const correctAttempts = await prisma.attempt.count({
    where: { userId: childId, correct: true },
  });

  // Recent struggles: facts in bucket 0-1 sorted by wrongCount
  const struggles = factStates
    .filter((f) => f.bucket <= 1 && f.wrongCount > 0)
    .sort((a, b) => b.wrongCount - a.wrongCount)
    .slice(0, 10);

  const mastered = factStates.filter((f) => f.bucket >= 3).length;
  const learning = factStates.filter((f) => f.bucket === 1 || f.bucket === 2).length;
  const needsWork = factStates.filter((f) => f.bucket === 0 && f.correctCount + f.wrongCount > 0).length;
  const notStarted = factStates.filter((f) => f.correctCount + f.wrongCount === 0).length;

  return NextResponse.json({
    child: {
      name: child.name,
      streakCurrent: child.streakCurrent,
      streakBest: child.streakBest,
      totalStars: child.totalStars,
    },
    factStates,
    summary: {
      totalFacts: factStates.length,
      mastered,
      learning,
      needsWork,
      notStarted,
      totalAttempts,
      correctAttempts,
      accuracy: totalAttempts > 0 ? Math.round((correctAttempts / totalAttempts) * 100) : 0,
    },
    struggles,
  });
}
