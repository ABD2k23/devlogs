import { db } from "@/lib/db/index";
import { users, logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { notFound } from "next/navigation";
import LogCard from "@/components/log-card/LogCard";
import Image from "next/image";
import { auth } from "@/lib/auth";
import Heatmap from "@/components/heatmap/Heatmap";
import StreakCounter from "@/components/streak/StreakCounter";
type Props = {
  params: Promise<{ username: string }>;
};

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;

  // Find the user by username
  const user = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .then((res) => res[0]);

  // If user doesn't exist → show 404
  if (!user) notFound();

  // Fetch their logs
  const userLogs = await db
    .select()
    .from(logs)
    .where(eq(logs.userId, user.id))
    .orderBy(desc(logs.createdAt));

  // Calculate streak
  const streak = calculateStreak(userLogs.map((l) => l.createdAt));

  const session = await auth();
  const isOwnProfile = session?.user?.id === user.id;

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      {/* Profile Header */}
      <div className="flex items-center gap-5 mb-12">
        {user.image && (
          <Image
            src={user.image ?? ""}
            alt={user.name ?? ""}
            width={64}
            height={64}
            className="rounded-full border border-white/10"
          />
        )}
        <div>
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-white/40 text-sm">@{user.username}</p>
        </div>

        {/* Stats */}
        <div className="ml-auto flex gap-6 text-center">
          <div>
            <p className="text-2xl font-bold">{userLogs.length}</p>
            <p className="text-xs text-white/40">logs</p>
          </div>
          <StreakCounter streak={streak} />
        </div>
      </div>

      <div className="mb-12">
        <Heatmap logs={userLogs} />
      </div>
      {/* Logs */}
      <div className="flex flex-col gap-4">
        {userLogs.length === 0 ? (
          <p className="text-white/30 text-sm">No logs yet.</p>
        ) : (
          userLogs.map((log) => (
            <LogCard key={log.id} log={log} showDelete={isOwnProfile} />
          ))
        )}
      </div>
    </div>
  );
}

// Streak calculation logic
function calculateStreak(dates: Date[]): number {
  if (dates.length === 0) return 0;

  // Get unique days sorted newest first
  const uniqueDays = [
    ...new Set(dates.map((d) => new Date(d).toDateString())),
  ].map((d) => new Date(d));

  uniqueDays.sort((a, b) => b.getTime() - a.getTime());

  let streak = 1;
  for (let i = 1; i < uniqueDays.length; i++) {
    const diff =
      (uniqueDays[i - 1].getTime() - uniqueDays[i].getTime()) /
      (1000 * 60 * 60 * 24);

    if (diff === 1) {
      streak++;
    } else {
      break;
    }
  }

  return streak;
}
