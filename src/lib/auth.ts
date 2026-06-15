import { auth } from "./firebaseClient";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User,
  IdTokenResult,
} from "firebase/auth";
import { cookies } from "next/headers";

export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function register(email: string, password: string) {
  return createUserWithEmailAndPassword(auth, email, password);
}

export async function signOut() {
  return firebaseSignOut(auth);
}

export function onAuthChange(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function getAuthToken(user: User): Promise<string | null> {
  try {
    const token: IdTokenResult = await user.getIdTokenResult();
    return token.token;
  } catch {
    return null;
  }
}
