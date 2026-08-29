"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";

export default function ContactPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Contact form submitted");
  };

  return (
    <div className="container pb-section-gap">
      <div className="max-w-4xl mx-auto shadow-elevation-1 rounded-lg border border-on-surface/10 overflow-hidden flex flex-col md:flex-row">
        <div className="md:w-1/2 p-10 border-b md:border-b-0 md:border-r border-on-surface/10 flex flex-col gap-6">
          <h1 className="font-serif text-headline-md text-on-surface">Get in Touch</h1>
          <p className="font-sans text-body-lg text-on-surface-variant">
            We&rsquo;d love to hear from you. Fill out the form and our team at {SITE_NAME} will reach out shortly.
          </p>
          <div className="flex flex-col gap-4">
            <div>
              <span className="block font-sans font-semibold text-on-surface">Phone</span>
              <span className="font-sans text-on-surface-variant">+0123 4567 8910</span>
            </div>
            <div>
              <span className="block font-sans font-semibold text-on-surface">Email</span>
              <span className="font-sans text-on-surface-variant">hello@localpro.example</span>
            </div>
            <div>
              <span className="block font-sans font-semibold text-on-surface">Address</span>
              <span className="font-sans text-on-surface-variant">102 Street 2714, Bangalore</span>
            </div>
          </div>
        </div>

        <div className="md:w-1/2 p-10">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <TextField label="Name" required />
            <TextField label="Email" type="email" required />
            <div>
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
                Message
              </label>
              <textarea
                rows={4}
                required
                className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
              />
            </div>
            <Button type="submit" variant="secondary" size="lg" className="w-full">
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
