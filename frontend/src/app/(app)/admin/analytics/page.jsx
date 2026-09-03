"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/apiClient";

const STATS = [
  { key: "totalUsers", label: "Total Users" },
  { key: "totalProfessionals", label: "Total Professionals" },
  { key: "totalBookings", label: "Total Bookings" },
  { key: "totalRevenue", label: "Total Revenue", prefix: "$" },
];

export default function AdminAnalyticsPage() {
  const [analytics, setAnalytics] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/admin/analytics")
      .then((body) => {
        if (!cancelled && body.success) setAnalytics(body.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || "Could not load analytics");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (error) {
    return <p className="text-body-md text-on-surface-variant">{error}</p>;
  }

  if (!analytics) {
    return <p className="text-body-md text-on-surface-variant">Loading...</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {STATS.map((stat) => (
        <div
          key={stat.key}
          className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1"
        >
          <p className="text-label-md font-semibold uppercase text-on-surface-variant">{stat.label}</p>
          <p className="mt-2 font-display text-display-lg font-bold text-on-surface">
            {stat.prefix ?? ""}
            {analytics[stat.key]}
          </p>
        </div>
      ))}
    </div>
  );
}
