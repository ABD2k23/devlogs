"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";

type Props = {
  logs: { createdAt: Date }[];
};

type TooltipState = {
  text: string;
  x: number;
  y: number;
} | null;

const LEVELS = [
  {
    bg: "transparent",
    border: "rgba(255,255,255,0.07)",
    text: "rgba(255,255,255,0.2)",
  },
  { bg: "#052e16", border: "#14532d", text: "#4ade80" },
  { bg: "#166534", border: "#15803d", text: "#86efac" },
  { bg: "#16a34a", border: "#22c55e", text: "#dcfce7" },
  { bg: "#22c55e", border: "#4ade80", text: "#052e16" },
] as const;

function getLevel(count: number) {
  if (count === 0) return LEVELS[0];
  if (count === 1) return LEVELS[1];
  if (count === 2) return LEVELS[2];
  if (count === 3) return LEVELS[3];
  return LEVELS[4];
}

// ✅ Always uses local time — never converts to UTC
function toLocalDateStr(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

export default function Heatmap({ logs }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipState>(null);
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [monthOffset, setMonthOffset] = useState(0);

  // ✅ Fix 1 — countMap uses local date
  const countMap: Record<string, number> = {};
  logs.forEach((log) => {
    const key = toLocalDateStr(new Date(log.createdAt));
    countMap[key] = (countMap[key] || 0) + 1;
  });

  const totalLogs = logs.length;
  const activeDays = Object.keys(countMap).length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // ✅ Fix 2 — todayStr uses local date
  const todayStr = toLocalDateStr(today);

  const viewDate = new Date(
    today.getFullYear(),
    today.getMonth() + monthOffset,
    1,
  );
  const viewYear = viewDate.getFullYear();
  const viewMonth = viewDate.getMonth();

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const shortDayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(viewYear, viewMonth, 1).getDay();

  const days: { date: string; count: number; day: number }[] = [];
  for (let d = 1; d <= daysInMonth; d++) {
    const dateObj = new Date(viewYear, viewMonth, d);
    // ✅ Fix 3 — calendar keys use local date
    const key = toLocalDateStr(dateObj);
    days.push({ date: key, count: countMap[key] || 0, day: d });
  }

  const paddedDays: ((typeof days)[0] | null)[] = [
    ...Array(firstDayOfMonth).fill(null),
    ...days,
  ];

  const weeks: ((typeof days)[0] | null)[][] = [];
  for (let i = 0; i < paddedDays.length; i += 7) {
    weeks.push(paddedDays.slice(i, i + 7));
  }

  const monthLogs = days.reduce((sum, d) => sum + d.count, 0);
  const monthActiveDays = days.filter((d) => d.count > 0).length;
  const isCurrentMonth = monthOffset === 0;

  const formatDate = (dateStr: string) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    const d = new Date(year, month - 1, day);
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  };

  useEffect(() => {
    if (!containerRef.current) return;
    const cells = containerRef.current.querySelectorAll(".heatmap-cell");
    gsap.set(cells, { opacity: 0, scale: 0.5, transformOrigin: "center" });
    gsap.to(cells, {
      opacity: 1,
      scale: 1,
      duration: 0.2,
      stagger: { amount: 0.4, from: "start" },
      ease: "back.out(1.2)",
    });
  }, [monthOffset]);

  return (
    <div className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setMonthOffset((o) => o - 1)}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition"
          >
            ‹
          </button>

          <p className="text-sm font-medium text-white w-36 text-center">
            {monthNames[viewMonth]} {viewYear}
          </p>

          <button
            onClick={() => setMonthOffset((o) => o + 1)}
            disabled={isCurrentMonth}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-white/50 hover:text-white transition disabled:opacity-20 disabled:cursor-not-allowed"
          >
            ›
          </button>

          {!isCurrentMonth && (
            <button
              onClick={() => setMonthOffset(0)}
              className="text-[11px] text-white/30 hover:text-white/60 transition ml-1"
            >
              Today
            </button>
          )}
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">
              Logs
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              {monthLogs}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-white/25 uppercase tracking-wider">
              Days
            </p>
            <p className="text-sm font-semibold text-white tabular-nums">
              {monthActiveDays}
            </p>
          </div>
        </div>
      </div>

      {/* Day headers */}
      <div className="grid grid-cols-7 gap-[3px]">
        {shortDayNames.map((day) => (
          <div key={day} className="text-center py-1">
            <span className="text-[10px] text-white/25 font-medium">{day}</span>
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div ref={containerRef} className="flex flex-col gap-[3px]">
        {weeks.map((week, wi) => (
          <div key={wi} className="grid grid-cols-7 gap-[3px]">
            {week.map((day, di) => {
              if (!day) {
                return <div key={`pad-${wi}-${di}`} className="h-8" />;
              }

              const level = getLevel(day.count);
              const isToday = day.date === todayStr;
              const isHovered = hoveredDate === day.date;

              return (
                <div
                  key={day.date}
                  className="heatmap-cell h-8 rounded-[4px] flex items-center justify-center cursor-pointer transition-transform duration-100"
                  style={{
                    backgroundColor: level.bg,
                    border: `1px solid ${isToday ? "rgba(255,255,255,0.5)" : level.border}`,
                    boxShadow: isToday
                      ? "0 0 0 1px rgba(255,255,255,0.2)"
                      : isHovered
                        ? "0 0 0 1px rgba(255,255,255,0.25)"
                        : "none",
                    transform: isHovered ? "scale(1.15)" : "scale(1)",
                  }}
                  onMouseEnter={(e) => {
                    setHoveredDate(day.date);
                    const rect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      text:
                        day.count === 0
                          ? `No logs · ${formatDate(day.date)}`
                          : `${day.count} log${day.count !== 1 ? "s" : ""} · ${formatDate(day.date)}`,
                      x: rect.left + rect.width / 2,
                      y: rect.top,
                    });
                  }}
                  onMouseLeave={() => {
                    setHoveredDate(null);
                    setTooltip(null);
                  }}
                >
                  <span
                    className="text-[11px] leading-none tabular-nums select-none"
                    style={{
                      color:
                        isToday && day.count === 0
                          ? "rgba(255,255,255,0.9)"
                          : level.text,
                      fontWeight: isToday || day.count >= 4 ? 600 : 400,
                    }}
                  >
                    {day.day}
                  </span>
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between mt-1">
        <div className="flex items-center gap-3 text-[10px] text-white/25">
          <span>{totalLogs} total logs</span>
          <span>·</span>
          <span>{activeDays} active days all time</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] text-white/25 mr-0.5">Less</span>
          {LEVELS.map((level, i) => (
            <div
              key={i}
              className="w-[11px] h-[11px] rounded-[2px]"
              style={{
                backgroundColor: level.bg,
                border: `1px solid ${level.border}`,
              }}
            />
          ))}
          <span className="text-[10px] text-white/25 ml-0.5">More</span>
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y,
            transform: "translate(-50%, calc(-100% - 8px))",
          }}
        >
          <div className="bg-zinc-950/95 border border-white/10 text-white text-[11px] px-2.5 py-1.5 rounded-lg shadow-2xl whitespace-nowrap">
            {tooltip.text}
            <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-zinc-950/95" />
          </div>
        </div>
      )}
    </div>
  );
}
