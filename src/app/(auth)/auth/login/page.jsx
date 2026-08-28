"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Logging in with:", email, password, "remember:", rememberMe);
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <div className="flex justify-center">
          <Image src="/Google.png" alt="" width={48} height={48} className="h-12 w-auto" />
        </div>
        <h1 className="mt-6 text-center font-display text-headline-md text-on-surface">Login</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <TextField
            id="email"
            type="email"
            icon={FiMail}
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            id="password"
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

          <div className="flex items-center justify-between text-label-sm">
            <label className="flex items-center gap-2 text-on-surface-variant">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-outline-variant text-primary focus:ring-primary"
              />
              Remember me
            </label>
            <Link href="/auth/resetpassword" className="text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button type="submit" className="w-full">
            Log in
          </Button>

          <div className="flex items-center gap-3">
            <span className="h-px flex-1 bg-outline-variant" />
            <span className="text-label-sm text-on-surface-variant">Or continue with</span>
            <span className="h-px flex-1 bg-outline-variant" />
          </div>

          <Button
            type="button"
            variant="secondary"
            icon={FcGoogle}
            className="w-full"
            onClick={() => console.log("Continue with Google")}
          >
            Continue with Google
          </Button>
        </form>
      </div>

      <p className="mt-6 text-center text-body-md text-on-surface-variant">
        Don&apos;t have an account?{" "}
        <Link href="/auth/signup" className="font-semibold text-primary hover:underline">
          Sign up
        </Link>
      </p>
    </div>
  );
}
