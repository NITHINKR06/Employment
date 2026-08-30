"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock } from "react-icons/fi";
import { TbPasswordMobilePhone } from "react-icons/tb";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function ResetPassword() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSendOtp = () => {
    if (!email || !email.includes("@")) {
      setError("Please enter a valid email address first.");
      return;
    }
    setError("");
    setOtpSent(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (newPassword.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      router.push("/auth/login");
    }, 1500);
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
          {error && (
            <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-lg bg-primary-container/20 p-3 text-label-sm font-semibold text-primary">
              Password reset successful! Redirecting to login...
            </div>
          )}
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
            <div className="mt-1.5 flex items-center justify-between">
              {otpSent && <span className="text-label-sm font-semibold text-primary">OTP sent to email!</span>}
              <button
                type="button"
                onClick={handleSendOtp}
                className="ml-auto text-label-sm text-primary hover:underline"
              >
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
