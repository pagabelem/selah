"use client";
import { useEffect, useState } from "react";
type T = { id: number; msg: string; ok: boolean };
export default function Feedback() {
  const [ts, setTs] = useState<T[]>([]);
  useEffect(() => {
    let last: HTMLFormElement | null = null, n = 0;
    const push = (msg: string, ok = true) => {
      const id = ++n;
      setTs((x) => [...x, { id, msg, ok }]);
      setTimeout(() => setTs((x) => x.filter((t) => t.id !== id)), 3000);
    };
    const done = (f: HTMLFormElement, ok: boolean) => {
      if (location.pathname === "/login" || "noToast" in f.dataset) return;
      if (!ok) return push("Une erreur est survenue.", false);
      const visible = f.querySelector("input:not([type=hidden]), textarea, select");
      if (f.dataset.toast || visible) push(f.dataset.toast || "Enregistré ✓");
      if (visible && !f.closest("details") && !("keep" in f.dataset)) f.reset();
    };
    const onSubmit = (e: Event) => { last = e.target as HTMLFormElement; };
    const orig = window.fetch;
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const isAction = !!init?.headers && new Headers(init.headers as HeadersInit).has("next-action"), form = last;
      try {
        const res = await orig(input, init);
        if (isAction && form) done(form, res.ok);
        return res;
      } catch (err) { if (isAction) push("Échec, réessayez.", false); throw err; }
    };
    document.addEventListener("submit", onSubmit, true);
    return () => { window.fetch = orig; document.removeEventListener("submit", onSubmit, true); };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-[200] flex flex-col items-center gap-2 md:bottom-8">
      {ts.map((t) => <div key={t.id} className={`glass !rounded-full px-5 py-3 text-sm shadow-xl ${t.ok ? "text-emerald-300" : "text-red-300"}`}>{t.msg}</div>)}
    </div>
  );
}