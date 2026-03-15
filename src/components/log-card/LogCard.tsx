"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type Log = {
  id: string;
  title: string;
  what_i_built: string | null;
  blockers: string | null;
  mood: string | null;
  time_spent: number | null;
  tags: string[] | null;
  createdAt: Date;
};

const moodEmoji: Record<string, string> = {
  great: "🔥",
  good: "😊",
  okay: "😐",
  stuck: "😤",
  bad: "😞",
};

export default function LogCard({
  log,
  showDelete = false,
}: {
  log: Log;
  showDelete?: boolean;
}) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);

  const handleDelete = async () => {
    if (!confirm("Delete this log?")) return;
    setDeleting(true);

    await fetch(`/api/logs/${log.id}`, { method: "DELETE" });

    router.refresh();
    setDeleting(false);
  };

  return (
    <div className="border border-white/10 rounded-2xl p-5 bg-white/5 flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <h3 className="font-semibold text-white">{log.title}</h3>
        <div className="flex items-center gap-3">
          <span className="text-xs text-white/30">
            {new Date(log.createdAt).toLocaleDateString()}
          </span>
          {showDelete && (
            <button
              onClick={handleDelete}
              disabled={deleting}
              className="text-xs text-red-400/60 hover:text-red-400 transition disabled:opacity-50"
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          )}
        </div>
      </div>

      <p className="text-sm text-white/60">{log.what_i_built}</p>

      {log.blockers && (
        <p className="text-sm text-red-400/70">🚧 {log.blockers}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        {log.mood && (
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">
            {moodEmoji[log.mood]} {log.mood}
          </span>
        )}
        {log.time_spent && (
          <span className="text-xs bg-white/10 px-2.5 py-1 rounded-full">
            ⏱ {log.time_spent} mins
          </span>
        )}
        {log.tags?.map((tag) => (
          <span
            key={tag}
            className="text-xs bg-white/10 px-2.5 py-1 rounded-full text-white/60"
          >
            #{tag}
          </span>
        ))}
      </div>
    </div>
  );
}
