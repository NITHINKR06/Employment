"use client";

import AuthProvider from "@/lib/AuthProvider";

export default function Providers({ children }) {
  return <AuthProvider>{children}</AuthProvider>;
}
