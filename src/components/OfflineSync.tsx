"use client";
import { useEffect } from "react";
const get = () => JSON.parse(localStorage.getItem("queue") || "[]");
export default function OfflineSync() {
  useEffect(() => {
    if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js");
    const flush = async () => {
      const rest = [];
      for (const it of get()) { try { const r = await fetch("/api/entries", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(it) }); if (!r.ok) rest.push(it); } catch { rest.push(it); } }
      localStorage.setItem("queue", JSON.stringify(rest));
    };
    const onSubmit = (e: Event) => {
      const f = e.target as HTMLFormElement;
      if (f.id !== "nouveau" || navigator.onLine) return;
      e.preventDefault(); e.stopImmediatePropagation();
      const d = new FormData(f);
      localStorage.setItem("queue", JSON.stringify([...get(), { type: d.get("type"), title: d.get("title"), body: d.get("body") }]));
      f.reset(); alert("Hors ligne : entrée gardée, synchronisation au retour du réseau.");
    };
    document.addEventListener("submit", onSubmit, true); window.addEventListener("online", flush); flush();
    return () => { document.removeEventListener("submit", onSubmit, true); window.removeEventListener("online", flush); };
  }, []);
  return null;
}
