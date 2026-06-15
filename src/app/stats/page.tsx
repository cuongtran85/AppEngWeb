"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { UserStats } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import Link from "next/link";

export default function StatsPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<UserStats | null>(null);

  const fetchStats = useCallback(async (idToken: string) => {
    try {
      const res = await fetch("/api/stats", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      const idToken = await u.getIdToken();
      fetchStats(idToken);
    });
    return unsubscribe;
  }, [router]);

  if (loading) return <LoadingSpinner />;

  if (!stats || stats.totalWords === 0) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          title="Chưa có dữ liệu thống kê"
          description="Hãy bắt đầu thêm từ vựng và ôn tập để xem tiến độ học tập của bạn"
          icon={
            <svg className="w-20 h-20 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
          action={
            <Link
              href="/vocabulary/new"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Thêm từ đầu tiên
            </Link>
          }
        />
      </div>
    );
  }

  const last7Days = getLast7Days(stats.wordsPerDay);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-blue-950 mb-6">Thống kê học tập</h1>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Tổng từ đã lưu" value={stats.totalWords} emoji="📚" color="blue" />
        <StatCard label="Đã học hôm nay" value={stats.learnedToday} emoji="✨" color="green" />
        <StatCard label="Cần ôn hôm nay" value={stats.dueToday} emoji="📈" color="orange" />
        <StatCard label="Streak" value={`${stats.streak} 🔥`} emoji="🔥" color="red" />
      </div>

      {/* Total Reviews */}
      <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Tổng số lần ôn tập</h2>
        <div className="text-4xl font-bold text-blue-600">{stats.totalReviews}</div>
        <p className="text-gray-500 text-sm mt-1">lượt ôn tập</p>
      </div>

      {/* Chart */}
      {last7Days.length > 0 && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Từ học theo ngày (7 ngày gần nhất)</h2>
          <div className="flex items-end gap-2 h-40">
            {last7Days.map((day) => {
              const maxVal = Math.max(...last7Days.map((d) => d.count), 1);
              const heightPct = (day.count / maxVal) * 100;
              const isToday = day.date === new Date().toISOString().split("T")[0];
              return (
                <div key={day.date} className="flex-1 flex flex-col items-center gap-1">
                  <div className="w-full flex flex-col items-center justify-end h-32">
                    <div
                      className={`w-full rounded-t-lg transition-all ${
                        isToday ? "bg-blue-600" : "bg-blue-300"
                      }`}
                      style={{ height: `${Math.max(heightPct, 4)}%` }}
                    />
                  </div>
                  <span className={`text-xs font-medium ${isToday ? "text-blue-600" : "text-gray-400"}`}>
                    {day.label}
                  </span>
                  <span className="text-xs font-bold text-gray-600">{day.count}</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Status breakdown */}
      <div className="bg-white rounded-2xl shadow-card p-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Trạng thái từ vựng</h2>
        <div className="space-y-3">
          {[
            { label: "Mới", color: "bg-blue-500", key: "new" },
            { label: "Đang học", color: "bg-yellow-500", key: "learning" },
            { label: "Đang ôn", color: "bg-orange-500", key: "reviewing" },
            { label: "Đã thuộc", color: "bg-green-500", key: "mastered" },
          ].map((s) => (
            <div key={s.key} className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${s.color}`} />
              <span className="text-sm text-gray-700 flex-1">{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, emoji, color }: { label: string; value: string | number; emoji: string; color: string }) {
  const colorMap: Record<string, string> = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-green-50 text-green-700",
    orange: "bg-orange-50 text-orange-700",
    red: "bg-red-50 text-red-700",
  };
  return (
    <div className={`rounded-2xl p-5 ${colorMap[color]}`}>
      <div className="text-3xl mb-2">{emoji}</div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs mt-1 opacity-75">{label}</div>
    </div>
  );
}

function getLast7Days(wordsPerDay: Record<string, number>) {
  const days = [];
  const dayNames = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    days.push({
      date: dateStr,
      label: dayNames[d.getDay()],
      count: wordsPerDay[dateStr] || 0,
    });
  }
  return days;
}
