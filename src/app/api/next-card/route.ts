import { NextRequest, NextResponse } from "next/server";
import { getOrCreateUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { getAllFacts, parseFactKey } from "@/lib/facts";
import { selectCard, randomOrdering } from "@/lib/spaced-repetition";

export async function GET(req: NextRequest) {
  const user = await getOrCreateUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const childId = req.nextUrl.searchParams.get("childId");
  if (!childId) return NextResponse.json({ error: "childId required" }, { status: 400 });

  // Verify this child belongs to the parent
  const child = await prisma.user.findFirst({
    where: { id: childId, parentId: user.id },
  });
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  // Lazy init: create FactState rows if none exist
  const existingCount = await prisma.factState.count({ where: { userId: childId } });
  if (existingCount === 0) {
    const allFacts = getAllFacts();
    await prisma.factState.createMany({
      data: allFacts.map((f) => ({
        userId: childId,
        factKey: f.factKey,
        bucket: 0,
        nextReview: new Date(),
      })),
    });
  }

  // Optional: filter by specific table (e.g., table=7 means only facts involving 7)
  const table = req.nextUrl.searchParams.get("table");

  // Get eligible cards (nextReview <= now)
  const now = new Date();
  const eligible = await prisma.factState.findMany({
    where: { userId: childId, nextReview: { lte: now } },
    orderBy: [{ bucket: "asc" }, { lastSeen: "asc" }],
  });

  // Filter by table if specified
  const filterByTable = (facts: typeof eligible) => {
    if (!table) return facts;
    const t = Number(table);
    return facts.filter((f) => {
      const [a, b] = f.factKey.split("x").map(Number);
      return a === t || b === t;
    });
  };

  const recentlyShown = req.nextUrl.searchParams.get("recent")?.split(",") || [];

  const filteredEligible = filterByTable(eligible);

  let selected;
  if (filteredEligible.length > 0) {
    selected = selectCard(
      filteredEligible.map((e) => ({ factKey: e.factKey, bucket: e.bucket, lastSeen: e.lastSeen })),
      recentlyShown
    );
  } else {
    // All mastered recently - pick the one coming up soonest
    const allFacts = await prisma.factState.findMany({
      where: { userId: childId },
      orderBy: { nextReview: "asc" },
    });
    const filtered = filterByTable(allFacts);
    if (filtered.length > 0) {
      selected = { factKey: filtered[0].factKey, bucket: filtered[0].bucket, lastSeen: filtered[0].lastSeen };
    }
  }

  if (!selected) {
    return NextResponse.json({ done: true });
  }

  const parsed = parseFactKey(selected.factKey);
  const ordering = randomOrdering(parsed.a, parsed.b);

  return NextResponse.json({
    factKey: selected.factKey,
    first: ordering.first,
    second: ordering.second,
    bucket: selected.bucket,
  });
}
