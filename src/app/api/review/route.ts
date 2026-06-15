import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";
import { getNextReviewParams } from "@/lib/spacedRepetition";
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

    const now = new Date().toISOString();
    const dueItems = snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() } as VocabularyItem))
      .filter((item) => !item.nextReviewAt || item.nextReviewAt <= now)
      .sort((a, b) => {
        if (!a.nextReviewAt) return -1;
        if (!b.nextReviewAt) return 1;
        return new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime();
      });

    return NextResponse.json({ items: dueItems });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch due items" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await req.json();
    const { vocabularyId, rating } = body;

    if (!vocabularyId || !rating) {
      return NextResponse.json({ error: "vocabularyId and rating are required" }, { status: 400 });
    }

    const docRef = getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .doc(vocabularyId);

    const doc = await docRef.get();
    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const item = { id: doc.id, ...doc.data() } as VocabularyItem;
    const reviewParams = getNextReviewParams(item, rating);

    await docRef.update({
      ...reviewParams,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true, ...reviewParams });
  } catch (error) {
    return NextResponse.json({ error: "Failed to submit review" }, { status: 500 });
  }
}
