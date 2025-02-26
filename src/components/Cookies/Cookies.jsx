'use client';

export default function CookieConsentModal({ onConsent }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-gray-800 opacity-60 backdrop-blur-sm"></div>
      {/* Modal Container */}
      <div className="relative max-w-sm w-full bg-white rounded-lg shadow-xl p-6 transform transition-all duration-300">
        {/* Close Button */}
        <div className="flex justify-end">
          <button
            onClick={() => onConsent(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* Modal Content */}
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-bold text-gray-800 mb-2">We use cookies</h2>
          <p className="text-center text-sm text-gray-600 mb-6">
            This website uses cookies to ensure you get the best experience on our site.
          </p>
          <div className="flex space-x-4">
            <button
              onClick={() => onConsent(true)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition"
            >
              Allow
            </button>
            <button
              onClick={() => onConsent(false)}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-full hover:bg-gray-400 transition"
            >
              Decline
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
