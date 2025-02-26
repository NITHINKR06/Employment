'use client'

// pages/_app.js
import { useState, useEffect } from 'react';
import Cookies from './Cookies'; // Adjust the path if needed

function MyApp({ Component, pageProps }) {
  const [showCookies, setShowCookies] = useState(false);

  useEffect(() => {
    // Run once on mount; here, we show the component 50% of the time.
    if (Math.random() < 0.5) {
      setShowCookies(true);
    }
  }, []);

  return (
    <>
      <Component {...pageProps} />
      {showCookies && <Cookies />}
    </>
  );
}

export default MyApp;

