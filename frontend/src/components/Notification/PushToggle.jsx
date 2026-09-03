"use client";

import { useEffect, useState } from "react";
import {
  isPushSupported,
  getExistingSubscription,
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/pushClient";

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || "";

export default function PushToggle() {
  const [supported, setSupported] = useState(true);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isPushSupported()) {
      setSupported(false);
      return;
    }
    getExistingSubscription().then((sub) => setIsSubscribed(Boolean(sub)));
  }, []);

  const handleToggle = async () => {
    setError("");
    setIsBusy(true);
    try {
      if (isSubscribed) {
        await unsubscribeFromPush();
        setIsSubscribed(false);
      } else {
        if (!VAPID_PUBLIC_KEY) {
          throw new Error("Push isn't configured for this environment yet.");
        }
        await subscribeToPush(VAPID_PUBLIC_KEY);
        setIsSubscribed(true);
      }
    } catch (err) {
      setError(err.message || "Could not update push notification settings.");
    } finally {
      setIsBusy(false);
    }
  };

  if (!supported) {
    return (
      <p className="text-body-md text-on-surface-variant">
        Push notifications aren&apos;t supported in this browser.
      </p>
    );
  }

  return (
    <div>
      <label className="flex items-center gap-2.5 text-body-md text-on-surface">
        <input
          type="checkbox"
          checked={isSubscribed}
          disabled={isBusy}
          onChange={handleToggle}
          className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
        />
        Enable push notifications
      </label>
      {error && <p className="mt-1 text-label-sm font-semibold text-error">{error}</p>}
    </div>
  );
}
