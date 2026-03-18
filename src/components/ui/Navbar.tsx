import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";
import { LayoutDashboard, Rss, User, LogOut, LogIn } from "lucide-react";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      {/* Logo */}
      <Link href="/" className="text-xl font-bold text-white">
        DevLogs
      </Link>

      <div className="flex items-center gap-1 sm:gap-4">
        {/* Feed */}
        <Link
          href="/"
          className="flex items-center gap-2 text-white/60 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5"
        >
          <Rss size={16} />
          <span className="hidden sm:inline text-sm">Feed</span>
        </Link>

        {session?.user ? (
          <>
            {/* Dashboard */}
            <Link
              href="/dashboard"
              className="flex items-center gap-2 text-white/60 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <LayoutDashboard size={16} />
              <span className="hidden sm:inline text-sm">Dashboard</span>
            </Link>

            {/* Profile */}
            <Link
              href={`/u/${session.user.username}`}
              className="flex items-center gap-2 text-white/60 hover:text-white transition px-3 py-2 rounded-lg hover:bg-white/5"
            >
              <User size={16} />
              <span className="hidden sm:inline text-sm">Profile</span>
            </Link>

            {/* Sign out */}
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="flex items-center gap-2 text-sm bg-white/10 hover:bg-white/20 text-white px-3 py-2 rounded-lg transition">
                <LogOut size={16} />
                <span className="hidden sm:inline">Sign out</span>
              </button>
            </form>
          </>
        ) : (
          // Sign in
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="flex items-center gap-2 text-sm bg-white text-black px-3 py-2 rounded-lg font-medium hover:bg-white/90 transition">
              <LogIn size={16} />
              <span className="hidden sm:inline">Sign in with GitHub</span>
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
