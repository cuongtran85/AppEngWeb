"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { VocabularyItem } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { formatNextReview } from "@/lib/spacedRepetition";

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
  learning: { label: "Đang học", color: "bg-yellow-100 text-yellow-700" },
  reviewing: { label: "Đang ôn", color: "bg-orange-100 text-orange-700" },
  mastered: { label: "Đã thuộc", color: "bg-green-100 text-green-700" },
};

export default function VocabularyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchItems = useCallback(async (idToken: string) => {
    try {
      const res = await fetch(`/api/vocabulary?search=${encodeURIComponent(search)}`, {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [user, search]);

  useEffect(() => {
    const unsubscribe = onAuthChange(async (u) => {
      setUser(u);
      if (!u) { router.push("/login"); return; }
      const idToken = await u.getIdToken();
      fetchItems(idToken);
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    if (user) {
      setLoading(true);
      user.getIdToken().then((idToken) => fetchItems(idToken));
    }
  }, [user, search, fetchItems]);

  const filteredItems = filterStatus === "all"
    ? items
    : items.filter((item) => item.status === filterStatus);

  if (!user && !loading) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-blue-950">Từ đã lưu</h1>
          <p className="text-gray-500 text-sm mt-1">
            {items.length} từ vựng
          </p>
        </div>
        <Link
          href="/vocabulary/new"
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Thêm từ mới
        </Link>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm từ..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-400 transition-colors"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-gray-700 focus:border-blue-400 transition-colors"
        >
          <option value="all">Tất cả</option>
          <option value="new">Mới</option>
          <option value="learning">Đang học</option>
          <option value="reviewing">Đang ôn</option>
          <option value="mastered">Đã thuộc</option>
        </select>
      </div>

      {/* List */}
      {loading ? (
        <LoadingSpinner />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          title={search ? "Không tìm thấy từ nào" : "Chưa có từ vựng nào"}
          description={search ? "Thử từ khóa khác" : "Bắt đầu thêm từ vựng đầu tiên của bạn"}
          icon={
            <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          }
          action={
            !search && (
              <Link
                href="/vocabulary/new"
                className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
              >
                Thêm từ đầu tiên
              </Link>
            )
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredItems.map((item) => {
            const status = statusLabels[item.status] || statusLabels.new;
            const storyPreview = item.storyEnglish
              ? item.storyEnglish.slice(0, 100) + (item.storyEnglish.length > 100 ? "..." : "")
              : "Chưa có câu chuyện";
            const createdDate = item.createdAt
              ? new Date(item.createdAt).toLocaleDateString("vi-VN")
              : "";
            const nextReview = formatNextReview(item);

            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl shadow-card p-5 hover:shadow-card-hover transition-shadow"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <h3 className="text-lg font-bold text-gray-900">{item.mainWord}</h3>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <p className="text-gray-500 text-sm mb-2 line-clamp-2">{storyPreview}</p>
                    <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                      <span>📅 {createdDate}</span>
                      <span>📈 {nextReview}</span>
                      {item.reviewCount > 0 && (
                        <span>🔄 {item.reviewCount} lần ôn</span>
                      )}
                    </div>
                  </div>
                  <Link
                    href={`/vocabulary/${item.id}`}
                    className="shrink-0 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl text-sm font-medium hover:bg-blue-100 transition-colors"
                  >
                    Xem chi tiết
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
