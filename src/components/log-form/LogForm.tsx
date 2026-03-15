"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogForm({ userId }: { userId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "",
    what_i_built: "",
    blockers: "",
    mood: "great",
    time_spent: "",
    tags: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    await fetch("/api/logs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        userId,
        time_spent: form.time_spent ? parseInt(form.time_spent) : null,
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim().toLowerCase())
          : [],
      }),
    });

    setForm({
      title: "",
      what_i_built: "",
      blockers: "",
      mood: "great",
      time_spent: "",
      tags: "",
    });
    setLoading(false);
    router.refresh();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="border border-white/10 rounded-2xl p-6 flex flex-col gap-5 bg-white/5"
    >
      <h2 className="text-lg font-semibold">Today&apos;s Log</h2>

      {/* Title */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Title *</label>
        <input
          type="text"
          required
          placeholder="What did you work on today?"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
        />
      </div>

      {/* What I Built */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">What I built *</label>
        <textarea
          required
          placeholder="Describe what you built or worked on..."
          value={form.what_i_built}
          onChange={(e) => setForm({ ...form, what_i_built: e.target.value })}
          rows={3}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none"
        />
      </div>

      {/* Blockers */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Blockers</label>
        <textarea
          placeholder="Anything that slowed you down? (optional)"
          value={form.blockers}
          onChange={(e) => setForm({ ...form, blockers: e.target.value })}
          rows={2}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30 resize-none"
        />
      </div>

      {/* Mood + Time Row */}
      <div className="flex gap-4">
        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm text-white/60">Mood</label>
          <select
            value={form.mood}
            onChange={(e) => setForm({ ...form, mood: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30"
          >
            <option className="bg-black/80" value="great">
              🔥 Great
            </option>
            <option className="bg-black/80" value="good">
              😊 Good
            </option>
            <option className="bg-black/80" value="okay">
              😐 Okay
            </option>
            <option className="bg-black/80" value="stuck">
              😤 Stuck
            </option>
            <option className="bg-black/80" value="bad">
              😞 Bad
            </option>
          </select>
        </div>

        <div className="flex flex-col gap-1.5 flex-1">
          <label className="text-sm text-white/60">Time spent (minutes)</label>
          <input
            type="number"
            placeholder="e.g. 90"
            value={form.time_spent}
            onChange={(e) => setForm({ ...form, time_spent: e.target.value })}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
          />
        </div>
      </div>

      {/* Tags */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm text-white/60">Tags</label>
        <input
          type="text"
          placeholder="react, typescript, css (comma separated)"
          value={form.tags}
          onChange={(e) => setForm({ ...form, tags: e.target.value })}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/30"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="bg-white text-black font-medium text-sm py-2.5 rounded-lg hover:bg-white/90 transition disabled:opacity-50"
      >
        {loading ? "Saving..." : "Save Log"}
      </button>
    </form>
  );
}
