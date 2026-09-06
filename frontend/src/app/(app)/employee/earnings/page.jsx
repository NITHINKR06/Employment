"use client";

import { useEffect, useState } from "react";
import {
  IoBanOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoReturnUpBackOutline,
  IoTimeOutline,
} from "react-icons/io5";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { apiFetch } from "@/lib/apiClient";
import useThemeColors from "@/lib/useThemeColors";

function formatMoney(value) {
  return `$${(value ?? 0).toFixed(2)}`;
}

function formatMonth(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Date(year, month - 1, 1).toLocaleDateString([], { month: "short", year: "2-digit" });
}

function StatTile({ icon: Icon, label, value, tone = "default", hint }) {
  const toneClasses = tone === "error" ? "text-error" : tone === "primary" ? "text-primary" : "text-on-surface-variant";
  return (
    <div className="rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-5 shadow-elevation-1">
      <div className={`flex items-center gap-2 ${toneClasses}`}>
        <Icon className="text-xl" />
        <span className="text-label-sm font-semibold uppercase">{label}</span>
      </div>
      <p className="mt-2 font-display text-headline-md font-bold text-on-surface">{value}</p>
      {hint && <p className="mt-1 text-label-sm text-on-surface-variant">{hint}</p>}
    </div>
  );
}

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-outline-variant bg-surface-container-lowest px-3 py-2 text-label-sm shadow-elevation-2">
      <p className="font-semibold text-on-surface">{label}</p>
      {payload.map((entry) => (
        <p key={entry.dataKey} className="flex items-center gap-1.5 text-on-surface-variant">
          <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: entry.fill }} />
          {entry.name}: {formatMoney(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function EmployeeEarningsPage() {
  const [earnings, setEarnings] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const colors = useThemeColors();

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

  const monthly = (earnings?.monthly ?? []).map((entry) => ({
    ...entry,
    label: formatMonth(entry.month),
  }));
  const hasChartData = monthly.some((entry) => entry.earned > 0 || entry.refunded > 0);

  return (
    <div className="container max-w-4xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Earnings</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Totals, trends, and refunds across all of your bookings
      </p>

      {isLoading ? (
        <p className="mt-6 text-body-md text-on-surface-variant">Loading...</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
          {error}
        </p>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatTile icon={IoCashOutline} label="Earned" value={formatMoney(earnings.earned)} hint="From paid bookings" tone="primary" />
            <StatTile icon={IoTimeOutline} label="Pending" value={formatMoney(earnings.pending)} hint="Awaiting payment" />
            <StatTile icon={IoReturnUpBackOutline} label="Refunded" value={formatMoney(earnings.refunded)} hint="Returned to customers" tone="error" />
            <StatTile
              icon={IoReceiptOutline}
              label="Average per booking"
              value={formatMoney(earnings.averagePerBooking)}
              hint={`Across ${earnings.paidCount ?? 0} paid booking${earnings.paidCount === 1 ? "" : "s"}`}
              tone="primary"
            />
            <StatTile icon={IoBanOutline} label="Cancelled" value={earnings.cancelledCount ?? 0} hint="Bookings cancelled" tone="error" />
          </div>

          <div className="mt-6 rounded-2xl border border-outline-variant/60 bg-surface-container-lowest p-6 shadow-elevation-1">
            <h2 className="font-display text-headline-sm text-on-surface">Earnings over time</h2>
            <p className="mt-1 text-label-sm text-on-surface-variant">Paid vs. refunded amounts by month</p>
            {hasChartData ? (
              <div className="mt-4 h-72 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
                    <CartesianGrid vertical={false} stroke={colors["--color-outline-variant"]} strokeOpacity={0.5} />
                    <XAxis
                      dataKey="label"
                      tick={{ fill: colors["--color-on-surface-variant"], fontSize: 12 }}
                      axisLine={{ stroke: colors["--color-outline-variant"] }}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: colors["--color-on-surface-variant"], fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v}`}
                      width={48}
                    />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: colors["--color-surface-container-high"] }} />
                    <Legend
                      wrapperStyle={{ fontSize: 12, color: colors["--color-on-surface-variant"] }}
                      iconType="circle"
                    />
                    <Bar dataKey="earned" name="Earned" fill={colors["--color-primary"]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="refunded" name="Refunded" fill={colors["--color-error"]} radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="mt-4 text-body-md text-on-surface-variant">
                No paid or refunded bookings yet — this chart will fill in as you take bookings.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
