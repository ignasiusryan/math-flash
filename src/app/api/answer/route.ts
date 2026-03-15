import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { parseFactKey } from "@/lib/facts";
import { getNextBucket, getNextReviewDate, wasTooSlow } from "@/lib/spaced-repetition";

export async function POST(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { childId, factKey, presented, answer, responseMs } = await req.json();

  if (!childId || !factKey || answer === undefined) {
    return NextResponse.json({ error: "Missing fields" }, { status: 400 });
  }

  // Verify child belongs to parent
  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const parsed = parseFactKey(factKey);
  const correct = Number(answer) === parsed.answer;

  // Get current fact state
  const factState = await prisma.factState.findUnique({
    where: { userId_factKey: { userId: childId, factKey } },
  });

  if (!factState) {
    return NextResponse.json({ error: "Fact not found" }, { status: 404 });
  }

  const newBucket = getNextBucket(factState.bucket, correct, responseMs);
  const nextReview = getNextReviewDate(newBucket);
  const tooSlow = correct && wasTooSlow(factState.bucket, responseMs || 0);

  // Update fact state
  await prisma.factState.update({
    where: { id: factState.id },
    data: {
      bucket: newBucket,
      correctCount: correct ? factState.correctCount + 1 : factState.correctCount,
      wrongCount: correct ? factState.wrongCount : factState.wrongCount + 1,
      lastSeen: new Date(),
      nextReview,
    },
  });

  // Log attempt
  await prisma.attempt.create({
    data: {
      userId: childId,
      factKey,
      presented: presented || `${parsed.a} × ${parsed.b}`,
      answer: Number(answer),
      correct,
      responseMs: responseMs || 0,
    },
  });

  // Update streak
  const newStreak = correct ? child.streakCurrent + 1 : 0;
  const starsEarned = correct ? 1 : 0;
  const bonusStars = [10, 25, 50].includes(newStreak) ? 5 : 0;

  await prisma.user.update({
    where: { id: childId },
    data: {
      streakCurrent: newStreak,
      streakBest: Math.max(child.streakBest, newStreak),
      totalStars: child.totalStars + starsEarned + bonusStars,
    },
  });

  return NextResponse.json({
    correct,
    correctAnswer: parsed.answer,
    newStreak,
    starsEarned: starsEarned + bonusStars,
    totalStars: child.totalStars + starsEarned + bonusStars,
    isMilestone: [10, 25, 50].includes(newStreak),
    tooSlow,
  });
}
