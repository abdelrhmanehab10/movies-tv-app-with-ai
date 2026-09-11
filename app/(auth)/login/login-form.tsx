"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "sign-in" | "sign-up";

const supabase = createClient();

type LoginFormProps = {
  initialErrorMessage?: string | null;
};

export default function LoginForm({ initialErrorMessage }: LoginFormProps) {
  const router = useRouter();
  const [mode, setMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(
    initialErrorMessage ?? null
  );
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isSignUp = mode === "sign-up";

  const changeMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);
    setIsSubmitting(true);

    const authResult = isSignUp
      ? await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { display_name: displayName.trim() || undefined },
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
      : await supabase.auth.signInWithPassword({ email, password });

    setIsSubmitting(false);

    if (authResult.error) {
      setErrorMessage(authResult.error.message);
      return;
    }

    if (isSignUp && !authResult.data.session) {
      setSuccessMessage(
        "Account created. Check your email to confirm your account before signing in."
      );
      return;
    }

    router.push("/");
    router.refresh();
  };

  return (
    <section className="mt-8 rounded-2xl border border-white/10 p-6 shadow-xl">
      <div className="mb-6 flex gap-5 border-b border-white/10">
        <button
          type="button"
          onClick={() => changeMode("sign-in")}
          className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
            !isSignUp
              ? "border-primary text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Sign in
        </button>
        <button
          type="button"
          onClick={() => changeMode("sign-up")}
          className={`-mb-px border-b-2 pb-3 text-sm font-medium transition-colors ${
            isSignUp
              ? "border-primary text-white"
              : "border-transparent text-white/50 hover:text-white"
          }`}
        >
          Create account
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {isSignUp ? (
          <div className="space-y-2">
            <Label htmlFor="display-name">Display name</Label>
            <Input
              id="display-name"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Your name"
              autoComplete="name"
              maxLength={80}
            />
          </div>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete={isSignUp ? "new-password" : "current-password"}
            minLength={6}
            required
          />
        </div>

        {errorMessage ? (
          <p role="alert" className="text-sm text-red-300">
            {errorMessage}
          </p>
        ) : null}
        {successMessage ? (
          <p role="status" className="text-sm text-emerald-300">
            {successMessage}
          </p>
        ) : null}

        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting
            ? "Please wait..."
            : isSignUp
              ? "Create account"
              : "Sign in"}
        </Button>
      </form>

      <Link
        href="/"
        className="mt-5 block text-center text-sm text-white/50 transition-colors hover:text-white"
      >
        Continue without an account
      </Link>
    </section>
  );
}
