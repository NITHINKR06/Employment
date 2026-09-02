"use client";

import { useEffect, useState } from "react";
import { IoCashOutline, IoTimeOutline } from "react-icons/io5";
import { apiFetch } from "@/lib/apiClient";

export default function EmployeeEarningsPage() {
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/earnings")
      .then((body) => {
        if (!cancelled && body.success && body.data) {
          setEarnings(body.data);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.status === 403
              ? "Create your professional profile to see earnings."
              : err.status === 401
                ? "Please log in as a professional."
                : "Could not load earnings."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Earnings</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Totals across all of your bookings
      </p>

      {isLoading ? (
        <p className="mt-6 text-body-md text-on-surface-variant">Loading...</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
          {error}
        </p>
      ) : (
        <div className="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="flex items-center gap-2 text-primary">
              <IoCashOutline className="text-2xl" />
              <span className="text-label-md font-semibold uppercase">Earned</span>
            </div>
            <p className="mt-3 font-display text-display-lg font-bold text-on-surface">
              ${earnings.earned.toFixed(2)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">From paid bookings</p>
          </div>
          <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <div className="flex items-center gap-2 text-on-surface-variant">
              <IoTimeOutline className="text-2xl" />
              <span className="text-label-md font-semibold uppercase">Pending</span>
            </div>
            <p className="mt-3 font-display text-display-lg font-bold text-on-surface">
              ${earnings.pending.toFixed(2)}
            </p>
            <p className="mt-1 text-label-sm text-on-surface-variant">Awaiting payment</p>
          </div>
        </div>
      )}
    </div>
  );
}
