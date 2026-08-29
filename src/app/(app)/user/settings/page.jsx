"use client";

import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { FiUser, FiMail, FiPhone } from "react-icons/fi";

export default function UserSettingsPage() {
  const handleSubmit = (event) => {
    event.preventDefault();
    console.log("Settings saved");
  };

  return (
    <div className="container max-w-2xl pb-section-gap">
      <h1 className="font-serif text-headline-md text-on-surface mb-8">Account Settings</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-6 bg-surface-container-lowest border border-on-surface/10 rounded-lg p-8">
        <TextField icon={FiUser} label="Full Name" defaultValue="Arjun Rao" />
        <TextField icon={FiMail} label="Email" type="email" defaultValue="arjun@example.com" />
        <TextField icon={FiPhone} label="Phone" type="tel" defaultValue="+91 90000 00000" />
        <Button type="submit" variant="primary" size="lg" className="w-fit self-end">
          Save Changes
        </Button>
      </form>
    </div>
  );
}
