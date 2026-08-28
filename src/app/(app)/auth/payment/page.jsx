'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FcGoogle } from 'react-icons/fc';
import QRCode from 'qrcode';
import Image from 'next/image';

function PaymentsModel() {
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
    <div className="flex items-center justify-center bg-surface">
      <div className="w-full max-w-5xl overflow-hidden rounded-xl bg-surface-container-lowest shadow-elevation-2">
        <div className="md:flex">
          {/* Left Panel: Payment Details & UPI QR Code */}
          <div className="flex flex-col justify-center bg-surface-container p-8 md:w-1/2">
            <h1 className="mb-4 text-center font-display text-headline-md text-on-surface">Payment Portal</h1>
            <div className="mb-6">
              <label className="mb-2 block text-label-md text-on-surface" htmlFor="amount">
                Enter Amount
              </label>
              <input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
                placeholder="e.g., 50.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>
            <div className="mb-8 text-center">
              <h2 className="text-headline-sm font-semibold text-on-surface">
                Total: <span className="font-bold text-primary">₹{getTotalAmount()}</span>
              </h2>
              <p className="text-label-sm text-on-surface-variant">(Includes ₹{surcharge} surcharge)</p>
            </div>
            <div className="flex flex-col items-center">
              <h2 className="mb-3 text-label-md font-semibold text-on-surface">UPI QR Code</h2>
              {qrCodeUrl ? (
                <Image
                  src={qrCodeUrl}
                  alt="UPI QR Code"
                  width={160}
                  height={160}
                  className="rounded-lg shadow-elevation-1"
                />
              ) : (
                <p className="text-on-surface-variant">Generating QR Code...</p>
              )}
              <p className="mt-4 text-center text-label-sm text-on-surface-variant">
                Scan with your UPI app to pay
              </p>
              <button
                className="mt-6 flex items-center justify-center rounded-lg border border-outline-variant bg-white px-4 py-2 text-on-surface shadow-elevation-1 transition hover:bg-surface-container-low focus:ring-2 focus:ring-primary"
                onClick={() => alert('Redirecting to Google Pay...')}
              >
                <FcGoogle className="mr-2" />
                Pay with Google
              </button>
            </div>
          </div>

          {/* Right Panel: Card Payment Form */}
          <div className="p-8 md:w-1/2">
            <form onSubmit={handlePayment} className="space-y-6">
              <h2 className="mb-6 text-headline-sm font-semibold text-on-surface">Card Payment</h2>
              <div>
                <label className="mb-2 block text-label-md text-on-surface" htmlFor="name">
                  Cardholder Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
                  placeholder="Enter your name"
                  required
                />
              </div>
              <div>
                <label className="mb-2 block text-label-md text-on-surface" htmlFor="card-number">
                  Card Number
                </label>
                <input
                  id="card-number"
                  type="text"
                  className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
                  placeholder="1234 5678 9012 3456"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-2 block text-label-md text-on-surface" htmlFor="expiry">
                    Expiry Date
                  </label>
                  <input
                    id="expiry"
                    type="text"
                    className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
                    placeholder="MM/YY"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-label-md text-on-surface" htmlFor="cvv">
                    CVV
                  </label>
                  <input
                    id="cvv"
                    type="password"
                    className="w-full rounded border border-outline-variant bg-white px-4 py-3 text-body-md text-on-surface outline-none transition focus:ring-2 focus:ring-primary"
                    placeholder="123"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-lg bg-primary py-3 text-label-md font-bold text-on-primary shadow-elevation-1 transition hover:bg-primary-container hover:text-on-primary-container"
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

export default PaymentsModel;
