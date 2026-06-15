"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { VocabularyItem } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import { formatNextReview } from "@/lib/spacedRepetition";
import { showToast } from "@/components/Toast";

const statusLabels: Record<string, { label: string; color: string }> = {
  new: { label: "Mới", color: "bg-blue-100 text-blue-700" },
  learning: { label: "Đang học", color: "bg-yellow-100 text-yellow-700" },
  reviewing: { label: "Đang ôn", color: "bg-orange-100 text-orange-700" },
  mastered: { label: "Đã thuộc", color: "bg-green-100 text-green-700" },
};

export default function VocabularyDetailPage() {
  const router = useRouter();
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [item, setItem] = useState<VocabularyItem | null>(null);
  const [nextItemId, setNextItemId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      if (!u) router.push("/login");
    });
    return unsubscribe;
  }, [router]);

  useEffect(() => {
    async function fetchData() {
      if (!user || !params.id) return;
      setLoading(true);
      try {
        const idToken = await user.getIdToken();

        const [detailRes, listRes] = await Promise.all([
          fetch(`/api/vocabulary/${params.id}`, {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
          fetch("/api/vocabulary", {
            headers: { Authorization: `Bearer ${idToken}` },
          }),
        ]);

        if (detailRes.ok) {
          const data = await detailRes.json();
          setItem(data);
        }

        if (listRes.ok) {
          const listData = await listRes.json();
          const currentIndex = listData.items.findIndex((i: any) => i.id === params.id);
          if (currentIndex !== -1 && currentIndex < listData.items.length - 1) {
            setNextItemId(listData.items[currentIndex + 1].id);
          } else if (listData.items.length > 1) {
            setNextItemId(listData.items[0].id);
          }
        }
      } catch {
      } finally {
        setLoading(false);
      }
    }
    if (user) fetchData();
  }, [user, params.id]);

  const handleDelete = async () => {
    if (!user || !item || !confirm("Bạn có chắc muốn xóa từ này?")) return;
    setDeleting(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch(`/api/vocabulary/${item.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        showToast("Xóa từ vựng thành công!", "success");
        router.push("/vocabulary");
      } else {
        showToast("Xóa thất bại", "error");
        setDeleting(false);
      }
    } catch {
      showToast("Đã xảy ra lỗi", "error");
      setDeleting(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (!item) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-gray-500">Không tìm thấy từ vựng</p>
        <Link href="/vocabulary" className="text-blue-600 hover:underline mt-2 inline-block">
          Quay lại danh sách
        </Link>
      </div>
    );
  }

  const status = statusLabels[item.status] || statusLabels.new;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-32">
      <Link
        href="/vocabulary"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Quay lại danh sách
      </Link>

      <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
        <div className="flex items-center gap-3 mb-4">
          <h1 className="text-2xl font-bold text-blue-950">{item.mainWord}</h1>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${status.color}`}>
            {status.label}
          </span>
        </div>

        <div className="space-y-4">
          {item.action && (
            <DetailRow emoji="⚡" label="Action" value={item.action} />
          )}
          {item.feeling && (
            <DetailRow emoji="💫" label="Feeling" value={item.feeling} />
          )}
          {item.places && (
            <DetailRow emoji="🌍" label="Places" value={item.places} />
          )}
          {item.relatedWords && (
            <DetailRow emoji="🔗" label="Related Words" value={item.relatedWords} />
          )}
        </div>
      </div>

      {/* Story English */}
      {item.storyEnglish && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">📖</span>
            <h2 className="text-lg font-semibold text-gray-800">Story (English)</h2>
          </div>
          <p className="text-gray-700 leading-relaxed italic">&ldquo;{item.storyEnglish}&rdquo;</p>
        </div>
      )}

      {/* Story Vietnamese */}
      {item.storyVietnamese && (
        <div className="bg-white rounded-2xl shadow-card p-6 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xl">🇻🇳</span>
            <h2 className="text-lg font-semibold text-gray-800">Dịch tiếng Việt</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">&ldquo;{item.storyVietnamese}&rdquo;</p>
        </div>
      )}

      {/* Spaced Repetition Info */}
      <div className="bg-blue-50 rounded-2xl shadow-card p-6 mb-4">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">Thông tin ôn tập</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatItem label="Số lần ôn" value={item.reviewCount.toString()} />
          <StatItem
            label="Lần ôn gần nhất"
            value={item.lastReviewedAt
              ? new Date(item.lastReviewedAt).toLocaleDateString("vi-VN")
              : "Chưa ôn"}
          />
          <StatItem label="Ôn tiếp theo" value={formatNextReview(item)} />
          <StatItem
            label="Khoảng cách"
            value={item.interval ? `${item.interval} ngày` : "—"}
          />
        </div>
      </div>

      {/* Delete */}
      <button
        onClick={handleDelete}
        disabled={deleting}
        className="w-full py-3 bg-red-50 text-red-600 rounded-xl font-medium hover:bg-red-100 disabled:opacity-50 transition-colors"
      >
        {deleting ? "Đang xóa..." : "Xóa từ vựng"}
      </button>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-blue-100 px-4 py-3 safe-bottom">
        <div className="max-w-3xl mx-auto flex gap-3">
          <Link
            href="/vocabulary"
            className="px-5 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Quay lại
          </Link>
          {nextItemId && (
            <Link
              href={`/vocabulary/${nextItemId}`}
              className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold text-center hover:bg-blue-700 transition-colors"
            >
              Từ kế tiếp →
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

function DetailRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg mt-0.5">{emoji}</span>
      <div>
        <span className="text-sm font-medium text-gray-500">{label}: </span>
        <span className="text-gray-800">{value}</span>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-blue-700">{value}</p>
      <p className="text-xs text-blue-500 mt-1">{label}</p>
    </div>
  );
}
