"use client";

import { useState } from "react";
import Image from "next/image";
import { IoLockClosedOutline } from "react-icons/io5";
import { MdOutlineAddAPhoto as MdAddAPhoto } from "react-icons/md";
import Stepper from "@/components/Booking/Stepper";
import Button from "@/components/Button/Button";
import Rating from "@/components/Rating/Rating";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import PaymentsModel from "../../auth/payment/page";

const STEPS = ["Details", "Schedule", "Address", "Payment"];

export default function BookingWizard({ worker }) {
  const [step, setStep] = useState(0);
  const [details, setDetails] = useState({ category: worker.trade, description: "" });
  const [schedule, setSchedule] = useState({ date: "", time: "" });
  const [address, setAddress] = useState("");

  const next = () => setStep((s) => Math.min(s + 1, STEPS.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

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
                  className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                  className="w-full rounded border border-outline-variant bg-white p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
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
                    className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} className="flex-1">
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
                  className="w-full rounded border border-outline-variant bg-white p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={back}>
                  Back
                </Button>
                <Button onClick={next} className="flex-1">
                  Continue to Payment
                </Button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-4">
              <PaymentsModel />
              <Button variant="secondary" onClick={back}>
                Back
              </Button>
            </div>
          )}
        </div>

        <aside className="h-fit space-y-4 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-2 lg:sticky lg:top-24">
          <div className="flex items-center gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
              <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
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
