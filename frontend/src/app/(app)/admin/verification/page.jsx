"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function AdminVerificationPage() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const load = () => {
    setIsLoading(true);
    return apiFetch("/admin/verification")
      .then((body) => {
        if (body.success && body.data?.verificationRequests) {
          setRequests(body.data.verificationRequests);
        }
      })
      .catch((err) => setError(err.message || "Could not load verification requests"))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    load();
  }, []);

  const handleDecision = async (requestId, decision) => {
    setBusyId(requestId);
    try {
      await apiFetch(`/admin/verification/${requestId}/${decision}`, { method: "POST" });
      await load();
    } catch (err) {
      setError(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (isLoading) return <p className="text-body-md text-on-surface-variant">Loading...</p>;
  if (error) return <p className="text-body-md text-on-surface-variant">{error}</p>;

  return (
    <div className="space-y-3">
      {requests.length === 0 ? (
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          No pending verification requests.
        </p>
      ) : (
        requests.map((request) => (
          <div
            key={request.id}
            className="flex items-center justify-between rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div>
              <p className="font-display text-label-md font-semibold text-on-surface">
                {request.professionalName}
              </p>
              {request.notes && (
                <p className="mt-1 text-body-md text-on-surface-variant">{request.notes}</p>
              )}
              <p className="mt-1 text-label-sm text-on-surface-variant">
                Submitted {new Date(request.submittedAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => handleDecision(request.id, "approve")}
                className="rounded-lg bg-primary px-3 py-1.5 text-label-sm font-semibold text-on-primary disabled:opacity-60"
              >
                Approve
              </button>
              <button
                type="button"
                disabled={busyId === request.id}
                onClick={() => handleDecision(request.id, "reject")}
                className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm font-semibold text-on-surface hover:bg-surface-container-low disabled:opacity-60"
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
