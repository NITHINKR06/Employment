"use client";

import { useRequireAuth } from "@/lib/useRequireAuth";

export default function RequireAuth({ children }) {
  const { user, isLoading } = useRequireAuth();

  if (isLoading || !user) {
    return (
      <div className="container py-10">
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  return children;
}
