"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

function ResolveForm({ dispute, onResolved }) {
  const [resolution, setResolution] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const body = await apiFetch(`/admin/disputes/${dispute.id}/resolve`, {
        method: "POST",
        body: JSON.stringify({ resolution }),
      });
      if (!body.success) throw new Error(body?.error?.message ?? "Could not resolve");
      onResolved();
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-3 space-y-2">
      <textarea
        rows={2}
        required
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Resolution notes"
        className="w-full rounded border border-outline-variant bg-surface p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="text-label-sm font-semibold text-error">{error}</p>}
      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded-lg bg-primary px-4 py-2 text-label-md font-semibold text-on-primary disabled:opacity-60"
      >
        {isSubmitting ? "Resolving..." : "Mark Resolved"}
      </button>
    </form>
  );
}

export default function AdminDisputesPage() {
  const [disputes, setDisputes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = () => {
    setIsLoading(true);
    return apiFetch("/admin/disputes")
      .then((body) => {
        if (body.success && body.data?.disputes) setDisputes(body.data.disputes);
      })
      .catch((err) => setError(err.message || "Could not load disputes"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  if (isLoading) return <p className="text-body-md text-on-surface-variant">Loading...</p>;
  if (error) return <p className="text-body-md text-on-surface-variant">{error}</p>;

  return (
    <div className="space-y-3">
      {disputes.length === 0 ? (
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          No disputes filed.
        </p>
      ) : (
        disputes.map((dispute) => (
          <div
            key={dispute.id}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="flex items-center justify-between">
              <p className="font-display text-label-md font-semibold text-on-surface">{dispute.subject}</p>
              <span
                className={`rounded-full px-2.5 py-1 text-label-sm font-semibold ${
                  dispute.status === "OPEN"
                    ? "bg-primary-container/20 text-primary"
                    : "bg-surface-container text-on-surface-variant"
                }`}
              >
                {dispute.status}
              </span>
            </div>
            <p className="mt-1 text-body-md text-on-surface-variant">{dispute.description}</p>
            {dispute.resolution ? (
              <p className="mt-2 text-label-sm text-on-surface-variant">
                <strong className="text-on-surface">Resolution:</strong> {dispute.resolution}
              </p>
            ) : (
              <ResolveForm dispute={dispute} onResolved={load} />
            )}
          </div>
        ))
      )}
    </div>
  );
}
