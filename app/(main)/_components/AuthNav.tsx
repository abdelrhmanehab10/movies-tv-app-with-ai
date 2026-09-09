"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface AuthNavProps {
  email: string | null;
}

const supabase = createClient();

export default function AuthNav({ email }: AuthNavProps) {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  if (!email) {
    return (
      <Link
        href="/login"
        className="rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        Sign in
      </Link>
    );
  }

  const handleSignOut = async () => {
    setIsSigningOut(true);
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
    setIsSigningOut(false);
  };

  return (
    <div className="flex items-center gap-3">
      <span className="hidden max-w-40 truncate text-sm text-white/60 sm:block">
        {email}
      </span>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleSignOut}
        disabled={isSigningOut}
        className="rounded-full border-white/15 bg-transparent text-white/70 hover:bg-white/10 hover:text-white"
      >
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
