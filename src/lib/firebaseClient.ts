import { initializeApp, getApps, FirebaseApp } from "firebase/app";
import { getAuth, Auth } from "firebase/auth";
import { getFirestore, Firestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

function getFirebaseApp(): FirebaseApp {
  if (getApps().length > 0) return getApps()[0];
  if (!firebaseConfig.apiKey) {
    throw new Error("Firebase not configured. Set NEXT_PUBLIC_FIREBASE_* environment variables.");
  }
  return initializeApp(firebaseConfig);
}

const _auth: Auth | null = (() => {
  try {
    return getAuth(getFirebaseApp());
  } catch {
    return null;
  }
})();

const _db: Firestore | null = (() => {
  try {
    return getFirestore(getFirebaseApp());
  } catch {
    return null;
  }
})();

export const auth: Auth = _auth!;
export const db: Firestore = _db!;
export { getFirebaseApp as app };
