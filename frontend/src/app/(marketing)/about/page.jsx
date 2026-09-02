"use client";

import { useState } from "react";
import { IoShieldCheckmarkOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import { MdOutlineVerifiedUser, MdOutlineSupportAgent as MdSupportAgent, MdOutlineGppGood } from "react-icons/md";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

const WHY_POINTS = [
  { icon: MdOutlineVerifiedUser, text: "Every professional passes a background and skill check." },
  { icon: IoCheckmarkCircleOutline, text: "Transparent pricing, no surprise fees." },
  { icon: MdSupportAgent, text: "Real support if anything goes wrong." },
];

const SAFETY_TILES = [
  { icon: MdOutlineGppGood, title: "Verified Pros", text: "100% of professionals are identity-verified." },
  { icon: IoShieldCheckmarkOutline, title: "Protection Guarantee", text: "Your property is covered against accidental damage." },
  { icon: MdSupportAgent, title: "Always-On Support", text: "Our team is here if a job doesn't go as planned." },
];

const FAQS = [
  { q: "How are professionals vetted?", a: "Every pro completes an identity check, background screening, and skill verification before joining." },
  { q: "What if I'm not satisfied with a job?", a: "Reach out to support within 48 hours and we'll help make it right, including a re-do or refund where applicable." },
  { q: "Is payment protected?", a: "Yes — payments are held until the job is marked complete by both sides." },
];

export default function AboutPage() {
  const [formSubmitted, setFormSubmitted] = useState(false);

  return (
    <div>
      <section className="container py-16">
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div>
            <h1 className="font-display text-display-lg text-on-surface md:text-display-lg-desktop">
              Our Commitment to Trust
            </h1>
            <p className="mt-4 text-body-lg text-on-surface-variant">
              ProMarket exists to make hiring local help simple and safe — for clients and for the
              professionals who do the work.
            </p>
          </div>
          <ul className="space-y-4">
            {WHY_POINTS.map((point) => (
              <li key={point.text} className="flex items-start gap-3">
                <point.icon className="mt-0.5 shrink-0 text-xl text-primary" aria-hidden="true" />
                <span className="text-body-md text-on-surface-variant">{point.text}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="bg-surface-container py-16">
        <div className="container">
          <h2 className="text-center font-display text-headline-md text-on-surface">
            Our Commitment to Safety
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SAFETY_TILES.map((tile) => (
              <div key={tile.title} className="rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
                <tile.icon className="text-2xl text-primary" aria-hidden="true" />
                <h3 className="mt-3 text-label-md font-semibold text-on-surface">{tile.title}</h3>
                <p className="mt-1 text-body-md text-on-surface-variant">{tile.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2">
          <div>
            <h2 className="font-display text-headline-md text-on-surface">FAQs</h2>
            <div className="mt-4 space-y-4">
              {FAQS.map((faq) => (
                <details key={faq.q} className="rounded-md border border-outline-variant p-4">
                  <summary className="cursor-pointer text-label-md font-semibold text-on-surface">
                    {faq.q}
                  </summary>
                  <p className="mt-2 text-body-md text-on-surface-variant">{faq.a}</p>
                </details>
              ))}
            </div>
          </div>

          <div>
            <h2 className="font-display text-headline-md text-on-surface">Still have a question?</h2>
            {formSubmitted ? (
              <div className="mt-4 rounded-xl bg-primary-container/10 p-6 text-center">
                <p className="font-display text-headline-sm text-primary">Message Sent!</p>
                <p className="mt-1 text-body-md text-on-surface-variant">Thank you for reaching out. Our support team will get back to you shortly.</p>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setFormSubmitted(true);
                }}
                className="mt-4 space-y-4"
              >
                <div className="grid grid-cols-2 gap-4">
                  <TextField id="first-name" label="First name" placeholder="Jane" required />
                  <TextField id="last-name" label="Last name" placeholder="Doe" required />
                </div>
                <TextField id="about-email" type="email" label="Email" placeholder="you@example.com" required />
                <div>
                  <label htmlFor="topic" className="mb-1.5 block text-label-md text-on-surface">
                    Topic
                  </label>
                  <select
                    id="topic"
                    className="h-12 w-full rounded border border-outline-variant bg-surface-container-lowest px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  >
                    <option>General question</option>
                    <option>Trust & Safety</option>
                    <option>Billing</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="about-message" className="mb-1.5 block text-label-md text-on-surface">
                    Message
                  </label>
                  <textarea
                    id="about-message"
                    rows={4}
                    required
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
