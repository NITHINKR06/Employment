"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import PaymentForm from "@/components/Booking/PaymentForm";

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId") || undefined;
  const amount = searchParams.get("amount") || "45.00";

  return (
    <div className="container flex flex-col items-center py-10">
      <h1 className="mb-6 font-display text-headline-md text-on-surface">Payment Portal</h1>
      <PaymentForm
        initialAmount={amount}
        bookingId={bookingId}
        onPaymentSuccess={() => {
          router.push("/user/bookingStatus");
        }}
      />
    </div>
  );
}

export default function PaymentsPage() {
  return (
    <Suspense fallback={<div className="container py-20 text-center font-display text-headline-sm text-on-surface-variant">Loading payment portal...</div>}>
      <PaymentPageContent />
    </Suspense>
  );
}
