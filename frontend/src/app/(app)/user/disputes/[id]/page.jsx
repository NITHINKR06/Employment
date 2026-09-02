"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { IoChevronBack } from "react-icons/io5";
import { apiFetch } from "@/lib/apiClient";

export default function DisputeDetailPage() {
  const { id } = useParams();
  const [dispute, setDispute] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/disputes/${id}`)
      .then((body) => {
        if (!cancelled && body.success && body.data?.dispute) {
          setDispute(body.data.dispute);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.status === 401
              ? "Please log in to see this report."
              : err.status === 403 || err.status === 404
                ? "Report not found."
                : "Could not load report."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (error || !dispute) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="text-body-md text-on-surface-variant">{error || "Report not found."}</p>
        <Link href="/user/disputes" className="mt-4 inline-block text-label-md font-medium text-primary hover:underline">
          &larr; Back to Reports
        </Link>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <Link
        href="/user/disputes"
        className="mb-4 inline-flex items-center gap-1 text-label-md font-medium text-on-surface-variant hover:text-primary"
      >
        <IoChevronBack /> Back to Reports
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="font-display text-headline-md text-on-surface">{dispute.subject}</h1>
        <span
          className={`rounded-full px-3 py-1 text-label-sm font-semibold ${
            dispute.status === "OPEN"
              ? "bg-primary-container/20 text-primary"
              : "bg-surface-container text-on-surface-variant"
          }`}
        >
          {dispute.status}
        </span>
      </div>

      <div className="mt-6 space-y-4 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
        <div>
          <span className="text-label-md text-on-surface-variant">Description</span>
          <p className="mt-1 text-body-md text-on-surface">{dispute.description}</p>
        </div>
        <div>
          <span className="text-label-md text-on-surface-variant">Filed on</span>
          <p className="mt-1 text-body-md text-on-surface">
            {new Date(dispute.createdAt).toLocaleString()}
          </p>
        </div>
        {dispute.resolution && (
          <div className="border-t border-outline-variant/40 pt-4">
            <span className="text-label-md font-semibold text-primary">Resolution</span>
            <p className="mt-1 text-body-md text-on-surface">{dispute.resolution}</p>
            {dispute.resolvedAt && (
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Resolved {new Date(dispute.resolvedAt).toLocaleString()}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
