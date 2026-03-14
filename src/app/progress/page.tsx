"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ProgressGrid from "@/components/ProgressGrid";
import Link from "next/link";

interface Stats {
  child: { name: string; streakCurrent: number; streakBest: number; totalStars: number };
  factStates: Array<{ factKey: string; bucket: number; correctCount: number; wrongCount: number }>;
  summary: {
    totalFacts: number; mastered: number; learning: number;
    needsWork: number; notStarted: number; totalAttempts: number;
    accuracy: number;
  };
}

function ProgressContent() {
  const searchParams = useSearchParams();
  const childId = searchParams.get("childId");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!childId) { setLoading(false); return; }
    fetch(`/api/stats?childId=${childId}`)
      .then((res) => res.json())
      .then((data) => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [childId]);

  if (!childId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-gray-500">No player selected</p>
        <Link href="/play" className="text-primary font-bold text-lg">Go to Play →</Link>
      </div>
    );
  }

  if (loading || !stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 px-4 py-6">
      <div className="max-w-md mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/play" className="text-gray-400 font-medium">← Back</Link>
          <h1 className="text-2xl font-bold text-primary">{stats.child.name}&apos;s Progress</h1>
          <div></div>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <p className="text-2xl font-bold text-yellow-500">⭐ {stats.child.totalStars}</p>
            <p className="text-xs text-gray-500">Stars</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <p className="text-2xl font-bold text-orange-500">🔥 {stats.child.streakBest}</p>
            <p className="text-xs text-gray-500">Best Streak</p>
          </div>
          <div className="bg-white rounded-xl p-3 text-center shadow">
            <p className="text-2xl font-bold text-success">{stats.summary.accuracy}%</p>
            <p className="text-xs text-gray-500">Accuracy</p>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <h3 className="font-bold text-gray-700 mb-3">Progress</h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Mastered</span>
              <span className="font-bold text-success">{stats.summary.mastered} / {stats.summary.totalFacts}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-success rounded-full h-3 transition-all"
                style={{ width: `${(stats.summary.mastered / Math.max(stats.summary.totalFacts, 1)) * 100}%` }}
              />
            </div>
            <div className="flex gap-4 text-xs text-gray-500 mt-1">
              <span>Learning: {stats.summary.learning}</span>
              <span>Needs work: {stats.summary.needsWork}</span>
              <span>Not started: {stats.summary.notStarted}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-4 shadow">
          <h3 className="font-bold text-gray-700 mb-3">Multiplication Grid</h3>
          <ProgressGrid factStates={stats.factStates} />
        </div>

        <div className="text-center mt-6">
          <Link
            href="/play"
            className="inline-block bg-primary text-white text-xl font-bold py-3 px-8 rounded-xl shadow-lg"
          >
            Keep Practicing!
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ProgressPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    }>
      <ProgressContent />
    </Suspense>
  );
}
