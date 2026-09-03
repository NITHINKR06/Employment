"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/apiClient";

function StatusPill({ status }) {
  const isOpen = status === "OPEN";
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-label-sm font-semibold ${
        isOpen ? "bg-primary-container/20 text-primary" : "bg-surface-container text-on-surface-variant"
      }`}
    >
      {status}
    </span>
  );
}

export default function DisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/disputes")
      .then((body) => {
        if (!cancelled && body.success && body.data?.disputes) {
          setDisputes(body.data.disputes);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 401 ? "Please log in to see your reports." : "Could not load reports.");
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
      <h1 className="font-display text-headline-md text-on-surface">Your Reports</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Issues you've reported against a booking
      </p>

      <div className="mt-6 space-y-3">
        {isLoading ? (
          <p className="text-body-md text-on-surface-variant">Loading...</p>
        ) : error ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            {error}
          </p>
        ) : disputes.length === 0 ? (
          <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
            No reports filed yet.
          </p>
        ) : (
          disputes.map((dispute) => (
            <Link
              key={dispute.id}
              href={`/user/disputes/${dispute.id}`}
              className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4 transition hover:bg-surface-container-low"
            >
              <div>
                <p className="font-display text-label-md font-semibold text-on-surface">{dispute.subject}</p>
                <p className="text-label-sm text-on-surface-variant">
                  {new Date(dispute.createdAt).toLocaleDateString()}
                </p>
              </div>
              <StatusPill status={dispute.status} />
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
