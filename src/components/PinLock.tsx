"use client";
import { useEffect, useState } from "react";
import { sha } from "@/lib/sha";
export default function PinLock() {
  const [locked, setL] = useState(false), [v, setV] = useState(""), [err, setE] = useState(false);
  useEffect(() => setL(!!localStorage.getItem("pin") && !sessionStorage.getItem("ok")), []);
  async function go(e: React.FormEvent) {
    e.preventDefault();
    if ((await sha(v)) === localStorage.getItem("pin")) { sessionStorage.setItem("ok", "1"); setL(false); } else { setE(true); setV(""); }
  }
  if (!locked) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-night">
      <form onSubmit={go} className="glass w-80 space-y-4 p-8 text-center">
        <h2 className="gold-text font-serif text-4xl">Selah</h2>
        <input type="password" inputMode="numeric" autoFocus value={v} onChange={(e) => setV(e.target.value)} placeholder="Code PIN" className="input text-center tracking-[.5em]" />
        {err && <p className="text-sm text-red-300">Code incorrect</p>}
        <button className="btn w-full">Déverrouiller</button>
      </form>
    </div>
  );
}
