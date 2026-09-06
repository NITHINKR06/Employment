"use client";

import { useState } from "react";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.target;
    const name = form["contact-name"].value.trim();
    const email = form["contact-email"].value.trim();
    const message = form["contact-message"].value.trim();

    setError(null);
    setSubmitting(true);
    try {
      await apiFetch("/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message }),
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-outline-variant/60 shadow-elevation-2 md:flex-row">
        <div className="border-b border-outline-variant/60 bg-surface-container-lowest p-10 md:w-1/2 md:border-b-0 md:border-r">
          <h1 className="font-display text-headline-md text-on-surface">Get in Touch</h1>
          <p className="mt-4 text-body-md text-on-surface-variant">
            We would love to hear from you. Please fill out the form and our team will reach out
            shortly.
          </p>
          <div className="mt-6 space-y-4 text-body-md text-on-surface">
            <div>
              <span className="block font-semibold">Phone</span>
              <span className="block text-on-surface-variant">+91 98765 43210</span>
            </div>
            <div>
              <span className="block font-semibold">Email</span>
              <span className="block text-on-surface-variant">support@promarket.com</span>
            </div>
            <div>
              <span className="block font-semibold">Address</span>
              <span className="block text-on-surface-variant">102 Indiranagar, Bangalore, IN</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-10 md:w-1/2">
          {submitted ? (
            <div className="flex h-full flex-col justify-center text-center">
              <h2 className="font-display text-headline-md text-primary">Thank You!</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">
                Your message has been sent successfully. We will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <TextField id="contact-name" name="contact-name" label="Name" required />
              <TextField id="contact-email" name="contact-email" type="email" label="Email" required />
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-label-md text-on-surface">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="contact-message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-outline-variant bg-surface-container-lowest p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              {error && <p className="text-label-sm text-error">{error}</p>}
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
