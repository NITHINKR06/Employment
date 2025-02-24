'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { FcGoogle } from "react-icons/fc";
import QRCode from 'qrcode';
import Image from 'next/image';

export default function Payment() {
    const [amount, setAmount] = useState('00.00');
    const surcharge = 9.99; // Surcharge amount in rupees
    const [qrCodeUrl, setQrCodeUrl] = useState('');
  
    const upiId = 'your-upi-id@upi'; // Replace with your UPI ID
  
    const getTotalAmount = useCallback(() => {
      const enteredAmount = parseFloat(amount) || 0;
      return (enteredAmount + surcharge).toFixed(2);
    }, [amount]);
  
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
  
    useEffect(() => {
      generateQrCode();
    }, [generateQrCode]);
  
    const handlePayment = (e) => {
      e.preventDefault();
      alert(`Payment of ₹${getTotalAmount()} Successful! Thank you for your purchase.`);
    };
  
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-100 flex items-center justify-center p-6">
        <div className="bg-white shadow-2xl rounded-xl p-8 w-full max-w-3xl border-t-8 border-blue-500">
          <h1 className="text-4xl font-extrabold text-gray-800 mb-6 text-center">Payment Portal</h1>
  
          {/* Enter Amount */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2" htmlFor="amount">
              Enter Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0"
              className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
              placeholder="e.g., 50.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>
  
          {/* Total Amount */}
          <div className="mb-8 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              Total Amount: <span className="text-blue-600 font-bold">₹{getTotalAmount()}</span>
            </h2>
            <p className="text-sm text-gray-500">(Includes ₹{surcharge} surcharge)</p>
          </div>
  
          {/* QR Code Payment */}
          <div className="mb-8 text-center">
            <h2 className="text-lg font-semibold text-gray-700 mb-4">UPI QR Code</h2>
            {qrCodeUrl ? (
            <Image 
                src={qrCodeUrl} 
                alt="UPI QR Code" 
                width={160} 
                height={160} 
                className="mx-auto rounded-lg shadow" 
            />
            ) : (
            <p className="text-gray-500">Generating QR Code...</p>
            )}

            <p className="text-sm text-gray-500 mt-4">Scan the QR code with your UPI app to complete the payment.</p>
          </div>
  
          {/* Pay with Google */}
          <div className="mb-8 text-center">
            <button
              className="flex items-center justify-center bg-white text-black-2 py-3 px-6 rounded-lg shadow-lg text-lg font-bold hover:bg-white transition focus:ring-4 focus:ring-slate-200"
              onClick={() => alert('Redirecting to Google Pay...')}
            >
              <FcGoogle className='mr-3'/>
              Pay with Google
            </button>
          </div>
  
          {/* Payment Form */}
          <form onSubmit={handlePayment} className="space-y-6">
            <h2 className="text-lg font-semibold text-gray-700">Card Payment</h2>
  
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2" htmlFor="name">
                Cardholder Name
              </label>
              <input
                id="name"
                type="text"
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
                placeholder="Enter your name"
                required
              />
            </div>
  
            <div>
              <label className="block text-lg font-medium text-gray-700 mb-2" htmlFor="card-number">
                Card Number
              </label>
              <input
                id="card-number"
                type="text"
                className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
                placeholder="1234 5678 9012 3456"
                required
              />
            </div>
  
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2" htmlFor="expiry">
                  Expiry Date
                </label>
                <input
                  id="expiry"
                  type="text"
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="MM/YY"
                  required
                />
              </div>
              <div>
                <label className="block text-lg font-medium text-gray-700 mb-2" htmlFor="cvv">
                  CVV
                </label>
                <input
                  id="cvv"
                  type="password"
                  className="w-full px-4 py-3 border rounded-lg shadow-sm focus:ring-4 focus:ring-blue-400 focus:outline-none transition"
                  placeholder="123"
                  required
                />
              </div>
            </div>
  
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-lg text-lg font-bold shadow-md hover:from-purple-600 hover:to-blue-500 focus:ring-4 focus:ring-blue-400 transition-transform transform hover:scale-105"
            >
              Pay Now
            </button>
          </form>
        </div>
      </div>
    );
}
