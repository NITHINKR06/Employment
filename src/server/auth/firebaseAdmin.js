import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";

let cachedAuth = null;

function buildCredential() {
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error(
      "Firebase Admin env vars are missing. Set FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY."
    );
  }

  return cert({ projectId, clientEmail, privateKey });
}

export function getAdminAuth() {
  if (cachedAuth) return cachedAuth;

  const app = getApps()[0] ?? initializeApp({ credential: buildCredential() });
  cachedAuth = getAuth(app);
  return cachedAuth;
}
