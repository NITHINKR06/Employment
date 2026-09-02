// INTERNAL_API_URL takes priority: in Docker Compose this process runs inside
// the frontend container, where "localhost" resolves to itself, not the
// backend container — it must reach the backend via its service DNS name
// (see docker-compose.yml). NEXT_PUBLIC_API_URL is a browser-facing fallback
// for non-Docker local dev, where frontend and backend share the host's
// localhost.
const BASE_URL =
  process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export class ApiNotFoundError extends Error {}

/**
 * Fetch helper for Server Components hitting public (unauthenticated) FastAPI
 * endpoints. Not for authenticated data — Server Components have no access to
 * the client-side Firebase ID token; use apiFetch from a "use client" component
 * for anything that needs auth (see user/bookingStatus/page.jsx for the pattern).
 */
export async function serverApiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith("http") ? endpoint : `${BASE_URL}${endpoint}`;
  const response = await fetch(url, { cache: "no-store", ...options });

  const contentType = response.headers.get("content-type");
  const data = contentType && contentType.includes("application/json") ? await response.json() : null;

  if (response.status === 404) {
    throw new ApiNotFoundError(data?.error?.message || "Not found");
  }
  if (!response.ok) {
    const error = new Error(data?.error?.message || `HTTP Error ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}
