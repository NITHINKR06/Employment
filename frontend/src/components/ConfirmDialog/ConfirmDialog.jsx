"use client";

import { useEffect } from "react";
import Button from "@/components/Button/Button";

export default function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  danger = false,
  isConfirming = false,
  onConfirm,
  onCancel,
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") onCancel?.();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
      role="presentation"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-description"
        className="w-full max-w-sm rounded-lg bg-surface-container-lowest p-6 shadow-elevation-2"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="font-display text-headline-sm text-on-surface">
          {title}
        </h2>
        {description && (
          <p id="confirm-dialog-description" className="mt-2 text-body-md text-on-surface-variant">
            {description}
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="text" size="md" onClick={onCancel} disabled={isConfirming}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="md"
            className={danger ? "!border-error !text-error hover:!bg-error-container/20" : ""}
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? "Working..." : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  );
}
