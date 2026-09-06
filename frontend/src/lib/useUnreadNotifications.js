"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export function useUnreadNotifications(isLoggedIn) {
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!isLoggedIn) {
      setHasUnread(false);
      return;
    }
    apiFetch("/notifications")
      .then((body) => {
        if (body.success && body.data) {
          setHasUnread(body.data.some((n) => !n.readAt));
        }
      })
      .catch(() => {});
  }, [isLoggedIn]);

  return hasUnread;
}
