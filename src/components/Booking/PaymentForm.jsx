"use client";

import React, { useState, useEffect, useCallback } from "react";
import { FcGoogle } from "react-icons/fc";
import { IoCardOutline, IoQrCodeOutline, IoCheckmarkCircleOutline } from "react-icons/io5";
import QRCode from "qrcode";

export default function PaymentForm({ initialAmount = "45.00", bookingId, onPaymentSuccess }) {
  const [amount, setAmount] = useState(initialAmount);
  const surcharge = 3.5;
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("upi"); // 'upi' | 'card'
  const [isSuccess, setIsSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentError, setPaymentError] = useState("");

  const upiId = "promarket@upi";

  const getTotalAmount = useCallback(() => {
    const enteredAmount = parseFloat(amount) || 0;
    return (enteredAmount + surcharge).toFixed(2);
  }, [amount, surcharge]);

  const generateQrCode = useCallback(async () => {
    const totalAmount = getTotalAmount();
    const upiUrl = `upi://pay?pa=${upiId}&pn=ProMarket+Services&am=${totalAmount}&cu=INR`;
    try {
      const qrCode = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error("QR Code Generation Error:", error);
    }
  }, [getTotalAmount]);

  useEffect(() => {
    generateQrCode();
  }, [generateQrCode]);

  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    setPaymentError("");

    if (bookingId) {
      setIsProcessing(true);
      try {
        const response = await fetch("/api/payments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookingId, amount: getTotalAmount(), method: paymentMethod }),
        });
        const body = await response.json();
        if (!response.ok || !body.success) {
          throw new Error(body?.error?.message ?? "Payment failed");
        }
      } catch (err) {
        setPaymentError(err.message);
        setIsProcessing(false);
        return;
      }
      setIsProcessing(false);
    }

    setIsSuccess(true);
    if (onPaymentSuccess) {
      setTimeout(() => {
        onPaymentSuccess();
      }, 1500);
    }
  };

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl bg-surface-container-lowest p-8 text-center shadow-elevation-2">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-container text-on-primary-container">
          <IoCheckmarkCircleOutline className="h-10 w-10 text-primary" />
        </div>
        <h2 className="mt-4 font-display text-headline-md text-on-surface">Payment Successful!</h2>
        <p className="mt-2 text-body-md text-on-surface-variant">
          Your payment of <strong className="text-primary">${getTotalAmount()}</strong> was processed safely.
        </p>
        <p className="mt-1 text-label-sm text-on-surface-variant">Redirecting to your booking status...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl overflow-hidden rounded-xl bg-surface-container-lowest shadow-elevation-2">
      {/* Payment Method Selector Tabs */}
      <div className="flex border-b border-outline-variant bg-surface-container-low">
        <button
          type="button"
          onClick={() => setPaymentMethod("upi")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-4 font-display text-label-md font-semibold transition-colors ${
            paymentMethod === "upi"
              ? "border-primary bg-surface-container-lowest text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <IoQrCodeOutline className="h-5 w-5" />
          UPI / Google Pay
        </button>
        <button
          type="button"
          onClick={() => setPaymentMethod("card")}
          className={`flex flex-1 items-center justify-center gap-2 border-b-2 py-4 font-display text-label-md font-semibold transition-colors ${
            paymentMethod === "card"
              ? "border-primary bg-surface-container-lowest text-primary"
              : "border-transparent text-on-surface-variant hover:text-on-surface"
          }`}
        >
          <IoCardOutline className="h-5 w-5" />
          Credit / Debit Card
        </button>
      </div>

      <div className="p-6 md:p-8">
        {paymentMethod === "upi" ? (
          <div className="flex flex-col items-center text-center">
            <div className="mb-4 w-full max-w-sm">
              <label className="mb-1.5 block text-left text-label-md text-on-surface" htmlFor="payment-amount">
                Total Base Amount ($)
              </label>
              <input
                id="payment-amount"
                type="number"
                step="0.01"
                min="0"
                className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            <div className="mb-6 rounded-lg bg-surface-container-low p-4 w-full max-w-sm">
              <span className="text-body-md text-on-surface-variant">Total Payable: </span>
              <span className="font-display text-headline-sm font-bold text-primary">${getTotalAmount()}</span>
              <p className="text-label-sm text-on-surface-variant mt-0.5">(Includes ${surcharge.toFixed(2)} service fee)</p>
            </div>

            <div className="flex flex-col items-center rounded-xl border border-outline-variant bg-surface-container-lowest p-6 shadow-elevation-1">
              <p className="mb-3 text-label-md font-semibold text-on-surface">Scan UPI QR Code</p>
              {qrCodeUrl ? (
                /* Standard img element for base64 data URL */
                <img
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  className="h-44 w-44 rounded-lg border border-outline-variant p-2 shadow-elevation-1"
                />
              ) : (
                <div className="flex h-44 w-44 items-center justify-center text-body-md text-on-surface-variant">
                  Generating QR Code...
                </div>
              )}
              <p className="mt-3 text-label-sm text-on-surface-variant">Use GPay, PhonePe, Paytm or any UPI app</p>
            </div>

            {paymentError && (
              <div className="mb-3 w-full max-w-sm rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
                {paymentError}
              </div>
            )}

            <div className="mt-6 flex w-full max-w-sm gap-3">
              <button
                type="button"
                disabled={isProcessing}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-outline-variant bg-white py-3 text-label-md font-semibold text-on-surface shadow-elevation-1 transition hover:bg-surface-container-low focus:ring-2 focus:ring-primary disabled:opacity-50"
                onClick={handlePaymentSubmit}
              >
                <FcGoogle className="h-5 w-5" />
                Pay via GPay
              </button>
              <button
                type="button"
                disabled={isProcessing}
                className="flex-1 rounded-lg bg-primary py-3 text-label-md font-bold text-on-primary shadow-elevation-1 transition hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
                onClick={handlePaymentSubmit}
              >
                {isProcessing ? "Processing..." : "Confirm Payment"}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePaymentSubmit} className="mx-auto max-w-md space-y-4">
            <div className="mb-2 rounded-lg bg-surface-container-low p-4 text-center">
              <span className="text-body-md text-on-surface-variant">Total Payable: </span>
              <span className="font-display text-headline-sm font-bold text-primary">${getTotalAmount()}</span>
            </div>

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="card-name">
                Cardholder Name
              </label>
              <input
                id="card-name"
                type="text"
                className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="John Doe"
                required
              />
            </div>

            <div>
              <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="card-number">
                Card Number
              </label>
              <input
                id="card-number"
                type="text"
                className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="4111 2222 3333 4444"
                maxLength={19}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="expiry">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  type="text"
                  className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                />
              </div>
              <div>
                <label className="mb-1.5 block text-label-md text-on-surface" htmlFor="cvv">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="password"
                  className="h-12 w-full rounded border border-outline-variant bg-white px-4 text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="123"
                  maxLength={4}
                  required
                />
              </div>
            </div>

            {paymentError && (
              <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
                {paymentError}
              </div>
            )}

            <button
              type="submit"
              disabled={isProcessing}
              className="mt-6 w-full rounded-lg bg-primary py-3.5 text-label-md font-bold text-on-primary shadow-elevation-1 transition hover:bg-primary-container hover:text-on-primary-container disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : `Pay $${getTotalAmount()} Now`}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
