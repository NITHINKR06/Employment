"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FiMail, FiLock, FiEye, FiEyeOff } from "react-icons/fi";
import { FcGoogle } from "react-icons/fc";
import TextField from "@/components/TextField/TextField";
import Button from "@/components/Button/Button";
import { SITE_NAME } from "@/lib/constants";
import { signInWithEmail, signInWithGoogle } from "@/lib/authClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await signInWithEmail({ email, password });
      router.push(user.role === "EMPLOYEE" ? "/employee/dashboard" : "/user/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError("");
    setIsGoogleSubmitting(true);
    try {
      const user = await signInWithGoogle();
      router.push(user.role === "EMPLOYEE" ? "/employee/dashboard" : "/user/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsGoogleSubmitting(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-md">
      <div className="rounded-xl border border-outline-variant bg-surface-container-lowest p-8 shadow-elevation-2">
        <Link
          href="/"
          className="block text-center font-display text-headline-md font-bold text-primary"
        >
          {SITE_NAME}
        </Link>
        <h1 className="mt-6 text-center font-display text-headline-md text-on-surface">Login</h1>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          {error && (
            <div className="rounded-lg bg-error-container/20 p-3 text-label-sm font-semibold text-error">
              {error}
            </div>
          )}
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

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? "Logging in..." : "Log in"}
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
            disabled={isGoogleSubmitting}
            onClick={handleGoogleLogin}
          >
            {isGoogleSubmitting ? "Connecting..." : "Continue with Google"}
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
