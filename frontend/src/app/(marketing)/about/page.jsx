"use client";

import { useState } from "react";
import Image from "next/image";
import { IoShieldCheckmarkOutline } from "react-icons/io5";
import { MdOutlineVerifiedUser, MdOutlineSupportAgent as MdSupportAgent, MdOutlineGppGood } from "react-icons/md";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

const WHY_POINTS = [
  {
    icon: MdOutlineVerifiedUser,
    title: "Rigorous Vetting Process",
    text: "Every professional undergoes a comprehensive background check, identity verification, and credential review before joining our platform.",
  },
  {
    icon: IoShieldCheckmarkOutline,
    title: "Satisfaction Guarantee",
    text: "Your peace of mind is paramount. If a job isn't done right, our customer protection program ensures it gets resolved or refunded.",
  },
  {
    icon: MdSupportAgent,
    title: "24/7 Dedicated Support",
    text: "Our specialized trust and safety team is available around the clock to address any concerns or mediate issues promptly.",
  },
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
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const firstName = form["first-name"].value.trim();
    const lastName = form["last-name"].value.trim();
    const email = form["about-email"].value.trim();
    const topic = form.topic.value;
    const message = form["about-message"].value.trim();

    setSubmitError(null);
    setSubmitting(true);
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({
          name: `${firstName} ${lastName}`.trim(),
          email,
          subject: topic,
          message,
        }),
      });
      setFormSubmitted(true);
    } catch (err) {
      setSubmitError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <section className="container py-16">
        <div className="mx-auto mb-14 max-w-3xl text-center">
          <h1 className="font-display text-display-lg text-on-surface md:text-display-lg-desktop">
            Trust is the foundation of every service.
          </h1>
          <p className="mt-4 text-body-lg text-on-surface-variant">
            At ProMarket, we believe that hiring a professional should be safe, transparent, and
            hassle-free. We meticulously vet our providers so you can book with complete
            confidence.
          </p>
        </div>
        <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2">
          <div className="group relative h-[400px] overflow-hidden rounded-xl shadow-elevation-1">
            <Image
              src="https://picsum.photos/seed/promarket-trust/1200/900"
              alt="A professional reviewing work with a client"
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
          </div>
          <div>
            <h2 className="font-display text-headline-md text-on-surface">Why ProMarket?</h2>
            <ul className="mt-4 space-y-4">
              {WHY_POINTS.map((point) => (
                <li key={point.title} className="flex items-start gap-3">
                  <point.icon className="mt-1 shrink-0 text-xl text-primary" aria-hidden="true" />
                  <div>
                    <span className="block text-label-md font-semibold text-on-surface">
                      {point.title}
                    </span>
                    <span className="text-body-md text-on-surface-variant">{point.text}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="bg-surface-container py-16">
        <div className="container">
          <h2 className="text-center font-display text-headline-md text-on-surface">
            Our Commitment to Safety
          </h2>
          <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-3">
            {SAFETY_TILES.map((tile) => (
              <div
                key={tile.title}
                className="rounded-xl bg-surface-container-lowest p-6 shadow-elevation-1 transition-all duration-300 hover:-translate-y-1 hover:shadow-elevation-2"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <tile.icon className="text-2xl" aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-label-md font-semibold text-on-surface">{tile.title}</h3>
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

          <div className="rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-8 shadow-elevation-1">
            <h2 className="font-display text-headline-md text-on-surface">Contact Support</h2>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Need immediate assistance? Fill out the form below or email us directly at{" "}
              <a href="mailto:support@promarket.com" className="text-primary hover:underline">
                support@promarket.com
              </a>
              .
            </p>
            {formSubmitted ? (
              <div className="mt-4 rounded-xl bg-primary-container/10 p-6 text-center">
                <p className="font-display text-headline-sm text-primary">Message Sent!</p>
                <p className="mt-1 text-body-md text-on-surface-variant">Thank you for reaching out. Our support team will get back to you shortly.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <TextField id="first-name" name="first-name" label="First name" placeholder="Jane" required />
                  <TextField id="last-name" name="last-name" label="Last name" placeholder="Doe" required />
                </div>
                <TextField
                  id="about-email"
                  name="about-email"
                  type="email"
                  label="Email"
                  placeholder="you@example.com"
                  required
                />
                <div>
                  <label htmlFor="topic" className="mb-1.5 block text-label-md text-on-surface">
                    Topic
                  </label>
                  <select
                    id="topic"
                    name="topic"
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
                    name="about-message"
                    rows={4}
                    required
                    className="w-full rounded border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
                {submitError && <p className="text-label-sm text-error">{submitError}</p>}
                <Button type="submit" disabled={submitting} className="w-full">
                  {submitting ? "Sending..." : "Send Message"}
                </Button>
              </form>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
