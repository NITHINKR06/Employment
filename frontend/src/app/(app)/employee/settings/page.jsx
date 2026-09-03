"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { IoWarningOutline, IoTrashOutline } from "react-icons/io5";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import VerifiedBadge from "@/components/Badge/VerifiedBadge";
import PushToggle from "@/components/Notification/PushToggle";
import { apiFetch } from "@/lib/apiClient";

const LocationPickerMap = dynamic(() => import("@/components/Search/LocationPickerMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-56 items-center justify-center rounded-lg border border-outline-variant bg-surface-container-low">
      <p className="text-label-sm text-on-surface-variant">Loading map...</p>
    </div>
  ),
});

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
  const [serviceRadiusKm, setServiceRadiusKm] = useState(25);
  const [isSavingRadius, setIsSavingRadius] = useState(false);
  const [radiusError, setRadiusError] = useState("");
  const [radiusSaved, setRadiusSaved] = useState(false);
  const [coords, setCoords] = useState(null); // { latitude, longitude } | null
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState("");
  const [services, setServices] = useState([]);
  const [isSavingServices, setIsSavingServices] = useState(false);
  const [servicesError, setServicesError] = useState("");
  const [servicesSaved, setServicesSaved] = useState(false);

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
        setServiceRadiusKm(pro.serviceRadiusKm ?? 25);
        setServices(
          (pro.servicesOffered ?? []).map((s) => ({
            title: s.title ?? "",
            subtext: s.subtext ?? "",
            price: s.price ?? "",
          }))
        );
        if (pro.latitude != null && pro.longitude != null) {
          setCoords({ latitude: pro.latitude, longitude: pro.longitude });
        }
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

  const handleLocateOnMap = async () => {
    if (!form.location.trim()) return;
    setGeocodeError("");
    setIsGeocoding(true);
    try {
      const body = await apiFetch(`/geocoding/search?address=${encodeURIComponent(form.location)}`);
      setCoords({ latitude: body.data.latitude, longitude: body.data.longitude });
    } catch (err) {
      setCoords(null);
      setGeocodeError(
        err.status === 404
          ? "Couldn't find that exact address — try a simpler version, like just the street, area, or city."
          : "Could not resolve that location"
      );
    } finally {
      setIsGeocoding(false);
    }
  };

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
          ...(coords ? { latitude: coords.latitude, longitude: coords.longitude } : {}),
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

  const handleSaveRadius = async (e) => {
    e.preventDefault();
    if (!professional) return;
    setRadiusError("");
    setRadiusSaved(false);
    setIsSavingRadius(true);
    try {
      const body = await apiFetch(`/service-area/professionals/${professional.id}`, {
        method: "PATCH",
        body: JSON.stringify({ serviceRadiusKm: Number(serviceRadiusKm) }),
      });
      if (!body.success) {
        throw new Error(body?.error?.message ?? "Could not save service radius");
      }
      setRadiusSaved(true);
    } catch (err) {
      setRadiusError(err.message);
    } finally {
      setIsSavingRadius(false);
    }
  };

  const handleServiceChange = (index, field, value) => {
    setServices((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: value } : s)));
  };

  const handleAddService = () => {
    setServices((prev) => [...prev, { title: "", subtext: "", price: "" }]);
  };

  const handleRemoveService = (index) => {
    setServices((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveServices = async (e) => {
    e.preventDefault();
    if (!professional) return;
    setServicesError("");
    setServicesSaved(false);
    const trimmed = services.map((s) => ({ ...s, title: s.title.trim() }));
    if (trimmed.some((s) => !s.title)) {
      setServicesError("Every service needs a title.");
      return;
    }
    setIsSavingServices(true);
    try {
      const body = await apiFetch(`/professionals/${professional.id}`, {
        method: "PUT",
        body: JSON.stringify({
          servicesOffered: trimmed.map((s) => ({
            title: s.title,
            subtext: s.subtext.trim() || null,
            price: s.price === "" ? null : Number(s.price),
          })),
        }),
      });
      if (!body.success || !body.data?.professional) {
        throw new Error(body?.error?.message ?? "Could not save services");
      }
      setProfessional(body.data.professional);
      setServices(
        (body.data.professional.servicesOffered ?? []).map((s) => ({
          title: s.title ?? "",
          subtext: s.subtext ?? "",
          price: s.price ?? "",
        }))
      );
      setServicesSaved(true);
    } catch (err) {
      setServicesError(err.message);
    } finally {
      setIsSavingServices(false);
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
    <div className="container max-w-6xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Professional Settings</h1>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
      <form onSubmit={handleSave} className="space-y-5 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <TextField id="title" label="Title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <TextField id="trade" label="Trade / category" value={form.trade} onChange={(e) => setForm({ ...form, trade: e.target.value })} />
        <TextField
          id="hourlyRate"
          type="number"
          label="Hourly rate ($)"
          value={form.hourlyRate}
          onChange={(e) => setForm({ ...form, hourlyRate: e.target.value })}
        />
        <div>
          <p className="mb-1.5 flex items-start gap-1.5 rounded-lg bg-primary-container/10 p-2.5 text-label-sm text-on-surface-variant">
            <IoWarningOutline className="mt-0.5 shrink-0 text-primary" aria-hidden="true" />
            Your map pin is only set when you click &quot;Locate on Map&quot; and it succeeds.
            If you change the text below, click it again before saving — otherwise your
            old pin stays in place even though the address text has changed.
          </p>
          <div className="flex items-end gap-3">
            <TextField
              id="location"
              label="Location"
              className="flex-1"
              value={form.location}
              onChange={(e) => {
                setForm({ ...form, location: e.target.value });
                setCoords(null); // stale pin — re-locate before saving if the text changed
              }}
            />
            <Button
              type="button"
              variant="secondary"
              onClick={handleLocateOnMap}
              disabled={isGeocoding || !form.location.trim()}
            >
              {isGeocoding ? "Locating..." : "Locate on Map"}
            </Button>
          </div>
          {geocodeError && (
            <p className="mt-1.5 text-label-sm font-semibold text-error">{geocodeError}</p>
          )}
          {coords && (
            <div className="mt-3">
              <LocationPickerMap latitude={coords.latitude} longitude={coords.longitude} />
              <p className="mt-1.5 text-label-sm text-on-surface-variant">
                This pin is what customers will see on the search map — save to confirm it.
              </p>
            </div>
          )}
        </div>
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
        {!coords && form.location.trim() && form.location !== (professional.location ?? "") && (
          <div className="flex items-start gap-1.5 rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
            <IoWarningOutline className="mt-0.5 shrink-0" aria-hidden="true" />
            You changed the address but haven&apos;t clicked &quot;Locate on Map&quot; yet —
            saving now will keep your previous map pin, not this new address.
          </div>
        )}
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

      <form onSubmit={handleSaveServices} className="rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <h2 className="font-display text-headline-sm text-on-surface">Services Offered</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          These show up on your public profile so customers can pick a specific service to book.
        </p>
        <div className="mt-4 space-y-4">
          {services.map((service, index) => (
            <div
              key={index}
              className="flex flex-col gap-3 rounded-lg border border-outline-variant p-3 sm:flex-row sm:items-end"
            >
              <TextField
                id={`service-title-${index}`}
                label="Title"
                className="flex-1"
                value={service.title}
                onChange={(e) => handleServiceChange(index, "title", e.target.value)}
              />
              <TextField
                id={`service-subtext-${index}`}
                label="Description"
                className="flex-1"
                value={service.subtext}
                onChange={(e) => handleServiceChange(index, "subtext", e.target.value)}
              />
              <TextField
                id={`service-price-${index}`}
                type="number"
                label="Price ($)"
                className="w-full sm:w-28"
                value={service.price}
                onChange={(e) => handleServiceChange(index, "price", e.target.value)}
              />
              <button
                type="button"
                onClick={() => handleRemoveService(index)}
                className="flex shrink-0 items-center justify-center rounded-lg border border-outline-variant p-2.5 text-on-surface-variant hover:text-error"
                aria-label="Remove service"
              >
                <IoTrashOutline />
              </button>
            </div>
          ))}
          {services.length === 0 && (
            <p className="text-body-md text-on-surface-variant">No services added yet.</p>
          )}
        </div>
        <div className="mt-4 flex items-center gap-3">
          <Button type="button" variant="secondary" onClick={handleAddService}>
            + Add Service
          </Button>
          <Button type="submit" disabled={isSavingServices}>
            {isSavingServices ? "Saving..." : "Save Services"}
          </Button>
        </div>
        {servicesError && <p className="mt-2 text-label-sm font-semibold text-error">{servicesError}</p>}
        {servicesSaved && <p className="mt-2 text-label-sm font-semibold text-primary">Saved!</p>}
      </form>
      </div>

      <div className="space-y-6 lg:col-span-1">
      <div className="rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <h2 className="font-display text-headline-sm text-on-surface">Notifications</h2>
        <div className="mt-3">
          <PushToggle />
        </div>
      </div>

      <form onSubmit={handleSaveRadius} className="rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <h2 className="font-display text-headline-sm text-on-surface">Service Area</h2>
        <p className="mt-1 text-body-md text-on-surface-variant">
          How far you're willing to travel for a job.
        </p>
        <div className="mt-3 flex items-end gap-3">
          <TextField
            id="serviceRadiusKm"
            type="number"
            label="Radius (km)"
            value={serviceRadiusKm}
            onChange={(e) => setServiceRadiusKm(e.target.value)}
            className="max-w-xs"
          />
          <Button type="submit" disabled={isSavingRadius}>
            {isSavingRadius ? "Saving..." : "Save"}
          </Button>
        </div>
        {radiusError && <p className="mt-2 text-label-sm font-semibold text-error">{radiusError}</p>}
        {radiusSaved && <p className="mt-2 text-label-sm font-semibold text-primary">Saved!</p>}
      </form>

      <div className="rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
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
      </div>
    </div>
  );
}
