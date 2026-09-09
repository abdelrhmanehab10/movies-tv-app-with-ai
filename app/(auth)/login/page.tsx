import Link from "next/link";

import LoginForm from "./login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center px-5 py-12">
      <div className="w-full max-w-md">
        <Link
          href="/"
          className="mx-auto block w-fit text-lg font-semibold tracking-[0.2em] transition-colors hover:text-primary"
        >
          CINEMOTION
        </Link>
        <p className="mt-2 text-center text-sm text-white/60">
          Sign in to save your AI recommendations.
        </p>
        <LoginForm />
      </div>
    </main>
  );
}
