"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function UserSettingsPage() {
  const handleSave = (e) => {
    e.preventDefault();
    console.log("Settings saved");
  };

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Account Settings</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <TextField id="settings-name" label="Full name" placeholder="Your name" />
        <TextField id="settings-email" type="email" label="Email" placeholder="you@example.com" />
        <TextField id="settings-phone" type="tel" label="Phone" placeholder="+1 555 000 0000" />
        <Button type="submit">Save Changes</Button>
      </form>
    </div>
  );
}
