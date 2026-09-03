"use client";

import { useCallback, useEffect, useState } from "react";
import { IoInformationCircleOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";
import TextField from "@/components/TextField/TextField";
import { apiFetch } from "@/lib/apiClient";

function todayISODate() {
  return new Date().toISOString().slice(0, 10);
}

function inNDaysISODate(n) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
}

function formatSlot(isoString) {
  return new Date(isoString).toLocaleString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function EmployeeAvailabilityPage() {
  const [professional, setProfessional] = useState(null);
  const [slots, setSlots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    startDate: todayISODate(),
    endDate: inNDaysISODate(6),
    slotDurationMinutes: 60,
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generateError, setGenerateError] = useState("");

  const loadSlots = useCallback((professionalId) => {
    return apiFetch(`/availability/${professionalId}`)
      .then((body) => {
        if (body.success && body.data?.slots) {
          setSlots(body.data.slots);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/professionals/me")
      .then(async (body) => {
        if (cancelled) return;
        const pro = body.data?.professional;
        if (!pro) {
          setError("Create your professional profile first before managing availability.");
          return;
        }
        setProfessional(pro);
        await loadSlots(pro.id);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 401 ? "Please log in as a professional." : "Could not load your profile.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [loadSlots]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!professional) return;
    setGenerateError("");
    setIsGenerating(true);
    try {
      const body = await apiFetch(`/availability/${professional.id}/generate`, {
        method: "POST",
        body: JSON.stringify({
          startDate: form.startDate,
          endDate: form.endDate,
          slotDurationMinutes: Number(form.slotDurationMinutes) || 60,
        }),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not generate slots");
      }
      await loadSlots(professional.id);
    } catch (err) {
      setGenerateError(err.message ?? "Could not generate slots");
    } finally {
      setIsGenerating(false);
    }
  };

  // GET /availability/{id} only ever returns open (unbooked) slots — once a
  // customer books one, it simply drops out of this list.
  const openSlots = slots;

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Manage Availability</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Generate open time slots customers can book directly.
      </p>

      {isLoading ? (
        <p className="mt-6 text-body-md text-on-surface-variant">Loading...</p>
      ) : error ? (
        <p className="mt-6 rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
          {error}
        </p>
      ) : (
        <>
          <form
            onSubmit={handleGenerate}
            className="mt-6 space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1"
          >
            <h2 className="font-display text-headline-sm text-on-surface">Generate slots</h2>
            <div className="flex items-start gap-1.5 rounded-lg bg-primary-container/10 p-2.5 text-label-sm text-on-surface-variant">
              <IoInformationCircleOutline className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
              <ol className="list-decimal space-y-1 pl-4">
                <li>Pick a start and end date, and a slot length.</li>
                <li>Click &quot;Generate&quot; — it creates bookable slots every day in that range, 9am to 5pm.</li>
                <li>It&apos;s safe to run again later to extend your range — dates you&apos;ve already covered are skipped, not duplicated.</li>
              </ol>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <TextField
                id="startDate"
                type="date"
                label="Start date"
                value={form.startDate}
                onChange={(e) => setForm({ ...form, startDate: e.target.value })}
              />
              <TextField
                id="endDate"
                type="date"
                label="End date"
                value={form.endDate}
                onChange={(e) => setForm({ ...form, endDate: e.target.value })}
              />
              <TextField
                id="slotDurationMinutes"
                type="number"
                label="Slot length (min)"
                value={form.slotDurationMinutes}
                onChange={(e) => setForm({ ...form, slotDurationMinutes: e.target.value })}
              />
            </div>
            {generateError && (
              <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
                {generateError}
              </div>
            )}
            <Button type="submit" disabled={isGenerating}>
              {isGenerating ? "Generating..." : "Generate Slots (9am-5pm each day)"}
            </Button>
          </form>

          <div className="mt-6 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
            <h2 className="font-display text-headline-sm text-on-surface">
              Open slots ({openSlots.length})
            </h2>
            <p className="mt-1 text-label-sm text-on-surface-variant">
              Once a customer books one, it disappears from this list.
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {openSlots.length === 0 ? (
                <p className="text-body-md text-on-surface-variant">No open slots yet.</p>
              ) : (
                openSlots.map((slot) => (
                  <span
                    key={slot.id}
                    className="rounded-lg border border-outline-variant px-3 py-1.5 text-label-sm text-on-surface"
                  >
                    {formatSlot(slot.startsAt)}
                  </span>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
