"use client";

import { useState } from "react";
import Link from "next/link";
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { IoPersonOutline, IoStorefrontOutline, IoChevronBackOutline } from "react-icons/io5";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import SelectableCard from "@/components/Booking/SelectableCard";

const ROLES = [
  {
    value: "user",
    icon: IoPersonOutline,
    title: "I need work done",
    description: "Find and book trusted local professionals for any job.",
  },
  {
    value: "employee",
    icon: IoStorefrontOutline,
    title: "I offer a service",
    description: "List your skills and get discovered by clients nearby.",
  },
];

function RolePickerStep({ role, onSelectRole, onContinue }) {
  return (
    <div className="mx-auto w-full max-w-md">
      <h1 className="text-center font-display text-headline-md text-on-surface">
        Choose your journey
      </h1>
      <p className="mt-2 text-center text-body-md text-on-surface-variant">
        Tell us why you&apos;re here so we can set up the right account.
      </p>

      <div className="mt-6 space-y-4">
        {ROLES.map((option) => (
          <SelectableCard
            key={option.value}
            icon={option.icon}
            title={option.title}
            description={option.description}
            selected={role === option.value}
            onSelect={() => onSelectRole(option.value)}
          />
        ))}
      </div>

      <Button onClick={onContinue} disabled={!role} className="mt-6 w-full">
        Continue
      </Button>

      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

function AccountFormStep({ role, onBack }) {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSignup = (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      console.log("Passwords do not match");
      return;
    }
    console.log("Signing up with:", { role, username, email, password });
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <button
          type="button"
          onClick={onBack}
          className="mb-4 inline-flex items-center gap-1 text-label-sm text-on-surface-variant hover:text-primary"
        >
          <IoChevronBackOutline aria-hidden="true" /> Back
        </button>
        <h1 className="text-center font-display text-headline-md text-on-surface">
          Create your account
        </h1>

        <form onSubmit={handleSignup} className="mt-6 space-y-4">
          <TextField
            id="username"
            icon={FiUser}
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <TextField
            id="signup-email"
            type="email"
            icon={FiMail}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            id="signup-password"
            type={showPassword ? "text" : "password"}
            icon={FiLock}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowPassword((show) => !show)}
                className="text-on-surface-variant"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            }
          />
          <TextField
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            icon={FiLock}
            placeholder="Confirm password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            rightSlot={
              <button
                type="button"
                onClick={() => setShowConfirmPassword((show) => !show)}
                className="text-on-surface-variant"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
              </button>
            }
          />
          <Button type="submit" className="w-full">
            Sign Up
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        Have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-primary hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

export default function SignupPage() {
  const [step, setStep] = useState(1);
  const [role, setRole] = useState(null);

  if (step === 2) {
    return <AccountFormStep role={role} onBack={() => setStep(1)} />;
  }

  return (
    <RolePickerStep role={role} onSelectRole={setRole} onContinue={() => setStep(2)} />
  );
}
