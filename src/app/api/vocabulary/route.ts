import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/lib/firebaseAdmin";
import admin from "firebase-admin";

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

  const { searchParams } = new URL(req.url);
  const search = searchParams.get("search") || "";

  try {
    const db = getDb();
    let query = db
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .orderBy("createdAt", "desc") as admin.firestore.Query;

    const snapshot = await query.get();
    let items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (search) {
      items = items.filter((item: any) =>
        (item.mainWord as string).toLowerCase().includes(search.toLowerCase())
      );
    }

    return NextResponse.json({ items });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await req.json();
    const { mainWord, action, feeling, places, relatedWords, storyEnglish, storyVietnamese } = body;

    if (!mainWord?.trim()) {
      return NextResponse.json({ error: "mainWord is required" }, { status: 400 });
    }

    const now = new Date().toISOString();
    const newItem = {
      mainWord: mainWord.trim(),
      action: action?.trim() || "",
      feeling: feeling?.trim() || "",
      places: places?.trim() || "",
      relatedWords: relatedWords?.trim() || "",
      storyEnglish: storyEnglish?.trim() || "",
      storyVietnamese: storyVietnamese?.trim() || "",
      createdAt: now,
      updatedAt: now,
      reviewCount: 0,
      lastReviewedAt: null,
      nextReviewAt: null,
      easeFactor: 2.5,
      interval: 0,
      status: "new",
    };

    const docRef = await getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .add(newItem);

    return NextResponse.json({ id: docRef.id, ...newItem }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to create vocabulary" }, { status: 500 });
  }
}
