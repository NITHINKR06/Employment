"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock } from "react-icons/fi";
import { TbPasswordMobilePhone } from "react-icons/tb";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function ResetPassword() {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Reset password for email:", email, "OTP:", otp, "New Password:", newPassword);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <h1 className="text-center font-display text-headline-md text-on-surface">
          Trouble logging in?
        </h1>
        <p className="mt-2 text-center text-body-md text-on-surface-variant">
          Enter your email and the received OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <TextField
              id="reset-email"
              type="email"
              icon={FiMail}
              placeholder="Enter email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <div className="mt-1.5 flex justify-end">
              <button type="button" className="text-label-sm text-primary hover:underline">
                Send OTP
              </button>
            </div>
          </div>

          <TextField
            id="otp"
            icon={TbPasswordMobilePhone}
            placeholder="Enter OTP"
            inputMode="numeric"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <TextField
            id="new-password"
            type="password"
            icon={FiLock}
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <TextField
            id="confirm-new-password"
            type="password"
            icon={FiLock}
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <Button type="submit" className="w-full">
            Reset Password
          </Button>

          <p className="text-center text-body-md text-on-surface-variant">
            <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
              Create new account
            </Link>
          </p>
        </form>
      </div>

      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Back to Login
        </Link>
      </p>
    </div>
  );
}
