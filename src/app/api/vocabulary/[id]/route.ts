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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const doc = await getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .doc(params.id)
      .get();

    if (!doc.exists) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch vocabulary" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    const body = await req.json();
    const updates = { ...body, updatedAt: new Date().toISOString() };
    delete updates.id;

    await getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .doc(params.id)
      .update(updates);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update vocabulary" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const idToken = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!idToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const uid = await verifyIdToken(idToken);
  if (!uid) return NextResponse.json({ error: "Invalid token" }, { status: 401 });

  try {
    await getDb()
      .collection("users")
      .doc(uid)
      .collection("vocabulary")
      .doc(params.id)
      .delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete vocabulary" }, { status: 500 });
  }
}
