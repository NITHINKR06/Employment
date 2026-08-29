"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { FiUser, FiMail, FiPhone, FiDollarSign } from "react-icons/fi";

export default function EmployeeSettingsPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Employee settings saved");
  };

  return (
    <div className="container max-w-2xl pb-section-gap">
      <h1 className="font-serif text-headline-md text-on-surface mb-8">Professional Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-lowest border border-on-surface/10 rounded-lg p-8">
        <TextField icon={FiUser} label="Business Name" defaultValue="Arjun Rao Plumbing" />
        <TextField icon={FiMail} label="Email" type="email" defaultValue="arjun@example.com" />
        <TextField icon={FiPhone} label="Phone" type="tel" defaultValue="+91 90000 00000" />
        <TextField icon={FiDollarSign} label="Hourly Rate" type="number" defaultValue="45" />
        <div>
          <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2">
            Service Categories
          </label>
          <p className="font-sans text-body-md text-on-surface-variant">Plumbing, Bathroom Fitting</p>
        </div>
        <Button type="submit" variant="primary" size="lg" className="w-fit self-end">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
