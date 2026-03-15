"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export default function StreakCounter({ streak }: { streak: number }) {
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!numberRef.current || streak === 0) return;

    // Animate number counting up from 0 to streak value
    gsap.fromTo(
      numberRef.current,
      { innerText: 0 },
      {
        innerText: streak,
        duration: 1.5,
        ease: "power2.out",
        snap: { innerText: 1 },
        onUpdate() {
          if (numberRef.current) {
            numberRef.current.textContent = Math.round(
              Number(numberRef.current.textContent),
            ).toString();
          }
        },
      },
    );
  }, [streak]);

  return (
    <div className="text-center">
      <p className="text-2xl font-bold">
        <span ref={numberRef}>{streak}</span>
      </p>
      <p className="text-xs text-white/40">day streak 🔥</p>
    </div>
  );
}
