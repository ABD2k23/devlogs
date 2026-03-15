"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

type Props = {
  logs: { createdAt: Date }[];
};

export default function Heatmap({ logs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Build a map of date string → log count
  const countMap: Record<string, number> = {};
  logs.forEach((log) => {
    const key = new Date(log.createdAt).toISOString().split("T")[0];
    countMap[key] = (countMap[key] || 0) + 1;
  });

  // Generate last 365 days
  const days: { date: string; count: number; month: number }[] = [];
  for (let i = 364; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    days.push({
      date: key,
      count: countMap[key] || 0,
      month: d.getMonth(),
    });
  }

  // Split into weeks
  const weeks: { date: string; count: number; month: number }[][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  // Figure out which week each month label should appear on
  const monthLabels: Record<number, string> = {};
  const monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  weeks.forEach((week, wi) => {
    const firstDay = week[0];
    // If the first day of this week is the first time we see this month → label it
    const alreadyLabeled = Object.values(monthLabels).includes(
      monthNames[firstDay.month],
    );
    if (!alreadyLabeled) {
      monthLabels[wi] = monthNames[firstDay.month];
    }
  });

  // Color based on count
  const getColor = (count: number) => {
    if (count === 0) return "bg-white/5";
    if (count === 1) return "bg-emerald-900";
    if (count === 2) return "bg-emerald-700";
    if (count === 3) return "bg-emerald-500";
    return "bg-emerald-400";
  };

  // GSAP animation
  useEffect(() => {
    if (!containerRef.current) return;
    const cells = containerRef.current.querySelectorAll(".heatmap-cell");
    gsap.fromTo(
      cells,
      { opacity: 0, scale: 0 },
      {
        opacity: 1,
        scale: 1,
        duration: 0.4,
        stagger: { amount: 1.5, from: "start" },
        ease: "back.out(1.7)",
      },
    );
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-medium text-white/50">
        Contribution Activity
      </h2>

      {/* Outer wrapper clips overflow cleanly */}
      <div className="w-full overflow-hidden">
        <div ref={containerRef} className="flex gap-[3px]">
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px] flex-1">
              {/* Month label */}
              <div className="h-4 flex items-center">
                {monthLabels[wi] ? (
                  <span className="text-[9px] text-white/30 leading-none">
                    {monthLabels[wi]}
                  </span>
                ) : (
                  <span className="text-[9px] invisible">·</span>
                )}
              </div>

              {/* Day cells */}
              {week.map((day) => (
                <div
                  key={day.date}
                  title={`${day.date}: ${day.count} log${day.count !== 1 ? "s" : ""}`}
                  className={`heatmap-cell aspect-square w-full rounded-sm ${getColor(day.count)} transition-colors`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-white/30 mt-1">
        <span>Less</span>
        <div className="w-3 h-3 rounded-sm bg-white/5" />
        <div className="w-3 h-3 rounded-sm bg-emerald-900" />
        <div className="w-3 h-3 rounded-sm bg-emerald-700" />
        <div className="w-3 h-3 rounded-sm bg-emerald-500" />
        <div className="w-3 h-3 rounded-sm bg-emerald-400" />
        <span>More</span>
      </div>
    </div>
  );
}
