import { getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let cachedAuth = null;

export function getFirebaseAuth() {
  if (typeof window === "undefined") {
    throw new Error("Firebase client auth is only available in the browser");
  }
  if (cachedAuth) return cachedAuth;

  const app = getApps()[0] ?? initializeApp(firebaseConfig);
  cachedAuth = getAuth(app);
  return cachedAuth;
}
