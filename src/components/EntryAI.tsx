"use client";
import { useState } from "react";
const P = {
  interpret: "Propose une interprétation biblique prudente de cette entrée, avec références vérifiables, en distinguant le texte de la supposition.",
  prayer: "Propose une prière et des axes de prière liés à cette entrée.",
  meditate: "Recommande 3 à 5 passages bibliques de méditation avec une question de réflexion pour chacun.",
} as const;
export default function EntryAI({ id }: { id: string }) {
  const [out, setOut] = useState(""); const [busy, setBusy] = useState(false);
  async function run(fn: keyof typeof P) {
    setBusy(true); setOut("");
    const r = await fetch("/api/ai", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ entryId: id, fn, prompt: P[fn] }) });
    setOut((await r.json()).answer); setBusy(false);
  }
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3">{(["interpret", "prayer", "meditate"] as const).map((k) => <button key={k} onClick={() => run(k)} disabled={busy} className="btn !px-4 !py-2 text-sm">{{ interpret: "Interpréter", prayer: "Prier", meditate: "Méditer" }[k]}</button>)}</div>
      {busy && <p className="animate-pulse opacity-60">Réflexion…</p>}
      {out && <div className="glass whitespace-pre-line p-5">{out}</div>}
    </div>
  );
}
