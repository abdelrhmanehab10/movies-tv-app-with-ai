import Link from "next/link";

import LoginForm from "./login-form";

const callbackErrorMessages = {
  missing_code:
    "This sign-in link is missing an authentication code. Please request a new link.",
  invalid_or_expired_code:
    "This sign-in link is invalid or has expired. Please request a new link.",
  callback_failed:
    "We could not finish signing you in. Please try again in a moment.",
} as const;

type LoginPageProps = {
  searchParams: Promise<{ error?: string | string[] }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const error = (await searchParams).error;
  const callbackError =
    typeof error === "string" && Object.hasOwn(callbackErrorMessages, error)
      ? callbackErrorMessages[error as keyof typeof callbackErrorMessages]
      : null;

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
        <LoginForm initialErrorMessage={callbackError} />
      </div>
    </main>
  );
}
