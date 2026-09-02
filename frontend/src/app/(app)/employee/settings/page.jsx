"use client";

import { useEffect, useState } from "react";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import { apiFetch } from "@/lib/apiClient";

export default function EmployeeSettingsPage() {
  const [professional, setProfessional] = useState(null);
  const [form, setForm] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [saved, setSaved] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState(null);
  const [isRequestingVerification, setIsRequestingVerification] = useState(false);
  const [verificationError, setVerificationError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/professionals/me")
      .then((body) => {
        if (cancelled) return;
        const pro = body.data?.professional;
        if (!pro) {
          setLoadError("Create your professional profile first before editing settings.");
          return;
        }
        setProfessional(pro);
        setForm({
          title: pro.title ?? "",
          trade: pro.trade ?? "",
          hourlyRate: pro.hourlyRate ?? "",
          location: pro.location ?? "",
          bio: pro.bio ?? "",
        });
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(err.status === 401 ? "Please log in as a professional." : "Could not load your profile.");
        }
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
    if (!professional) return;
    setSaveError("");
    setSaved(false);
    setIsSaving(true);
    try {
      const body = await apiFetch(`/professionals/${professional.id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: form.title,
          trade: form.trade,
          hourlyRate: Number(form.hourlyRate) || 0,
          location: form.location,
          bio: form.bio,
        }),
      });
      if (!body.success || !body.data?.professional) {
        throw new Error(body?.error?.message ?? "Could not save settings");
      }
      setProfessional(body.data.professional);
      setSaved(true);
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRequestVerification = async () => {
    setVerificationError("");
    setIsRequestingVerification(true);
    try {
      const body = await apiFetch("/verification/requests", {
        method: "POST",
        body: JSON.stringify({}),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not submit verification request");
      }
      setVerificationStatus(body.data.verificationRequest.status);
    } catch (err) {
      setVerificationError(err.message);
    } finally {
      setIsRequestingVerification(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-2xl py-10">
        <p className="font-display text-headline-sm text-on-surface">Loading settings...</p>
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
      <h1 className="font-display text-headline-md text-on-surface">Professional Settings</h1>

      <form onSubmit={handleSave} className="mt-6 space-y-5 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <TextField id="title" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField id="trade" label="Trade / category" value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} />
        <TextField
          id="hourlyRate"
          type="number"
          label="Hourly rate ($)"
          value={form.hourlyRate}
          onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
        />
        <TextField id="location" label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} />
        <div>
          <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="bio">
            Bio
          </label>
          <textarea
            id="bio"
            rows={4}
            value={form.bio}
            onChange={(e) => setForm({ ...form, bio: e.target.value })}
            className="w-full rounded border border-outline-variant bg-surface p-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        {saveError && (
          <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
            {saveError}
          </div>
        )}
        {saved && <p className="text-label-sm font-semibold text-primary">Saved!</p>}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : "Save Changes"}
        </Button>
      </form>

      <div className="mt-6 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <h2 className="font-display text-headline-sm text-on-surface">Verification</h2>
        {professional.verified ? (
          <p className="mt-2 flex items-center gap-2 text-body-md text-on-surface-variant">
            Your profile is verified <VerifiedBadge size="sm" />
          </p>
        ) : (
          <>
            <p className="mt-2 text-body-md text-on-surface-variant">
              Verified professionals get a badge shown across the site. Submit a request for an admin to review.
            </p>
            {verificationStatus ? (
              <p className="mt-3 text-label-md font-semibold text-primary">
                Request submitted — status: {verificationStatus}
              </p>
            ) : (
              <Button className="mt-3" onClick={handleRequestVerification} disabled={isRequestingVerification}>
                {isRequestingVerification ? "Submitting..." : "Request Verification"}
              </Button>
            )}
            {verificationError && (
              <p className="mt-2 text-label-sm font-semibold text-error">{verificationError}</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
