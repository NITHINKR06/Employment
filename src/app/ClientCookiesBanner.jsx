// app/ClientCookiesBanner.jsx
'use client';

import { useEffect, useState } from 'react';
import Cookies from '@/components/Cookies/Cookies';

export default function ClientCookiesBanner() {
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    // Check if the user has already provided consent
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Only show the banner 50% of the time if consent hasn't been set
      if (Math.random() < 0.5) {
        setShowCookies(true);
      }
    }
  }, []);

  const handleConsent = (allowed) => {
    localStorage.setItem('cookieConsent', allowed ? 'allowed' : 'declined');
    setShowCookies(false);
  };

  return showCookies ? <Cookies onConsent={handleConsent} /> : null;
}
