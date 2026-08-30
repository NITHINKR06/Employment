import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
import { getFirebaseAuth } from "./firebaseClient";

const FRIENDLY_ERRORS = {
  "auth/email-already-in-use": "An account with this email already exists.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/invalid-credential": "Incorrect email or password.",
  "auth/wrong-password": "Incorrect email or password.",
  "auth/user-not-found": "Incorrect email or password.",
  "auth/weak-password": "Password should be at least 6 characters.",
  "auth/too-many-requests": "Too many attempts. Please try again later.",
};

function friendlyMessage(error) {
  return FRIENDLY_ERRORS[error?.code] ?? "Something went wrong. Please try again.";
}

async function exchangeForSession(firebaseUser, role) {
  const idToken = await firebaseUser.getIdToken();
  const response = await fetch("/api/auth/session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ idToken, role }),
  });
  const body = await response.json();
  if (!response.ok || !body.success) {
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

export async function signOutUser() {
  await signOut(getFirebaseAuth()).catch(() => {});
  await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
}
