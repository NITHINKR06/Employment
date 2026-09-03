"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoLockClosedOutline } from "react-icons/io5";
import { MdOutlineAddAPhoto as MdAddAPhoto } from "react-icons/md";
import Stepper from "@/components/Booking/Stepper";
import Button from "@/components/Button/Button";
import Rating from "@/components/Rating/Rating";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import PaymentForm from "@/components/Booking/PaymentForm";
import { apiFetch } from "@/lib/apiClient";

const STEPS = ["Details", "Schedule", "Address", "Payment"];

function formatSlotTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

function formatSlotDay(isoString) {
  return new Date(isoString).toLocaleDateString([], {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export default function BookingWizard({ worker }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ category: worker.trade, description: "" });
  const [schedule, setSchedule] = useState({ date: "", time: "" });
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(true);
  const [selectedSlotId, setSelectedSlotId] = useState(null);
  const [address, setAddress] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [frequency, setFrequency] = useState("WEEKLY");
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [createdBooking, setCreatedBooking] = useState(null);

  useEffect(() => {
    let cancelled = false;
    apiFetch(`/availability/${worker.id}`)
      .then((body) => {
        if (!cancelled && body.success && body.data?.slots) {
          setSlots(body.data.slots);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setSlotsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [worker.id]);

  const slotsByDay = useMemo(() => {
    const groups = new Map();
    for (const slot of slots) {
      const day = formatSlotDay(slot.startsAt);
      if (!groups.has(day)) groups.set(day, []);
      groups.get(day).push(slot);
    }
    return groups;
  }, [slots]);

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const scheduledAt =
    schedule.date && schedule.time ? new Date(`${schedule.date}T${schedule.time}`) : null;

  const selectedSlot = slots.find((s) => s.id === selectedSlotId) ?? null;
  const effectiveScheduledAt = selectedSlot ? new Date(selectedSlot.startsAt) : scheduledAt;

  const canContinueFromSchedule = slots.length > 0 ? Boolean(selectedSlotId) : true;

  const handleContinueToPayment = async () => {
    setBookingError("");
    setIsCreatingBooking(true);
    try {
      if (isRecurring) {
        if (!effectiveScheduledAt) {
          throw new Error("Pick a date/time or open slot before setting up a recurring booking");
        }
        const body = await apiFetch("/booking-lifecycle/recurring", {
          method: "POST",
          body: JSON.stringify({
            professionalId: worker.id,
            address,
            notes: `Category: ${details.category}\n${details.description}`,
            frequency,
            startsAt: effectiveScheduledAt.toISOString(),
          }),
        });
        if (!body.success) {
          throw new Error(body?.error?.message ?? "Could not set up recurring booking");
        }
        router.push("/user/bookingStatus");
        return;
      }

      const body = await apiFetch("/bookings", {
        method: "POST",
        body: JSON.stringify({
          professionalId: worker.id,
          slotId: selectedSlotId || undefined,
          scheduledAt: !selectedSlotId && scheduledAt ? scheduledAt.toISOString() : undefined,
          address,
          notes: `Category: ${details.category}\n${details.description}`,
        }),
      });

      if (!body.success || !body.data?.booking) {
        throw new Error(body?.error?.message ?? "Could not create booking");
      }

      setCreatedBooking(body.data.booking);
      next();
    } catch (error) {
      setBookingError(
        error.status === 409
          ? "That time slot was just booked by someone else — pick another."
          : error.message ?? "Could not create booking"
      );
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const baseFee = worker.hourlyRate;
  const tax = Math.round(baseFee * 0.08 * 100) / 100;
  const total = baseFee + tax;

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-2 text-on-surface-variant">
        <IoLockClosedOutline aria-hidden="true" />
        <span className="text-label-sm">Secure Checkout</span>
      </div>

      <Stepper steps={STEPS} currentIndex={step} />

      <div className="mt-10 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {step === 0 && (
            <div className="space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
              <h2 className="font-display text-headline-sm text-on-surface">Job Details</h2>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="category">
                  Service category
                </label>
                <input
                  id="category"
                  value={details.category}
                  onChange={(e) => setDetails({ ...details, category: e.target.value })}
                  className="h-12 w-full rounded border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="description">
                  Describe the job
                </label>
                <textarea
                  id="description"
                  rows={4}
                  value={details.description}
                  onChange={(e) => setDetails({ ...details, description: e.target.value })}
                  className="w-full rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-outline-variant p-8 text-on-surface-variant">
                <MdAddAPhoto size={28} aria-hidden="true" />
                <p className="text-label-sm">Drag photos here, or click to upload</p>
              </div>
              <Button onClick={next} className="w-full">
                Continue to Schedule
              </Button>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
              <h2 className="font-display text-headline-sm text-on-surface">Schedule</h2>

              {slotsLoading ? (
                <p className="text-body-md text-on-surface-variant">Loading available times...</p>
              ) : slots.length > 0 ? (
                <div className="space-y-4">
                  {[...slotsByDay.entries()].map(([day, daySlots]) => (
                    <div key={day}>
                      <p className="mb-2 text-label-md font-semibold text-on-surface">{day}</p>
                      <div className="flex flex-wrap gap-2">
                        {daySlots.map((slot) => (
                          <button
                            key={slot.id}
                            type="button"
                            onClick={() => setSelectedSlotId(slot.id)}
                            className={`rounded-lg border px-3 py-2 text-label-md font-semibold transition ${
                              selectedSlotId === slot.id
                                ? "border-primary bg-primary text-on-primary"
                                : "border-outline-variant text-on-surface hover:bg-surface-container-low"
                            }`}
                          >
                            {formatSlotTime(slot.startsAt)}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <>
                  <p className="text-label-sm text-on-surface-variant">
                    This professional hasn&apos;t published open time slots yet — pick a preferred date and time instead.
                  </p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="date">
                        Date
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={schedule.date}
                        onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
                        className="h-12 w-full rounded border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="time">
                        Time
                      </label>
                      <input
                        id="time"
                        type="time"
                        value={schedule.time}
                        onChange={(e) => setSchedule({ ...schedule, time: e.target.value })}
                        className="h-12 w-full rounded border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="flex gap-3">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} className="flex-1" disabled={!canContinueFromSchedule}>
                  Continue to Address
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
              <h2 className="font-display text-headline-sm text-on-surface">Address</h2>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="address">
                  Service address
                </label>
                <textarea
                  id="address"
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <label className="flex items-center gap-2.5 text-body-md text-on-surface">
                <input
                  type="checkbox"
                  checked={isRecurring}
                  onChange={(e) => setIsRecurring(e.target.checked)}
                  className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
                />
                Repeat this booking automatically
              </label>
              {isRecurring && (
                <div>
                  <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="frequency">
                    Frequency
                  </label>
                  <select
                    id="frequency"
                    value={frequency}
                    onChange={(e) => setFrequency(e.target.value)}
                    className="h-12 w-full rounded border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="BIWEEKLY">Every 2 weeks</option>
                    <option value="MONTHLY">Monthly</option>
                  </select>
                  <p className="mt-1.5 text-label-sm text-on-surface-variant">
                    We&apos;ll set up a recurring booking at the schedule you picked — no upfront payment step for this option.
                  </p>
                </div>
              )}

              {bookingError && (
                <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
                  {bookingError}
                </div>
              )}
              <div className="flex gap-3">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button
                  onClick={handleContinueToPayment}
                  disabled={!address || isCreatingBooking}
                  className="flex-1"
                >
                  {isCreatingBooking
                    ? "Saving..."
                    : isRecurring
                      ? "Set Up Recurring Booking"
                      : "Continue to Payment"}
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <PaymentForm
                initialAmount={baseFee.toFixed(2)}
                bookingId={createdBooking?._id}
                onPaymentSuccess={() => {
                  router.push("/user/bookingStatus");
                }}
              />
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-2 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image src={worker.avatar || "/profile.jpg"} alt={worker.name} fill className="object-cover" />
            </div>
            <div>
              <p className="inline-flex items-center gap-1 text-label-md font-semibold text-on-surface">
                {worker.name}
                {worker.verified && <VerifiedBadge size="sm" />}
              </p>
              <p className="text-label-sm text-on-surface-variant">{worker.title}</p>
              <Rating value={worker.rating} size="sm" />
            </div>
          </div>

          <div className="space-y-2 border-t border-outline-variant pt-4 text-body-md">
            <div className="flex justify-between text-on-surface-variant">
              <span>Base Fee</span>
              <span>${baseFee.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-on-surface-variant">
              <span>Tax</span>
              <span>${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between border-t border-outline-variant pt-2 font-semibold text-on-surface">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <p className="rounded-md bg-primary-container/10 p-3 text-label-sm text-on-surface-variant">
            Backed by our Satisfaction Guarantee — full refund if the job isn&apos;t done right.
          </p>
        </aside>
      </div>
    </div>
  );
}
