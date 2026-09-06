"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

export default function AdminMessagesPage() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    apiFetch("/admin/messages")
      .then((body) => {
        if (body.success && body.data?.messages) setMessages(body.data.messages);
      })
      .catch((err) => setError(err.message || "Could not load messages"))
      .finally(() => setIsLoading(false));
  }, []);

  if (isLoading) return <p className="text-body-md text-on-surface-variant">Loading...</p>;
  if (error) return <p className="text-body-md text-on-surface-variant">{error}</p>;

  return (
    <div className="space-y-3">
      {messages.length === 0 ? (
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-8 text-center text-body-md text-on-surface-variant">
          No contact messages yet.
        </p>
      ) : (
        messages.map((message) => (
          <div
            key={message.id}
            className="rounded-lg border border-outline-variant bg-surface-container-lowest p-4"
          >
            <div className="flex items-center justify-between gap-4">
              <p className="font-display text-label-md font-semibold text-on-surface">
                {message.name} · {message.email}
              </p>
              {message.createdAt && (
                <span className="shrink-0 text-label-sm text-on-surface-variant">
                  {new Date(message.createdAt).toLocaleString()}
                </span>
              )}
            </div>
            {message.subject && (
              <p className="mt-1 text-label-sm font-semibold text-on-surface-variant">{message.subject}</p>
            )}
            <p className="mt-2 whitespace-pre-wrap text-body-md text-on-surface-variant">{message.message}</p>
          </div>
        ))
      )}
    </div>
  );
}
