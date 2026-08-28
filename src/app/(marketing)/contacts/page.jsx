"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function ContactForm() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact form submitted");
  };

  return (
    <div className="container flex min-h-[70vh] items-center justify-center py-16">
      <div className="flex w-full max-w-5xl flex-col overflow-hidden rounded-xl border border-outline-variant shadow-elevation-2 md:flex-row">
        <div className="border-b border-outline-variant bg-surface-container-lowest p-10 md:w-1/2 md:border-b-0 md:border-r">
          <h1 className="font-display text-headline-md text-on-surface">Get in Touch</h1>
          <p className="mt-4 text-body-md text-on-surface-variant">
            We would love to hear from you. Please fill out the form and our team will reach out
            shortly.
          </p>
          <div className="mt-6 space-y-4 text-body-md text-on-surface">
            <div>
              <span className="block font-semibold">Phone</span>
              <span className="block text-on-surface-variant">+0123 4567 8910</span>
            </div>
            <div>
              <span className="block font-semibold">Email</span>
              <span className="block text-on-surface-variant">hello@promarket.com</span>
            </div>
            <div>
              <span className="block font-semibold">Address</span>
              <span className="block text-on-surface-variant">102 Street 2714 Don</span>
            </div>
          </div>
        </div>

        <div className="bg-surface-container-lowest p-10 md:w-1/2">
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
                className="w-full rounded border border-outline-variant bg-white p-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <Button type="submit" variant="secondary" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
