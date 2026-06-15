import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { VocabularyItem } from "@/types";

async function verifyIdToken(idToken: string) {
  try {
    const decoded = await admin.auth().verifyIdToken(idToken);
    return decoded.uid;
  } catch {
    return null;
  }
}

export async function GET(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const snapshot = await getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .get();

    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const todayStr = todayStart.toISOString().split("T")[0];

    const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() } as VocabularyItem));

    const totalWords = items.length;
    const learnedToday = items.filter(
      (item) => item.lastReviewedAt && item.lastReviewedAt >= todayStr
    ).length;

    const dueToday = items.filter(
      (item) => !item.nextReviewAt || new Date(item.nextReviewAt) <= now
    ).length;

    const totalReviews = items.reduce((sum, item) => sum + item.reviewCount, 0);

    const wordsPerDay: Record<string, number> = {};
    items.forEach((item) => {
      if (item.lastReviewedAt) {
        const day = item.lastReviewedAt.split("T")[0];
        wordsPerDay[day] = (wordsPerDay[day] || 0) + 1;
      }
    });

    const sortedDays = Object.keys(wordsPerDay).sort();
    let streak = 0;
    for (let i = sortedDays.length - 1; i >= 0; i--) {
      const expected = new Date(todayStr);
      expected.setDate(expected.getDate() - (sortedDays.length - 1 - i));
      if (sortedDays[i] === expected.toISOString().split("T")[0]) {
        streak++;
      } else {
        break;
      }
    }

    return NextResponse.json({
      totalWords,
      learnedToday,
      dueToday,
      totalReviews,
      streak,
      wordsPerDay,
    });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
