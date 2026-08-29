"use client";

import { useState } from "react";
import Link from "next/link";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (event) => {
    event.preventDefault();
    console.log("Logging in with:", email, password, "remember:", rememberMe);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-6 lg:p-12 bg-surface">
      <div className="w-full max-w-md shadow-elevation-2 rounded-lg border border-on-surface/10 bg-surface-container-lowest p-8">
        <Link href="/" className="block text-center font-serif text-headline-sm text-primary mb-8">
          {SITE_NAME}
        </Link>
        <h1 className="font-serif text-headline-md text-on-surface text-center mb-8">Login</h1>

        <form onSubmit={handleLogin} className="flex flex-col gap-6">
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

          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 font-sans text-[13px] text-on-surface-variant">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="accent-primary h-4 w-4"
              />
              Remember me
            </label>
            <Link href="/auth/resetpassword" className="font-sans text-[13px] text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full">
            Log In
          </Button>

          <div className="flex items-center gap-4">
            <div className="h-px flex-1 bg-on-surface/10" />
            <span className="font-sans text-[12px] uppercase tracking-[0.1em] text-on-surface-variant">
              Or continue with
            </span>
            <div className="h-px flex-1 bg-on-surface/10" />
          </div>

          <button
            type="button"
            onClick={() => console.log("Continue with Google")}
            className="flex items-center justify-center gap-3 border border-on-surface/20 rounded py-3 font-sans text-body-md text-on-surface hover:bg-surface-container-low transition-colors"
          >
            <FcGoogle className="text-xl" />
            Continue with Google
          </button>
        </form>
      </div>

      <p className="mt-6 font-sans text-body-md text-on-surface-variant">
        Don&rsquo;t have an account?{" "}
        <Link href="/auth/signup" className="text-primary font-semibold hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
