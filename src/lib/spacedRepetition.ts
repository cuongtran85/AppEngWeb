import { VocabularyItem, ReviewRating } from "@/types";

const MIN_EASE_FACTOR = 1.3;
const DEFAULT_EASE_FACTOR = 2.5;

export function getNextReviewParams(item: VocabularyItem, rating: ReviewRating) {
  let interval = item.interval;
  let easeFactor = item.easeFactor || DEFAULT_EASE_FACTOR;

  switch (rating) {
    case "forgot":
      interval = 1;
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.2);
      break;
    case "hard":
      interval = Math.max(1, Math.round(interval * 1.2));
      easeFactor = Math.max(MIN_EASE_FACTOR, easeFactor - 0.15);
      break;
    case "remember":
      interval = Math.round(interval * easeFactor);
      break;
    case "easy":
      interval = Math.round(interval * easeFactor * 1.3);
      easeFactor = easeFactor + 0.1;
      break;
  }

  if (item.reviewCount === 0 && rating === "remember") {
    interval = 1;
  } else if (item.reviewCount === 0 && rating === "easy") {
    interval = 4;
  } else if (item.reviewCount === 1 && rating === "remember") {
    interval = 6;
  } else if (item.reviewCount === 1 && rating === "easy") {
    interval = 10;
  }

  const nextReviewAt = new Date();
  nextReviewAt.setDate(nextReviewAt.getDate() + interval);
  nextReviewAt.setHours(0, 0, 0, 0);

  return {
    interval,
    easeFactor,
    lastReviewedAt: new Date().toISOString(),
    nextReviewAt: nextReviewAt.toISOString(),
    reviewCount: item.reviewCount + 1,
    status: getStatus(rating, item.status),
  };
}

function getStatus(rating: ReviewRating, currentStatus: VocabularyItem["status"]): VocabularyItem["status"] {
  if (rating === "forgot") return "learning";
  if (currentStatus === "new") return "learning";
  if (currentStatus === "learning") return "reviewing";
  if (rating === "easy" && currentStatus === "reviewing") return "mastered";
  return "reviewing";
}

export function isDueForReview(item: VocabularyItem): boolean {
  if (!item.nextReviewAt) return true;
  return new Date(item.nextReviewAt) <= new Date();
}

export function getDaysUntilReview(item: VocabularyItem): number | null {
  if (!item.nextReviewAt) return null;
  const diff = new Date(item.nextReviewAt).getTime() - new Date().getTime();
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}

export function formatNextReview(item: VocabularyItem): string {
  if (!item.nextReviewAt) return "Chưa ôn";
  const days = getDaysUntilReview(item);
  if (days === null) return "Chưa ôn";
  if (days <= 0) return "Đến hạn";
  if (days === 1) return "Ngày mai";
  return `${days} ngày`;
}
