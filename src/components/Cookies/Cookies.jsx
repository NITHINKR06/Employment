'use client';

export default function CookieConsentModal({ onConsent }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-on-surface/40 backdrop-blur-sm" />
      {/* Modal Container */}
      <div className="relative w-full max-w-sm rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-elevation-2">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => onConsent(false)}
            className="text-on-surface-variant transition-colors hover:text-on-surface"
            aria-label="Close cookie banner"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Content */}
        <div className="flex flex-col items-center text-center">
          <h2 className="font-display text-headline-sm text-on-surface">We use cookies</h2>
          <p className="mt-2 text-body-md text-on-surface-variant">
            This website uses cookies to ensure you get the best experience on our site.
          </p>
          <div className="mt-6 flex w-full gap-3">
            <button
              onClick={() => onConsent(true)}
              className="flex-1 rounded-lg bg-primary py-2.5 text-label-md font-semibold text-on-primary transition hover:bg-primary-container hover:text-on-primary-container"
            >
              Allow
            </button>
            <button
              onClick={() => onConsent(false)}
              className="flex-1 rounded-lg border border-outline-variant bg-surface-container-low py-2.5 text-label-md font-semibold text-on-surface transition hover:bg-surface-container"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
