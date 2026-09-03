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
  // 204/205 are "null body" statuses per the Fetch spec — browsers discard
  // whatever bytes the server actually sent, so response.json() on one of
  // these always throws even when the Content-Type header still says JSON.
  const hasNullBody = response.status === 204 || response.status === 205;
  if (!hasNullBody && contentType && contentType.includes("application/json")) {
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
