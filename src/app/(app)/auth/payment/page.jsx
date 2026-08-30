"use client";

import React from "react";
import { useRouter } from "next/navigation";
import PaymentForm from "@/components/Booking/PaymentForm";

export default function PaymentsPage() {
  const router = useRouter();

  return (
    <div className="container flex flex-col items-center py-10">
      <h1 className="mb-6 font-display text-headline-md text-on-surface">Payment Portal</h1>
      <PaymentForm
        initialAmount="45.00"
        onPaymentSuccess={() => {
          router.push("/user/bookingStatus");
        }}
      />
    </div>
  );
}

