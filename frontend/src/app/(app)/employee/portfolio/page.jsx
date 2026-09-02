"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { IoArrowUp, IoArrowDown, IoTrashOutline } from "react-icons/io5";
import Button from "@/components/Button/Button";
import { apiFetch } from "@/lib/apiClient";

export default function EmployeePortfolioPage() {
  const [professional, setProfessional] = useState(null);
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newUrl, setNewUrl] = useState("");
  const [isBusy, setIsBusy] = useState(false);
  const [actionError, setActionError] = useState("");

  useEffect(() => {
    let cancelled = false;
    apiFetch("/professionals/me")
      .then(async (body) => {
        if (cancelled) return;
        const pro = body.data?.professional;
        if (!pro) {
          setError("Create your professional profile first.");
          return;
        }
        setProfessional(pro);
        const imagesBody = await apiFetch(`/professionals/${pro.id}/portfolio`);
        setImages(imagesBody.data?.images ?? []);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err.status === 401 ? "Please log in as a professional." : "Could not load portfolio.");
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!professional || !newUrl.trim()) return;
    setActionError("");
    setIsBusy(true);
    try {
      const body = await apiFetch(`/professionals/${professional.id}/portfolio`, {
        method: "POST",
        body: JSON.stringify({ url: newUrl.trim() }),
      });
      if (!body.success) throw new Error(body?.error?.message ?? "Could not add image");
      setImages(body.data.images);
      setNewUrl("");
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleRemove = async (imageId) => {
    if (!professional) return;
    setActionError("");
    setIsBusy(true);
    try {
      const body = await apiFetch(`/professionals/${professional.id}/portfolio/${imageId}`, {
        method: "DELETE",
      });
      if (!body.success) throw new Error(body?.error?.message ?? "Could not remove image");
      setImages(body.data.images);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  const handleMove = async (index, direction) => {
    if (!professional) return;
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= images.length) return;

    const reordered = [...images];
    [reordered[index], reordered[targetIndex]] = [reordered[targetIndex], reordered[index]];
    const orderedIds = reordered.map((img) => img.id);

    setActionError("");
    setIsBusy(true);
    try {
      const body = await apiFetch(`/professionals/${professional.id}/portfolio/order`, {
        method: "PUT",
        body: JSON.stringify({ orderedIds }),
      });
      if (!body.success) throw new Error(body?.error?.message ?? "Could not reorder");
      setImages(body.data.images);
    } catch (err) {
      setActionError(err.message);
    } finally {
      setIsBusy(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl py-10">
        <p className="text-body-md text-on-surface-variant">Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container max-w-3xl py-10">
        <p className="rounded-lg border border-outline-variant bg-surface-container-lowest p-6 text-body-md text-on-surface-variant">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl py-10">
      <h1 className="font-display text-headline-md text-on-surface">Portfolio</h1>
      <p className="mt-1 text-body-md text-on-surface-variant">
        Showcase your best work — shown on your public profile in this order.
      </p>

      <form onSubmit={handleAdd} className="mt-6 flex gap-3 rounded-lg bg-surface-container-lowest p-6 shadow-elevation-1">
        <input
          type="url"
          required
          value={newUrl}
          onChange={(e) => setNewUrl(e.target.value)}
          placeholder="https://example.com/photo.jpg"
          className="h-11 flex-1 rounded border border-outline-variant bg-surface px-3 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <Button type="submit" disabled={isBusy}>
          Add Image
        </Button>
      </form>
      {actionError && (
        <p className="mt-2 text-label-sm font-semibold text-error">{actionError}</p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {images.length === 0 ? (
          <p className="text-body-md text-on-surface-variant">No portfolio images yet.</p>
        ) : (
          images.map((image, index) => (
            <div key={image.id} className="overflow-hidden rounded-xl border border-outline-variant/60 shadow-sm">
              <div className="relative aspect-video">
                <Image src={image.url} alt="" fill className="object-cover" unoptimized />
              </div>
              <div className="flex items-center justify-between border-t border-outline-variant/40 bg-surface-container-lowest p-2">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={isBusy || index === 0}
                    onClick={() => handleMove(index, -1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <IoArrowUp />
                  </button>
                  <button
                    type="button"
                    disabled={isBusy || index === images.length - 1}
                    onClick={() => handleMove(index, 1)}
                    className="flex h-8 w-8 items-center justify-center rounded text-on-surface-variant hover:bg-surface-container-low disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <IoArrowDown />
                  </button>
                </div>
                <button
                  type="button"
                  disabled={isBusy}
                  onClick={() => handleRemove(image.id)}
                  className="flex h-8 w-8 items-center justify-center rounded text-error hover:bg-error-container/20 disabled:opacity-40"
                  aria-label="Remove"
                >
                  <IoTrashOutline />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
