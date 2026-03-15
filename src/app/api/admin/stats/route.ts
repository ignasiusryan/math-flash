import { NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Only allow the first registered parent (you) to see admin stats
  const firstParent = await prisma.user.findFirst({
    where: { role: "PARENT" },
    orderBy: { createdAt: "asc" },
  });
  if (user.id !== firstParent?.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Total parents and children
  const totalParents = await prisma.user.count({ where: { role: "PARENT" } });
  const totalChildren = await prisma.user.count({ where: { role: "CHILD" } });

  // Active today: children who have attempts today
  const activeToday = await prisma.attempt.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: today } },
  });

  // Active this week
  const activeWeek = await prisma.attempt.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: week } },
  });

  // Total attempts
  const totalAttempts = await prisma.attempt.count();
  const attemptsToday = await prisma.attempt.count({ where: { createdAt: { gte: today } } });
  const attemptsWeek = await prisma.attempt.count({ where: { createdAt: { gte: week } } });

  // Accuracy
  const correctTotal = await prisma.attempt.count({ where: { correct: true } });

  // Average response time
  const avgResponse = await prisma.attempt.aggregate({
    _avg: { responseMs: true },
    where: { correct: true },
  });

  // Facts mastered across all children (bucket >= 3)
  const masteredFacts = await prisma.factState.count({ where: { bucket: { gte: 3 } } });
  const totalFactStates = await prisma.factState.count({ where: { correctCount: { gt: 0 } } });

  // Leaderboard: top children by stars
  const leaderboard = await prisma.user.findMany({
    where: { role: "CHILD", totalStars: { gt: 0 } },
    orderBy: { totalStars: "desc" },
    take: 10,
    select: { name: true, totalStars: true, streakBest: true },
  });

  // Recent sign-ups (parents)
  const recentParents = await prisma.user.findMany({
    where: { role: "PARENT" },
    orderBy: { createdAt: "desc" },
    take: 10,
    select: { name: true, email: true, createdAt: true },
  });

  return NextResponse.json({
    users: { parents: totalParents, children: totalChildren },
    active: { today: activeToday.length, week: activeWeek.length },
    attempts: {
      total: totalAttempts,
      today: attemptsToday,
      week: attemptsWeek,
      accuracy: totalAttempts > 0 ? Math.round((correctTotal / totalAttempts) * 100) : 0,
      avgResponseMs: Math.round(avgResponse._avg.responseMs || 0),
    },
    mastery: { mastered: masteredFacts, practiced: totalFactStates },
    leaderboard,
    recentParents,
  });
}
