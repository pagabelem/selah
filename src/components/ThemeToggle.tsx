"use client";
import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
export default function ThemeToggle() {
  const [l, setL] = useState(false);
  const apply = (v: boolean) => document.documentElement.classList.toggle("light", v);
  useEffect(() => { const v = localStorage.getItem("theme") === "light"; setL(v); apply(v); }, []);
  const t = () => { const v = !l; setL(v); localStorage.setItem("theme", v ? "light" : "dark"); apply(v); };
  return <button onClick={t} className="flex items-center gap-1">{l ? <Moon size={14} /> : <Sun size={14} />}{l ? "Sombre" : "Clair"}</button>;
}
