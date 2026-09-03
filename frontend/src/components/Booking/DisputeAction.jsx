"use client";

import { useState } from "react";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

export default function DisputeAction({ bookingId }) {
  const [isOpen, setIsOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      const body = await apiFetch("/disputes", {
        method: "POST",
        body: JSON.stringify({ bookingId, subject, description }),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not file the report");
      }
      setSubmitted(true);
      setIsOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <p className="text-label-sm font-semibold text-primary">
        Report submitted — you can track it under{" "}
        <a href="/user/disputes" className="underline">
          Your Reports
        </a>
        .
      </p>
    );
  }

  if (!isOpen) {
    return (
      <Button variant="secondary" onClick={() => setIsOpen(true)}>
        Report an Issue
      </Button>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="mt-2 space-y-2 rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
    >
      <input
        type="text"
        required
        value={subject}
        onChange={(e) => setSubject(e.target.value)}
        placeholder="What went wrong? (short summary)"
        className="w-full rounded border border-outline-variant bg-surface p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />
      <textarea
        required
        rows={3}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the issue in detail"
        className="w-full rounded border border-outline-variant bg-surface p-2.5 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
      />
      {error && <p className="text-label-sm font-semibold text-error">{error}</p>}
      <div className="flex gap-2">
        <Button type="submit" size="md" disabled={isSubmitting}>
          {isSubmitting ? "Submitting..." : "Submit Report"}
        </Button>
        <Button type="button" variant="secondary" size="md" onClick={() => setIsOpen(false)}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
