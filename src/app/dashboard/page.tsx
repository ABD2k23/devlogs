import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db/index";
import { logs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import LogForm from "@/components/log-form/LogForm";
import LogCard from "@/components/log-card/LogCard";

export default async function DashboardPage() {
  const session = await auth();

  if (!session?.user) redirect("/");

  const userLogs = await db
    .select()
    .from(logs)
    .where(eq(logs.userId, session.user.id!))
    .orderBy(desc(logs.createdAt));

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">Dashboard</h1>
        <p className="text-white/40 text-sm">
          Log your progress. Stay consistent.
        </p>
      </div>

      <LogForm userId={session.user.id!} />

      <div className="mt-16">
        <h2 className="text-lg font-semibold mb-6 text-white/70">
          Your Logs ({userLogs.length})
        </h2>
        {userLogs.length === 0 ? (
          <p className="text-white/30 text-sm">
            No logs yet. Write your first one above! 👆
          </p>
        ) : (
          <div className="flex flex-col gap-4">
            {userLogs.map((log) => (
              <LogCard key={log.id} log={log} showDelete={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
