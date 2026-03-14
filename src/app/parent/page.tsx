"use client";

import { useState, useEffect } from "react";
import ProgressGrid from "@/components/ProgressGrid";
import Link from "next/link";
import { parseFactKey } from "@/lib/facts";

interface Child {
  id: string;
  name: string;
  streakCurrent: number;
  streakBest: number;
  totalStars: number;
}

interface Stats {
  child: { name: string; streakCurrent: number; streakBest: number; totalStars: number };
  factStates: Array<{ factKey: string; bucket: number; correctCount: number; wrongCount: number }>;
  summary: {
    totalFacts: number; mastered: number; learning: number;
    needsWork: number; notStarted: number; totalAttempts: number;
    correctAttempts: number; accuracy: number;
  };
  struggles: Array<{ factKey: string; bucket: number; wrongCount: number; correctCount: number }>;
}

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/children")
      .then((res) => res.json())
      .then((data) => {
        setChildren(data.children || []);
        if (data.children?.length > 0) setSelectedChildId(data.children[0].id);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (!selectedChildId) return;
    setStats(null);
    fetch(`/api/stats?childId=${selectedChildId}`)
      .then((res) => res.json())
      .then((data) => setStats(data));
  }, [selectedChildId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/play" className="text-gray-400 font-medium">← Back</Link>
          <h1 className="text-2xl font-bold text-primary">Parent Dashboard</h1>
          <div></div>
        </div>

        {/* Child tabs */}
        {children.length > 0 && (
          <div className="flex gap-2 mb-6 overflow-x-auto">
            {children.map((child) => (
              <button
                key={child.id}
                onClick={() => setSelectedChildId(child.id)}
                className={`px-4 py-2 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedChildId === child.id
                    ? "bg-primary text-white shadow"
                    : "bg-white text-gray-600 hover:bg-blue-50"
                }`}
              >
                {child.name}
              </button>
            ))}
          </div>
        )}

        {children.length === 0 && (
          <div className="text-center py-12">
            <p className="text-xl text-gray-500 mb-4">No players yet!</p>
            <Link href="/play" className="text-primary font-bold text-lg">Add a player →</Link>
          </div>
        )}

        {stats && (
          <div className="space-y-6">
            {/* Overview cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white rounded-xl p-3 text-center shadow">
                <p className="text-xl font-bold text-primary">{stats.summary.totalAttempts}</p>
                <p className="text-xs text-gray-500">Attempts</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow">
                <p className="text-xl font-bold text-success">{stats.summary.accuracy}%</p>
                <p className="text-xs text-gray-500">Accuracy</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow">
                <p className="text-xl font-bold text-green-600">{stats.summary.mastered}</p>
                <p className="text-xs text-gray-500">Mastered</p>
              </div>
              <div className="bg-white rounded-xl p-3 text-center shadow">
                <p className="text-xl font-bold text-yellow-500">⭐ {stats.child.totalStars}</p>
                <p className="text-xs text-gray-500">Stars</p>
              </div>
            </div>

            {/* Progress bar */}
            <div className="bg-white rounded-xl p-4 shadow">
              <div className="flex justify-between text-sm font-medium mb-2">
                <span>Overall Progress</span>
                <span>{stats.summary.mastered} / {stats.summary.totalFacts} mastered</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-4 flex overflow-hidden">
                <div
                  className="bg-green-500 transition-all"
                  style={{ width: `${(stats.summary.mastered / Math.max(stats.summary.totalFacts, 1)) * 100}%` }}
                />
                <div
                  className="bg-yellow-400 transition-all"
                  style={{ width: `${(stats.summary.learning / Math.max(stats.summary.totalFacts, 1)) * 100}%` }}
                />
                <div
                  className="bg-red-400 transition-all"
                  style={{ width: `${(stats.summary.needsWork / Math.max(stats.summary.totalFacts, 1)) * 100}%` }}
                />
              </div>
            </div>

            {/* Struggles */}
            {stats.struggles.length > 0 && (
              <div className="bg-white rounded-xl p-4 shadow">
                <h3 className="font-bold text-gray-700 mb-3">Needs More Practice</h3>
                <div className="space-y-2">
                  {stats.struggles.map((s) => {
                    const parsed = parseFactKey(s.factKey);
                    return (
                      <div key={s.factKey} className="flex items-center justify-between bg-red-50 rounded-lg px-3 py-2">
                        <span className="font-bold text-gray-700">
                          {parsed.a} × {parsed.b} = {parsed.answer}
                        </span>
                        <span className="text-sm text-gray-500">
                          {s.correctCount}✓ / {s.wrongCount}✗
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Grid */}
            <div className="bg-white rounded-xl p-4 shadow">
              <h3 className="font-bold text-gray-700 mb-3">Mastery Grid</h3>
              <ProgressGrid factStates={stats.factStates} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
