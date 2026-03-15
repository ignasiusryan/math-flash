"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

interface AdminStats {
  users: { parents: number; children: number };
  active: { today: number; week: number };
  attempts: {
    total: number; today: number; week: number;
    accuracy: number; avgResponseMs: number;
  };
  mastery: { mastered: number; practiced: number };
  leaderboard: Array<{ name: string | null; totalStars: number; streakBest: number }>;
  recentParents: Array<{ name: string | null; email: string | null; createdAt: string }>;
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((res) => {
        if (!res.ok) throw new Error(res.status === 403 ? "Admin access only" : "Failed to load");
        return res.json();
      })
      .then((data) => { setStats(data); setLoading(false); })
      .catch((err) => { setError(err.message); setLoading(false); });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-2xl font-bold text-primary animate-pulse">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <p className="text-xl text-red-500 font-bold">{error}</p>
        <Link href="/" className="text-primary font-medium">← Go Home</Link>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 px-4 py-6">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <Link href="/" className="text-gray-400 font-medium">← Home</Link>
          <h1 className="text-2xl font-bold text-primary">Admin Dashboard</h1>
          <div></div>
        </div>

        {/* Users overview */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          <StatCard value={stats.users.parents} label="Parents" color="text-primary" />
          <StatCard value={stats.users.children} label="Children" color="text-purple" />
          <StatCard value={stats.active.today} label="Active Today" color="text-success" />
          <StatCard value={stats.active.week} label="Active 7d" color="text-warning" />
        </div>

        {/* Attempts */}
        <div className="bg-white rounded-xl p-4 shadow mb-6">
          <h3 className="font-bold text-gray-700 mb-3">Activity</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-gray-500">Total Answers</p>
              <p className="text-2xl font-bold">{stats.attempts.total.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Today</p>
              <p className="text-2xl font-bold">{stats.attempts.today.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">This Week</p>
              <p className="text-2xl font-bold">{stats.attempts.week.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Accuracy</p>
              <p className="text-2xl font-bold text-success">{stats.attempts.accuracy}%</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Avg Response Time</p>
              <p className="text-2xl font-bold">{(stats.attempts.avgResponseMs / 1000).toFixed(1)}s</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Facts Mastered</p>
              <p className="text-2xl font-bold text-success">
                {stats.mastery.mastered} <span className="text-sm text-gray-400 font-normal">/ {stats.mastery.practiced} practiced</span>
              </p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        {stats.leaderboard.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow mb-6">
            <h3 className="font-bold text-gray-700 mb-3">Leaderboard</h3>
            <div className="space-y-2">
              {stats.leaderboard.map((child, i) => (
                <div key={i} className="flex items-center justify-between bg-gray-50 rounded-lg px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-bold text-gray-400 w-6">
                      {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `${i + 1}.`}
                    </span>
                    <span className="font-bold text-gray-700">{child.name || "Unknown"}</span>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <span>⭐ {child.totalStars}</span>
                    <span className="text-gray-400">Best streak: 🔥 {child.streakBest}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent sign-ups */}
        {stats.recentParents.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow">
            <h3 className="font-bold text-gray-700 mb-3">Recent Sign-ups</h3>
            <div className="space-y-2">
              {stats.recentParents.map((p, i) => (
                <div key={i} className="flex items-center justify-between text-sm bg-gray-50 rounded-lg px-3 py-2">
                  <div>
                    <span className="font-bold text-gray-700">{p.name || "—"}</span>
                    <span className="text-gray-400 ml-2">{p.email || ""}</span>
                  </div>
                  <span className="text-gray-400">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div className="bg-white rounded-xl p-3 text-center shadow">
      <p className={`text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-gray-500">{label}</p>
    </div>
  );
}
