export interface VocabularyItem {
  id: string;
  mainWord: string;
  action: string;
  feeling: string;
  places: string;
  relatedWords: string;
  storyEnglish: string;
  storyVietnamese: string;
  createdAt: string;
  updatedAt: string;
  reviewCount: number;
  lastReviewedAt: string | null;
  nextReviewAt: string | null;
  easeFactor: number;
  interval: number;
  status: "new" | "learning" | "reviewing" | "mastered";
}

export interface UserStats {
  totalWords: number;
  learnedToday: number;
  dueToday: number;
  totalReviews: number;
  streak: number;
  wordsPerDay: Record<string, number>;
}

export type ReviewRating = "forgot" | "hard" | "remember" | "easy";

export interface ReviewResult {
  vocabularyId: string;
  rating: ReviewRating;
  reviewedAt: string;
}
