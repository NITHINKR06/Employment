import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebaseClient";
import { apiFetch } from "./apiClient";

const FRIENDLY_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
  "auth/popup-closed-by-user": "Sign-in was cancelled.",
  "auth/cancelled-popup-request": "Sign-in was cancelled.",
  "auth/popup-blocked": "Your browser blocked the sign-in popup. Please allow popups and try again.",
  "auth/account-exists-with-different-credential":
    "An account already exists with this email using a different sign-in method.",
};

function friendlyMessage(error) {
  return FRIENDLY_ERRORS[error?.code] ?? "Something went wrong. Please try again.";
}

async function exchangeForSession(_firebaseUser, role) {
  // POST /auth/session (not GET /auth/me) — only this endpoint can apply a
  // chosen role, and only the very first time this Firebase account is ever
  // seen; every later call here or elsewhere leaves an existing role alone.
  const body = await apiFetch("/auth/session", {
    method: "POST",
    body: JSON.stringify({ role: role ?? null }),
  });
  if (!body.success || !body.data?.user) {
    throw new Error(body?.error?.message ?? "Could not start session");
  }
  return body.data.user;
}

export async function signUpWithEmail({ name, email, password, role }) {
  try {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email, password);
    if (name) {
      await updateProfile(credential.user, { displayName: name });
    }
    return await exchangeForSession(credential.user, role);
  } catch (error) {
    throw new Error(friendlyMessage(error));
  }
}

export async function signInWithEmail({ email, password }) {
  try {
    const credential = await signInWithEmailAndPassword(getFirebaseAuth(), email, password);
    return await exchangeForSession(credential.user);
  } catch (error) {
    throw new Error(friendlyMessage(error));
  }
}

export async function signInWithGoogle({ role } = {}) {
  try {
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(getFirebaseAuth(), provider);
    return await exchangeForSession(credential.user, role);
  } catch (error) {
    throw new Error(friendlyMessage(error));
  }
}

export async function signOutUser() {
  await signOut(getFirebaseAuth()).catch(() => {});
}
