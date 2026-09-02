import { getFirebaseAuth } from "./firebaseClient";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const headers = { ...options.headers };

  if (!(options.body instanceof FormData) && !headers["Content-Type"] && options.body) {
    headers["Content-Type"] = "application/json";
  }

  if (typeof window !== "undefined") {
    try {
      const auth = getFirebaseAuth();
      const currentUser = auth.currentUser;
      if (currentUser) {
        const idToken = await currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
      }
    } catch (err) {
      // Firebase auth client not initialized or unavailable
    }
  }

  const response = await fetch(url, { ...options, headers });
  const contentType = response.headers.get("content-type");
  let data = null;
  if (contentType && contentType.includes("application/json")) {
    data = await response.json();
  }

  if (!response.ok) {
    const message = data?.error?.message || data?.detail || `HTTP Error ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}
