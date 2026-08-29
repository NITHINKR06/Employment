"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { IoBriefcaseOutline, IoPersonOutline } from "react-icons/io5";
import SelectableCard from "@/components/Booking/SelectableCard";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";

const ROLES = [
  {
    value: "user",
    icon: IoPersonOutline,
    title: "I need work done",
    description: "Search, book, and pay trusted local professionals.",
  },
  {
    value: "employee",
    icon: IoBriefcaseOutline,
    title: "I offer a service",
    description: "List your trade and get discovered by nearby clients.",
  },
];

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (event) => {
    event.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Signing up with:", { role, username, email, password });
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12 bg-surface">
      <div className="w-full max-w-lg shadow-elevation-2 rounded-lg border border-on-surface/10 bg-surface-container-lowest p-8">
        <Link href="/" className="block text-center font-serif text-headline-sm text-primary mb-8">
          {SITE_NAME}
        </Link>

        {step === 1 ? (
          <>
            <h1 className="font-serif text-headline-md text-on-surface text-center mb-2">Join {SITE_NAME}</h1>
            <p className="font-sans text-body-md text-on-surface-variant text-center mb-8">
              Choose how you&rsquo;ll use {SITE_NAME}.
            </p>
            <div className="flex flex-col gap-4">
              {ROLES.map((option) => (
                <SelectableCard
                  key={option.value}
                  icon={option.icon}
                  title={option.title}
                  description={option.description}
                  selected={role === option.value}
                  onSelect={() => setRole(option.value)}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="primary"
              size="lg"
              className="w-full mt-8"
              disabled={!role}
              onClick={() => setStep(2)}
            >
              Continue
            </Button>
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="font-sans text-[13px] text-on-surface-variant hover:text-primary mb-4"
            >
              ← Back
            </button>
            <h1 className="font-serif text-headline-md text-on-surface text-center mb-8">
              Create your account
            </h1>
            <form onSubmit={handleSignup} className="flex flex-col gap-6">
              <TextField
                icon={FiUser}
                placeholder="Username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
              />
              <TextField
                icon={FiMail}
                type="email"
                placeholder="Email address"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
              />
              <TextField
                icon={FiLock}
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-on-surface-variant"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                }
              />
              <TextField
                icon={FiLock}
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                rightSlot={
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-on-surface-variant"
                    aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                }
              />
              <Button type="submit" variant="primary" size="lg" className="w-full">
                Sign Up
              </Button>
            </form>
          </>
        )}
      </div>

      <p className="mt-6 font-sans text-body-md text-on-surface-variant">
        Have an account?{" "}
        <Link href="/auth/login" className="text-primary font-semibold hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}
