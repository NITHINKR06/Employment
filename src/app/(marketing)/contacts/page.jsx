"use client";

import { useState } from "react";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
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
              <TextField id="contact-name" label="Name" required />
              <TextField id="contact-email" type="email" label="Email" required />
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-label-md text-on-surface">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  rows={4}
                  required
                  className="w-full rounded-lg border border-outline-variant bg-white p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <Button type="submit" className="w-full">
                Send Message
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
