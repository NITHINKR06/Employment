"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function EmployeeSettingsPage() {
  const handleSave = (e) => {
    e.preventDefault();
    console.log("Employee settings saved");
  };

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Professional Settings</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <TextField id="business-name" label="Business name" placeholder="Your business name" />
        <TextField id="service-categories" label="Service categories" placeholder="e.g. Plumbing, Electrical" />
        <TextField id="hourly-rate" type="number" label="Hourly rate ($)" placeholder="45" />
        <TextField id="payout-details" label="Payout account" placeholder="Bank account or UPI ID" />
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
