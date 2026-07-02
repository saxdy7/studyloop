"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Eye,
  EyeOff,
  Loader2,
  LogIn,
  Repeat2,
  UserPlus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/components/auth-provider";
import { cn } from "@/lib/utils";

function friendlyAuthError(err: unknown): string {
  const code = (err as { code?: string })?.code ?? "";
  if (code.includes("invalid-credential") || code.includes("wrong-password"))
    return "Wrong email or password.";
  if (code.includes("user-not-found")) return "No account with that email — try signing up.";
  if (code.includes("email-already-in-use"))
    return "That email already has an account — try logging in.";
  if (code.includes("weak-password")) return "Password must be at least 6 characters.";
  if (code.includes("invalid-email")) return "That doesn't look like a valid email.";
  if (code.includes("popup-closed-by-user")) return "Google sign-in was cancelled.";
  if (code.includes("unauthorized-domain"))
    return "This domain isn't authorized in Firebase yet.";
  return "Sign-in failed. Please try again.";
}

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-4 shrink-0" aria-hidden>
      <path
        fill="#4285F4"
        d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.17 3.57-8.81Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.96-1.07 7.93-2.92l-3.87-3c-1.07.72-2.45 1.15-4.06 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.09A12 12 0 0 0 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.27 14.27a7.2 7.2 0 0 1 0-4.54V6.64H1.29a12 12 0 0 0 0 10.72l3.98-3.09Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.77c1.76 0 3.35.61 4.6 1.8l3.44-3.44A11.98 11.98 0 0 0 1.29 6.64l3.98 3.09C6.22 6.88 8.87 4.77 12 4.77Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, loading, signInGoogle, signInEmail, signUpEmail } = useAuth();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);

  // Already signed in → straight to the app.
  useEffect(() => {
    if (!loading && user) router.replace("/study");
  }, [loading, user, router]);

  async function handleGoogle() {
    setBusy(true);
    try {
      await signInGoogle();
      router.replace("/study");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    try {
      if (mode === "login") await signInEmail(email, password);
      else await signUpEmail(email, password);
      router.replace("/study");
    } catch (err) {
      toast.error(friendlyAuthError(err));
    } finally {
      setBusy(false);
    }
  }

  // Framer Motion Animation variants
  const staggerContainer = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const staggerItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  return (
    <main className="flex min-h-screen w-full bg-black selection:bg-white/30 p-2 transition-all duration-500 lg:h-screen lg:overflow-hidden lg:p-4">
      {/* Left Column (Hero) */}
      <section className="relative hidden w-[52%] flex-col items-center justify-end pb-32 px-12 rounded-3xl overflow-hidden shadow-2xl h-full lg:flex">
        {/* Background Video */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        >
          <source
            src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260405_170732_8a9ccda6-5cff-4628-b164-059c500a2b41.mp4"
            type="video/mp4"
          />
        </video>

        {/* Hero Content Container */}
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="show"
          className="z-10 w-full max-w-xs space-y-8"
        >
          {/* Brand/Logo */}
          <motion.div variants={staggerItem} className="flex items-center gap-2">
            <div className="flex size-7 items-center justify-center rounded-lg bg-white/15 backdrop-blur-sm">
              <Repeat2 className="size-4 text-white" />
            </div>
            <span className="text-xl font-semibold tracking-tight text-white">StudyLoop</span>
          </motion.div>

          {/* Heading Block */}
          <motion.div variants={staggerItem} className="space-y-3">
            <h2 className="text-4xl font-medium tracking-tight text-white whitespace-nowrap">
              Turn notes into loops.
            </h2>
            <p className="text-white/60 text-sm leading-relaxed">
              Follow these 3 quick steps to master any subject.
            </p>
          </motion.div>

          {/* Steps */}
          <motion.div variants={staggerItem} className="space-y-3">
            <StepItem number={1} text="Drop your study notes" active={true} />
            <StepItem number={2} text="Configure active recall" />
            <StepItem number={3} text="Solve quiz and re-test" />
          </motion.div>
        </motion.div>
      </section>

      {/* Right Column (Form) */}
      <section className="flex-1 flex flex-col items-center justify-center py-12 lg:py-6 px-4 sm:px-12 lg:px-16 xl:px-24 overflow-y-auto lg:overflow-hidden">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-md space-y-8 lg:space-y-6 sm:space-y-10"
        >
          {/* Header */}
          <div className="space-y-2">
            <h1 className="text-3xl font-medium tracking-tight text-white">
              {mode === "login" ? "Welcome Back" : "Create New Profile"}
            </h1>
            <p className="text-white/40 text-sm">
              {mode === "login"
                ? "Sign in to pick up your loop where you left off."
                : "Input your basic details to begin the journey."}
            </p>
          </div>

          {/* Social Sign-In (Google only) */}
          <div className="space-y-4">
            <SocialButton
              onClick={handleGoogle}
              disabled={busy}
              icon={<GoogleIcon />}
              label="Continue with Google"
            />

            {/* Divider */}
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10" />
              </div>
              <span className="relative bg-black px-4 text-[10px] font-semibold text-white/40 uppercase tracking-widest">
                Or
              </span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <InputGroup
              id="email"
              label="Email"
              placeholder="you@example.com"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              disabled={busy}
            />

            <div className="space-y-1.5 relative">
              <label htmlFor="password" className="text-sm font-medium text-white block">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  disabled={busy}
                  className="w-full bg-brand-gray border-none rounded-xl h-11 pl-4 pr-12 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 outline-none text-sm transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/80 transition-colors p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {mode === "signup" && (
                <p className="text-[10px] text-white/40 mt-1">
                  Requires at least 6 symbols.
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-center mt-4">
              <button
                type="submit"
                disabled={busy}
                className="group inline-flex w-fit items-center gap-2 rounded-full py-1.5 pl-5 pr-1.5 font-sans text-sm font-medium text-black transition-all hover:gap-3 active:scale-[0.98] cursor-pointer"
                style={{ backgroundColor: "#E1E0CC" }}
              >
                <span>{mode === "login" ? "Sign In to Account" : "Create Account"}</span>
                <span className="flex size-9 items-center justify-center rounded-full bg-black transition-transform group-hover:scale-110 sm:size-10">
                  {busy ? (
                    <Loader2 className="size-4 animate-spin text-[#E1E0CC]" />
                  ) : mode === "login" ? (
                    <LogIn className="size-4 text-[#E1E0CC]" />
                  ) : (
                    <UserPlus className="size-4 text-[#E1E0CC]" />
                  )}
                </span>
              </button>
            </div>
          </form>

          {/* Footer Link */}
          <div className="text-center text-xs text-white/40 pt-2">
            {mode === "login" ? (
              <>
                New here?{" "}
                <button
                  type="button"
                  onClick={() => setMode("signup")}
                  className="text-white hover:underline underline-offset-4 font-medium transition-colors cursor-pointer"
                >
                  Create an account
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  type="button"
                  onClick={() => setMode("login")}
                  className="text-white hover:underline underline-offset-4 font-medium transition-colors cursor-pointer"
                >
                  Sign in
                </button>
              </>
            )}
          </div>
        </motion.div>
      </section>
    </main>
  );
}

/* Reusable Components */

interface StepItemProps {
  number: number;
  text: string;
  active?: boolean;
}

function StepItem({ number, text, active = false }: StepItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-2xl text-xs transition-all duration-300 w-full",
        active
          ? "bg-white text-black border border-white font-medium shadow-md shadow-white/5"
          : "bg-brand-gray text-white border-none"
      )}
    >
      <span
        className={cn(
          "flex size-5 items-center justify-center rounded-full text-[10px] font-bold shrink-0",
          active ? "bg-black text-white" : "bg-white/10 text-white/40"
        )}
      >
        {number}
      </span>
      <span className="truncate">{text}</span>
    </div>
  );
}

interface SocialButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: React.ReactNode;
  label: string;
}

function SocialButton({ onClick, disabled, icon, label }: SocialButtonProps) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-full flex items-center justify-center gap-3 bg-black border border-white/10 rounded-xl h-12 text-sm text-white hover:bg-white/5 disabled:opacity-50 transition-colors cursor-pointer"
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}

interface InputGroupProps {
  id: string;
  label: string;
  placeholder: string;
  type: string;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  autoComplete?: string;
  disabled?: boolean;
}

function InputGroup({
  id,
  label,
  placeholder,
  type,
  required,
  value,
  onChange,
  autoComplete,
  disabled,
}: InputGroupProps) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="text-sm font-medium text-white block">
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        disabled={disabled}
        className="w-full bg-brand-gray border-none rounded-xl h-11 px-4 text-white placeholder:text-white/20 focus:ring-2 focus:ring-white/20 outline-none text-sm transition-all"
      />
    </div>
  );
}
