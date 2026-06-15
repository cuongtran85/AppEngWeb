"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { onAuthChange } from "@/lib/auth";
import { User } from "firebase/auth";
import { showToast } from "@/components/Toast";
import LoadingSpinner from "@/components/LoadingSpinner";

interface FormData {
  mainWord: string;
  action: string;
  feeling: string;
  places: string;
  relatedWords: string;
  storyEnglish: string;
  storyVietnamese: string;
}

const fieldLabels: { key: keyof FormData; label: string; placeholder: string; emoji: string }[] = [
  { key: "mainWord", label: "Main Word", placeholder: "e.g. Serendipity", emoji: "📝" },
  { key: "action", label: "Action", placeholder: "e.g. finding something beautiful by chance", emoji: "⚡" },
  { key: "feeling", label: "Feeling", placeholder: "e.g. delight, wonder", emoji: "💫" },
  { key: "places", label: "Places", placeholder: "e.g. a quiet garden, a busy street", emoji: "🌍" },
  { key: "relatedWords", label: "Related Words", placeholder: "e.g. fortune, luck, coincidence", emoji: "🔗" },
  { key: "storyEnglish", label: "Story (English)", placeholder: "Write a short story using this word...", emoji: "📖" },
  { key: "storyVietnamese", label: "Story (Tiếng Việt)", placeholder: "Dịch câu chuyện sang tiếng Việt...", emoji: "🇻🇳" },
];

export default function NewVocabularyPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<FormData>({
    mainWord: "",
    action: "",
    feeling: "",
    places: "",
    relatedWords: "",
    storyEnglish: "",
    storyVietnamese: "",
  });

  useEffect(() => {
    const unsubscribe = onAuthChange((u) => {
      setUser(u);
      setLoading(false);
      if (!u) router.push("/login");
    });
    return unsubscribe;
  }, [router]);

  const handleChange = (key: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.mainWord.trim()) {
      showToast("Vui lòng nhập từ chính", "error");
      return;
    }
    if (!user) return;
    setSaving(true);
    try {
      const idToken = await user.getIdToken();
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        showToast("Lưu từ vựng thành công!", "success");
        router.push("/vocabulary");
      } else {
        const data = await res.json();
        showToast(data.error || "Lưu thất bại", "error");
      }
    } catch {
      showToast("Đã xảy ra lỗi khi lưu", "error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <Link
          href="/vocabulary"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-blue-600 transition-colors mb-4"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Quay lại danh sách
        </Link>
        <h1 className="text-2xl font-bold text-blue-950">Thêm từ vựng mới</h1>
        <p className="text-gray-500 text-sm mt-1">Học từ mới qua ngữ cảnh và câu chuyện</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Main Word */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-2xl">📝</span>
            <label className="text-base font-semibold text-gray-800">Từ chính</label>
          </div>
          <input
            type="text"
            value={form.mainWord}
            onChange={(e) => handleChange("mainWord", e.target.value)}
            placeholder="Nhập từ tiếng Anh..."
            className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 text-lg font-medium placeholder-gray-400 focus:border-blue-400 focus:bg-white transition-colors"
            autoFocus
          />
        </div>

        {/* Context fields */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Ngữ cảnh</h2>
          <div className="space-y-4">
            {fieldLabels.slice(1, 5).map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span>{field.emoji}</span> {field.label}
                </label>
                <input
                  type="text"
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:bg-white transition-colors"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Stories */}
        <div className="bg-white rounded-2xl shadow-card p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-5">Câu chuyện</h2>
          <div className="space-y-4">
            {fieldLabels.slice(5).map((field) => (
              <div key={field.key}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1.5">
                  <span>{field.emoji}</span> {field.label}
                </label>
                <textarea
                  value={form[field.key]}
                  onChange={(e) => handleChange(field.key, e.target.value)}
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-gray-800 placeholder-gray-400 focus:border-blue-400 focus:bg-white transition-colors resize-none"
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pb-8">
          <Link
            href="/vocabulary"
            className="px-6 py-3 bg-gray-100 text-gray-600 rounded-xl font-medium hover:bg-gray-200 transition-colors"
          >
            Hủy
          </Link>
          <button
            type="submit"
            disabled={saving}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors"
          >
            {saving ? "Đang lưu..." : "Lưu từ vựng"}
          </button>
        </div>
      </form>
    </div>
  );
}
