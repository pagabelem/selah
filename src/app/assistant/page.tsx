"use client";
import { useState } from "react";
import { motion } from "framer-motion";
type Msg = { role: "me" | "ai"; text: string };
export default function Assistant() {
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [q, setQ] = useState(""); const [busy, setBusy] = useState(false);
  async function send(e: React.FormEvent) {
    e.preventDefault(); if (!q.trim()) return;
    const prompt = q; setQ(""); setBusy(true); setMsgs((m) => [...m, { role: "me", text: prompt }]);
    const r = await fetch("/api/ai/stream", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prompt }) });
    setMsgs((m) => [...m, { role: "ai", text: "" }]);
    const rd = r.body!.getReader(), dc = new TextDecoder();
    for (;;) { const { done, value } = await rd.read(); if (done) break; const t = dc.decode(value, { stream: true }); setMsgs((m) => m.map((x, i) => (i === m.length - 1 ? { ...x, text: x.text + t } : x))); }
    setBusy(false);
  }
  return (
    <div className="space-y-6">
      <h2 className="gold-text font-serif text-5xl">Assistant</h2>
      <div className="space-y-3">{msgs.map((m, i) => (
        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`glass whitespace-pre-line p-5 ${m.role === "me" ? "ml-12 !bg-gold/10" : "mr-12"}`}>{m.text}</motion.div>
      ))}{busy && <p className="animate-pulse opacity-60">Réflexion…</p>}</div>
      <form onSubmit={send} className="glass flex gap-2 p-3"><input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Interpréter un rêve, prier, méditer…" className="input" /><button className="btn">Envoyer</button></form>
    </div>
  );
}
