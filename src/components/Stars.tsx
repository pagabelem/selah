"use client";
import { useEffect, useState } from "react";
export default function Stars() {
  const [s, setS] = useState<{ x: number; y: number; d: number; z: number }[]>([]);
  useEffect(() => setS(Array.from({ length: 70 }, () => ({ x: Math.random() * 100, y: Math.random() * 100, d: Math.random() * 5, z: Math.random() * 2 + 1 }))), []);
  return (
    <div aria-hidden className="fixed inset-0 -z-10 overflow-hidden">
      {s.map((t, i) => (
        <span key={i} className="absolute rounded-full bg-ivory" style={{ left: `${t.x}%`, top: `${t.y}%`, width: t.z, height: t.z, animation: `twinkle ${3 + t.d}s ease-in-out ${t.d}s infinite`, opacity: .7 }} />
      ))}
    </div>
  );
}
