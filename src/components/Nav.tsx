"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/app/login/actions";
import { Home, BookOpen, Sparkles, Plus, FolderKanban, CalendarDays, Target, Star, Bot, Clock, Compass, Search, Download, LogOut, Settings, Flame, Orbit, BookMarked, CalendarRange } from "lucide-react";
const items = [
  { href: "/", label: "Accueil", Icon: Home, m: 1 }, { href: "/journal", label: "Journal", Icon: BookOpen, m: 1 },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays, m: 1 }, { href: "/objectifs", label: "Objectifs", Icon: Target, m: 1 },
  { href: "/assistant", label: "IA", Icon: Bot, m: 1 }, { href: "/promesses", label: "Promesses", Icon: Sparkles, m: 0 },
  { href: "/projets", label: "Projets", Icon: FolderKanban, m: 0 }, { href: "/vision", label: "Vision", Icon: Star, m: 0 },
  { href: "/planning", label: "Planning", Icon: Clock, m: 0 }, { href: "/parcours", label: "Parcours", Icon: Compass, m: 0 }, { href: "/recherche", label: "Recherche", Icon: Search, m: 0 },
  { href: "/agenda/calendrier", label: "Calendrier", Icon: CalendarRange, m: 0 }, { href: "/constellation", label: "Constellation", Icon: Orbit, m: 0 }, { href: "/jeune", label: "Jeûne", Icon: Flame, m: 0 },
  { href: "/retrospective", label: "Rétrospective", Icon: BookMarked, m: 0 }, { href: "/reglages", label: "Réglages", Icon: Settings, m: 0 },
];
export default function Nav() {
  const p = usePathname();
  if (p === "/login") return null;
  return (
    <>
      <aside className="glass fixed bottom-4 left-4 top-4 hidden w-64 flex-col p-6 md:flex">
        <h1 className="gold-text font-serif text-4xl">Selah</h1>
        <p className="mt-1 text-xs opacity-60">Mon journal de vie, de foi et de vision</p>
        <nav className="mt-8 flex flex-col gap-1">{items.map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl px-4 py-2.5 transition ${p === href ? "bg-white/10 text-gold" : "opacity-70 hover:bg-white/5 hover:opacity-100"}`}><Icon size={18} /> {label}</Link>
        ))}</nav>
        <div className="mt-auto space-y-3"><Link href="/journal#nouveau" className="btn block text-center">+ Nouvelle entrée</Link><div className="flex items-center justify-between text-xs opacity-70"><ThemeToggle /><a href="/api/export" className="flex items-center gap-1"><Download size={14} />Export</a><form action={logout}><button className="flex items-center gap-1"><LogOut size={14} />Sortir</button></form></div></div>
      </aside>
      <nav className="glass fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around py-2 md:hidden" style={{ borderRadius: "2rem" }}>
        {items.filter((i) => i.m).map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center text-[10px] ${p === href ? "text-gold" : "opacity-70"}`}><Icon size={20} />{label}</Link>
        ))}
        <Link href="/journal#nouveau" className="btn !p-3" aria-label="Nouvelle entrée"><Plus size={20} /></Link>
      </nav>
    </>
  );
}
