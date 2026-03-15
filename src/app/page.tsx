import { db } from "@/lib/db/index";
import { logs, users } from "@/lib/db/schema";
import { desc, eq, arrayContains } from "drizzle-orm";
import LogCard from "@/components/log-card/LogCard";
import Link from "next/link";
import Image from "next/image";

type Props = {
  searchParams: Promise<{ tag?: string }>;
};

export default async function FeedPage({ searchParams }: Props) {
  const { tag } = await searchParams;

  // JOIN logs with users to get author info
  const feed = await db
    .select({
      log: logs,
      author: {
        name: users.name,
        username: users.username,
        image: users.image,
      },
    })
    .from(logs)
    .innerJoin(users, eq(logs.userId, users.id))
    .orderBy(desc(logs.createdAt))
    .limit(50);

  // Filter by tag if one is selected
  const filtered = tag
    ? feed.filter((entry) => entry.log.tags?.includes(tag))
    : feed;

  // Collect all unique tags from all logs
  const allTags = [
    ...new Set(feed.flatMap((entry) => entry.log.tags ?? [])),
  ].slice(0, 20);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold mb-1">Developer Feed</h1>
        <p className="text-white/40 text-sm">
          See what developers are building every day.
        </p>
      </div>

      {/* Tag filters */}
      {allTags.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-10">
          <Link
            href="/"
            className={`text-xs px-3 py-1.5 rounded-full border transition ${
              !tag
                ? "bg-white text-black border-white"
                : "border-white/10 text-white/50 hover:text-white"
            }`}
          >
            All
          </Link>
          {allTags.map((t) => (
            <Link
              key={t}
              href={`/?tag=${t}`}
              className={`text-xs px-3 py-1.5 rounded-full border transition ${
                tag === t
                  ? "bg-white text-black border-white"
                  : "border-white/10 text-white/50 hover:text-white"
              }`}
            >
              #{t}
            </Link>
          ))}
        </div>
      )}

      {/* Feed */}
      <div className="flex flex-col gap-6">
        {filtered.length === 0 ? (
          <p className="text-white/30 text-sm">
            No logs found{tag ? ` for #${tag}` : ""}.
          </p>
        ) : (
          filtered.map(({ log, author }) => (
            <div key={log.id} className="flex flex-col gap-3">
              {/* Author info */}
              <Link
                href={`/u/${author.username}`}
                className="flex items-center gap-2.5 group w-fit"
              >
                {author.image && (
                  <Image
                    src={author.image}
                    alt={author.name ?? ""}
                    width={28}
                    height={28}
                    className="rounded-full border border-white/10"
                  />
                )}
                <span className="text-sm text-white/50 group-hover:text-white transition">
                  {author.name}
                </span>
                <span className="text-xs text-white/30">
                  @{author.username}
                </span>
              </Link>

              <LogCard key={log.id} log={log} />
            </div>
          ))
        )}
      </div>
    </div>
  );
}
