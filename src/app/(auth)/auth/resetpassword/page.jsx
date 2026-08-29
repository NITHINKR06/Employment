"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";
import { TbPasswordMobilePhone } from "react-icons/tb";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Reset password for email:", email, "OTP:", otp, "New Password:", newPassword);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12 bg-surface">
      <div className="w-full max-w-lg shadow-elevation-2 rounded-lg border border-on-surface/10 bg-surface-container-lowest p-8">
        <Link href="/" className="block text-center font-serif text-headline-sm text-primary mb-8">
          {SITE_NAME}
        </Link>
        <h1 className="font-serif text-headline-md text-on-surface text-center mb-2">Trouble logging in?</h1>
        <p className="font-sans text-body-md text-on-surface-variant text-center mb-8">
          Enter your email and the OTP we send you to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          <TextField
            icon={FiMail}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => console.log("Send OTP to", email)}
                className="font-sans text-[12px] font-semibold uppercase tracking-[0.1em] text-primary whitespace-nowrap"
              >
                Send OTP
              </button>
            }
          />
          <TextField
            icon={TbPasswordMobilePhone}
            inputMode="numeric"
            placeholder="Enter OTP"
            value={otp}
            onChange={(event) => setOtp(event.target.value)}
            required
          />
          <TextField
            icon={FiLock}
            type="password"
            placeholder="New password"
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
            required
          />
          <TextField
            icon={FiLock}
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            required
          />
          <Button type="submit" variant="primary" size="lg" className="w-full">
            Reset Password
          </Button>
        </form>
      </div>

      <p className="mt-6 font-sans text-body-md text-on-surface-variant">
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
