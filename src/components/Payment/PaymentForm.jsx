'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';
import QRCode from 'qrcode';
import Image from 'next/image';

export default function PaymentForm() {
  const [amount, setAmount] = useState('00.00');
  const surcharge = 9.99; // Surcharge amount in rupees
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const upiId = 'your-upi-id@upi'; // Replace with your actual UPI ID

  // Calculate the total amount (entered amount plus surcharge)
  const getTotalAmount = useCallback(() => {
    const enteredAmount = parseFloat(amount) || 0;
    return (enteredAmount + surcharge).toFixed(2);
  }, [amount]);

  // Generate a UPI payment URL and then convert it to a QR code
  const generateQrCode = useCallback(async () => {
    const totalAmount = getTotalAmount();
    const upiUrl = `upi://pay?pa=${upiId}&pn=Your+Business+Name&am=${totalAmount}&cu=INR`;
    try {
      const qrCode = await QRCode.toDataURL(upiUrl);
      setQrCodeUrl(qrCode);
    } catch (error) {
      console.error('QR Code Generation Error:', error);
    }
  }, [getTotalAmount, upiId]);

  // Generate the QR code on component mount or whenever the amount changes
  useEffect(() => {
    generateQrCode();
  }, [generateQrCode]);

  // Handle form submission for card payment
  const handlePayment = (e) => {
    e.preventDefault();
    alert(`Payment of ₹${getTotalAmount()} Successful! Thank you for your purchase.`);
  };

  return (
    <div className="container flex items-center justify-center py-16">
      <div className="bg-surface-container-lowest shadow-elevation-2 rounded-xl w-full max-w-5xl overflow-hidden border border-on-surface/10">
        <div className="md:flex">
          {/* Left Panel: Payment Details & UPI QR Code */}
          <div className="md:w-1/2 p-8 bg-surface-container-low flex flex-col justify-center">
            <h1 className="font-serif text-headline-sm text-on-surface mb-4 text-center">Payment Portal</h1>
            <div className="mb-6">
              <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2" htmlFor="amount">
                Enter Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
                placeholder="e.g., 50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="mb-8 text-center">
              <h2 className="font-sans text-body-lg text-on-surface">
                Total: <span className="font-sans font-light text-numeric-data text-primary">₹{getTotalAmount()}</span>
              </h2>
              <p className="font-sans text-[13px] text-on-surface-variant">(Includes ₹{surcharge} surcharge)</p>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-3">UPI QR Code</h2>
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  width={160}
                  height={160}
                  className="rounded-lg shadow-elevation-1"
                />
              ) : (
                <p className="font-sans text-on-surface-variant">Generating QR Code...</p>
              )}
              <p className="font-sans text-[13px] text-on-surface-variant mt-4 text-center">
                Scan with your UPI app to pay
              </p>
              <button
                className="mt-6 flex items-center justify-center bg-surface-container-lowest text-on-surface border border-on-surface/20 py-2 px-4 rounded shadow-elevation-1 hover:bg-surface-container-low transition-colors"
                onClick={() => alert('Redirecting to Google Pay...')}
              >
                <FcGoogle className="mr-2" />
                Pay with Google
              </button>
            </div>
          </div>

          {/* Right Panel: Card Payment Form */}
          <div className="md:w-1/2 p-8">
            <form onSubmit={handlePayment} className="flex flex-col gap-6">
              <h2 className="font-serif text-headline-sm text-on-surface">Card Payment</h2>
              <div>
                <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2" htmlFor="name">
                  Cardholder Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2" htmlFor="card-number">
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2" htmlFor="expiry">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="block font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-on-surface-variant mb-2" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    className="minimal-input w-full py-2 font-sans text-body-lg text-on-surface"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-primary text-on-primary py-3 rounded font-sans font-semibold uppercase tracking-[0.1em] text-[12px] hover:bg-primary-container transition-colors"
              >
                Pay Now
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
