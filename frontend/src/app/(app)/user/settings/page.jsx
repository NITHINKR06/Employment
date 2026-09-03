"use client";

import { useEffect, useState } from "react";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import PushToggle from "@/components/Notification/PushToggle";
import { apiFetch } from "@/lib/apiClient";

export default function UserSettingsPage() {
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let cancelled = false;
    apiFetch("/settings")
      .then((body) => {
        if (cancelled) return;
        setForm({
          name: body.data?.name ?? "",
          email: body.data?.email ?? "",
          phone: body.data?.phone ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.status === 401 ? "Please log in." : "Could not load settings.");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaveError("");
    setSaved(false);
    setIsSaving(true);
    try {
      const body = await apiFetch("/settings", {
        method: "PATCH",
        body: JSON.stringify(form),
      });
      if (!body.success) throw new Error(body?.error?.message ?? "Could not save settings");
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
          {loadError}
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-2xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Account Settings</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <TextField
          id="settings-name"
          label="Full name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />
        <TextField
          id="settings-email"
          type="email"
          label="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <TextField
          id="settings-phone"
          type="tel"
          label="Phone"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
        />
        {saveError && <p className="text-label-sm font-semibold text-error">{saveError}</p>}
        {saved && <p className="text-label-sm font-semibold text-primary">Saved!</p>}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <h2 className="font-display text-headline-sm text-on-surface">Notifications</h2>
        <div className="mt-3">
          <PushToggle />
        </div>
      </div>
    </div>
  );
}
