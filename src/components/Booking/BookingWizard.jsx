"use client";

import { useState } from "react";
import Image from "next/image";
import { IoCalendarOutline, IoLocationOutline, IoTimeOutline } from "react-icons/io5";
import { MdOutlineAddPhotoAlternate } from "react-icons/md";
import Stepper from "./Stepper";
import Rating from "@/components/Rating/Rating";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import Button from "@/components/Button/Button";
import PaymentForm from "@/components/Payment/PaymentForm";

const STEPS = ["Details", "Schedule", "Address", "Payment"];

function SummaryLine({ icon: Icon, label, value }) {
  const isPending = !value;
  return (
    <div className={`flex items-center justify-between ${isPending ? "opacity-50" : ""}`}>
      <span className="font-sans text-[13px] text-on-surface-variant">{label}</span>
      <span className="inline-flex items-center gap-1 font-sans text-[13px] text-on-surface">
        {value || "Not set yet"}
        {isPending && Icon && <Icon className="text-sm" />}
      </span>
    </div>
  );
}

export default function BookingWizard({ worker }) {
  const [stepIndex, setStepIndex] = useState(0);
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [address, setAddress] = useState("");

  const goNext = () => setStepIndex((index) => Math.min(index + 1, STEPS.length - 1));
  const goBack = () => setStepIndex((index) => Math.max(index - 1, 0));

  return (
    <div className="pt-10">
      <Stepper steps={STEPS} currentIndex={stepIndex} />

      <div className="container mt-16 grid grid-cols-1 md:grid-cols-12 gap-gutter pb-section-gap">
        <div className="md:col-span-8 flex flex-col gap-8">
          {stepIndex === 0 && (
            <>
              <h1 className="font-serif text-headline-md text-on-surface">What needs to be done?</h1>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                rows={6}
                placeholder="Describe the job in a few sentences..."
                className="minimal-input w-full py-3 font-sans text-body-lg text-on-surface"
              />
              <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed border-outline-variant rounded-xl p-10 text-on-surface-variant cursor-pointer hover:border-primary transition-colors">
                <MdOutlineAddPhotoAlternate className="text-3xl" />
                <span className="font-sans text-[13px]">Add photos of the job</span>
                <input type="file" multiple accept="image/*" className="hidden" />
              </label>
            </>
          )}

          {stepIndex === 1 && (
            <>
              <h1 className="font-serif text-headline-md text-on-surface">When works for you?</h1>
              <input
                type="datetime-local"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                className="minimal-input w-full max-w-xs py-2 font-sans text-body-lg text-on-surface"
              />
            </>
          )}

          {stepIndex === 2 && (
            <>
              <h1 className="font-serif text-headline-md text-on-surface">Where should {worker.name.split(" ")[0]} go?</h1>
              <textarea
                value={address}
                onChange={(event) => setAddress(event.target.value)}
                rows={3}
                placeholder="Street address, city, zip"
                className="minimal-input w-full py-3 font-sans text-body-lg text-on-surface"
              />
            </>
          )}

          {stepIndex === 3 && <PaymentForm />}

          {stepIndex < 3 && (
            <div className="flex gap-4">
              {stepIndex > 0 && (
                <Button variant="secondary" size="lg" onClick={goBack}>
                  Back
                </Button>
              )}
              <Button variant="primary" size="lg" onClick={goNext}>
                Continue to {STEPS[stepIndex + 1]}
              </Button>
            </div>
          )}
        </div>

        <div className="md:col-span-4">
          <div className="sticky top-32 rounded-xl border border-on-surface/10 shadow-elevation-1 p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-full overflow-hidden bg-surface-container-high shrink-0">
                <Image src={worker.avatar} alt={worker.name} fill className="object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-1">
                  <p className="font-sans font-semibold text-on-surface">{worker.name}</p>
                  {worker.verified && <VerifiedBadge size="sm" />}
                </div>
                <Rating value={worker.rating} size="sm" />
              </div>
            </div>

            <div className="flex flex-col gap-2 border-t border-on-surface/10 pt-4">
              <SummaryLine icon={IoLocationOutline} label="Service" value={worker.title} />
              <SummaryLine icon={IoCalendarOutline} label="Date & Time" value={date && new Date(date).toLocaleString()} />
              <SummaryLine icon={IoTimeOutline} label="Address" value={address} />
            </div>

            <div className="border-t border-on-surface/10 pt-4 flex items-center justify-between">
              <span className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant">
                Estimated Total
              </span>
              <span className="font-sans font-light text-numeric-data text-primary">
                ${worker.hourlyRate}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
