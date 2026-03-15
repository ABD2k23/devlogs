import Link from "next/link";
import { auth, signIn, signOut } from "@/lib/auth";

export default async function Navbar() {
  const session = await auth();

  return (
    <nav className="border-b border-white/10 px-6 py-4 flex items-center justify-between">
      <Link href="/" className="text-xl font-bold text-white">
        DevLogs
      </Link>

      <div className="flex items-center gap-4">
        <Link
          href="/"
          className="text-sm text-white/60 hover:text-white transition"
        >
          Feed
        </Link>

        {session?.user ? (
          <>
            <Link
              href="/dashboard"
              className="text-sm text-white/60 hover:text-white transition"
            >
              Dashboard
            </Link>
            <Link
              href={`/u/${session.user.username}`}
              className="text-sm text-white/60 hover:text-white transition"
            >
              Profile
            </Link>
            <form
              action={async () => {
                "use server";
                await signOut();
              }}
            >
              <button className="text-sm bg-white/10 hover:bg-white/20 text-white px-4 py-1.5 rounded-full transition">
                Sign out
              </button>
            </form>
          </>
        ) : (
          <form
            action={async () => {
              "use server";
              await signIn("github");
            }}
          >
            <button className="text-sm bg-white text-black px-4 py-1.5 rounded-full font-medium hover:bg-white/90 transition">
              Sign in with GitHub
            </button>
          </form>
        )}
      </div>
    </nav>
  );
}
