"use client";
import { useState } from "react";
import { sha } from "@/lib/sha";
export default function Reglages() {
  const [pin, setPin] = useState(""), [msg, setMsg] = useState("");
  return (
    <div className="space-y-6">
      <h2 className="gold-text font-serif text-5xl">Réglages</h2>
      <div className="glass space-y-3 p-6">
        <h3 className="font-serif text-2xl">Verrouillage par code PIN</h3>
        <p className="text-sm opacity-70">Le code est stocké (haché) sur cet appareil uniquement et demandé à chaque nouvelle session.</p>
        <input value={pin} onChange={(e) => setPin(e.target.value)} type="password" inputMode="numeric" placeholder="4 à 8 chiffres" className="input" />
        <div className="flex gap-3">
          <button className="btn" onClick={async () => { if (!/^\d{4,8}$/.test(pin)) return setMsg("4 à 8 chiffres."); localStorage.setItem("pin", await sha(pin)); setPin(""); setMsg("PIN activé."); }}>Activer</button>
          <button className="rounded-full border border-gold/50 px-5 py-2 text-gold" onClick={() => { localStorage.removeItem("pin"); setMsg("PIN retiré."); }}>Retirer</button>
        </div>
        {msg && <p className="text-gold">{msg}</p>}
      </div>
      <div className="glass p-6"><a href="/api/export" className="text-gold">Exporter toutes mes données (JSON)</a></div>
    </div>
  );
}
