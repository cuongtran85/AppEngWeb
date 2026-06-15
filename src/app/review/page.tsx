"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { VocabularyItem, ReviewRating } from "@/types";
import LoadingSpinner from "@/components/LoadingSpinner";
import EmptyState from "@/components/EmptyState";
import { showToast } from "@/components/Toast";

const ratingButtons: { rating: ReviewRating; label: string; emoji: string; color: string; desc: string }[] = [
  { rating: "forgot", label: "Quên", emoji: "😵", color: "bg-red-500 hover:bg-red-600", desc: "Nhắc lại trong 1 ngày" },
  { rating: "hard", label: "Khó", emoji: "😓", color: "bg-orange-500 hover:bg-orange-600", desc: "Tăng nhẹ khoảng cách" },
  { rating: "remember", label: "Nhớ", emoji: "😊", color: "bg-blue-500 hover:bg-blue-600", desc: "Tăng bình thường" },
  { rating: "easy", label: "Rất dễ", emoji: "🤩", color: "bg-green-500 hover:bg-green-600", desc: "Tăng mạnh" },
];

export default function ReviewPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<VocabularyItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [reviewing, setReviewing] = useState(false);
  const [sessionDone, setSessionDone] = useState(false);
  const [reviewedCount, setReviewedCount] = useState(0);

  const fetchDueItems = useCallback(async (idToken: string) => {
    try {
      const res = await fetch("/api/review", {
        headers: { Authorization: `Bearer ${idToken}` },
      });
      if (res.ok) {
        const data = await res.json();
        setItems(data.items);
        if (data.items.length > 0) {
          setSessionDone(false);
          setCurrentIndex(0);
          setShowAnswer(false);
          setReviewedCount(0);
        }
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
      fetchDueItems(idToken);
    });
    return unsubscribe;
  }, [router]);

  const handleRating = async (rating: ReviewRating) => {
    if (!user || reviewing) return;
    const currentItem = items[currentIndex];
    if (!currentItem) return;

    setReviewing(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/review", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ vocabularyId: currentItem.id, rating }),
      });

      if (res.ok) {
        setReviewedCount((c) => c + 1);
        const labels: Record<ReviewRating, string> = {
          forgot: "Quên",
          hard: "Khó",
          remember: "Nhớ",
          easy: "Rất dễ",
        };
        showToast(`${labels[rating]} — đã ghi nhận!`, "success");

        if (currentIndex + 1 >= items.length) {
          setSessionDone(true);
        } else {
          setCurrentIndex((i) => i + 1);
          setShowAnswer(false);
        }
      }
    } catch {
      showToast("Đã xảy ra lỗi", "error");
    } finally {
      setReviewing(false);
    }
  };

  const restartSession = () => {
    if (user) {
      setLoading(true);
      setSessionDone(false);
      setCurrentIndex(0);
      setShowAnswer(false);
      setReviewedCount(0);
      user.getIdToken().then((idToken) => fetchDueItems(idToken));
    }
  };

  if (loading) return <LoadingSpinner />;

  if (sessionDone) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16 text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h1 className="text-2xl font-bold text-blue-950 mb-2">Hoàn thành!</h1>
        <p className="text-gray-500 mb-8">
          Bạn đã ôn {reviewedCount} từ trong phiên này
        </p>
        <div className="space-y-3">
          <Link
            href="/vocabulary"
            className="block w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem danh sách từ
          </Link>
          {items.length > 0 && (
            <button
              onClick={restartSession}
              className="block w-full py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
            >
              Ôn lại ({items.length} từ còn lại)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 sm:px-6 py-16">
        <EmptyState
          title="Không có từ nào cần ôn"
          description="Tất cả từ vựng của bạn đã được ôn tập. Quay lại sau nhé!"
          icon={
            <svg className="w-20 h-20 text-blue-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          action={
            <Link
              href="/vocabulary"
              className="px-6 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
            >
              Xem từ đã lưu
            </Link>
          }
        />
      </div>
    );
  }

  const current = items[currentIndex];

  return (
    <div className="max-w-lg mx-auto px-4 sm:px-6 py-8">
      {/* Progress */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold text-blue-950">Ôn tập</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">
            {currentIndex + 1} / {items.length}
          </span>
          <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${((currentIndex + 1) / items.length) * 100}%` }}
            />
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-3xl shadow-card p-8 mb-6 text-center">
        <div className="text-4xl font-bold text-blue-950 mb-6">{current.mainWord}</div>

        {!showAnswer ? (
          <button
            onClick={() => setShowAnswer(true)}
            className="px-8 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Xem ngữ cảnh
          </button>
        ) : (
          <div className="text-left space-y-4 animate-fade-in">
            {current.action && (
              <ContextRow emoji="⚡" label="Action" value={current.action} />
            )}
            {current.feeling && (
              <ContextRow emoji="💫" label="Feeling" value={current.feeling} />
            )}
            {current.places && (
              <ContextRow emoji="🌍" label="Places" value={current.places} />
            )}
            {current.relatedWords && (
              <ContextRow emoji="🔗" label="Related" value={current.relatedWords} />
            )}
            {current.storyEnglish && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-gray-700 italic text-sm leading-relaxed">
                  &ldquo;{current.storyEnglish}&rdquo;
                </p>
                {current.storyVietnamese && (
                  <p className="text-gray-500 text-sm mt-2">
                    {current.storyVietnamese}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Rating buttons */}
      {showAnswer && (
        <div className="grid grid-cols-2 gap-3 animate-fade-in">
          {ratingButtons.map((btn) => (
            <button
              key={btn.rating}
              onClick={() => handleRating(btn.rating)}
              disabled={reviewing}
              className={`py-4 px-3 rounded-2xl text-white font-semibold transition-all disabled:opacity-50 ${btn.color}`}
            >
              <div className="text-2xl mb-1">{btn.emoji}</div>
              <div className="text-sm">{btn.label}</div>
              <div className="text-xs opacity-75 font-normal">{btn.desc}</div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ContextRow({ emoji, label, value }: { emoji: string; label: string; value: string }) {
  return (
    <div className="flex gap-3">
      <span className="text-lg shrink-0">{emoji}</span>
      <div>
        <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">{label}: </span>
        <span className="text-gray-700">{value}</span>
      </div>
    </div>
  );
}
