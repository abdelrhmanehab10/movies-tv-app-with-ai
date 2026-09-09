import Link from "next/link";
import AuthNav from "./_components/AuthNav";
import { createClient } from "@/lib/supabase/server";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout = async ({ children }: MainLayoutProps) => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 px-5 py-5">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <Link href="/" className="group">
            <span className="block text-lg font-semibold tracking-wide transition-colors group-hover:text-primary">
              CINEMOTION
            </span>
            <span className="block text-xs text-white/60">
              AI movie discovery
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/search"
              className="hidden rounded-full border border-white/15 px-4 py-2 text-sm text-white/70 transition-colors hover:border-primary hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:block"
            >
              Browse titles
            </Link>
            <AuthNav email={user?.email ?? null} />
          </div>
        </div>
      </header>
      <main className="px-5 py-3">{children}</main>
    </div>
  );
};

export default MainLayout;
