"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";
import { logout } from "@/app/login/actions";
import { Home, BookOpen, Sparkles, Plus, FolderKanban, CalendarDays, Target, Star, Bot, Clock, Compass, Search, Download, LogOut, Settings, Menu, X, Flame, Orbit, BookMarked, CalendarRange, User as UserIcon } from "lucide-react";

const items = [
  { href: "/", label: "Accueil", Icon: Home, m: 1 }, { href: "/journal", label: "Journal", Icon: BookOpen, m: 1 },
  { href: "/agenda", label: "Agenda", Icon: CalendarDays, m: 1 }, { href: "/objectifs", label: "Objectifs", Icon: Target, m: 1 },
  { href: "/assistant", label: "IA", Icon: Bot, m: 1 }, { href: "/promesses", label: "Promesses", Icon: Sparkles, m: 0 },
  { href: "/projets", label: "Projets", Icon: FolderKanban, m: 0 }, { href: "/vision", label: "Vision", Icon: Star, m: 0 },
  { href: "/planning", label: "Planning", Icon: Clock, m: 0 }, { href: "/parcours", label: "Parcours", Icon: Compass, m: 0 },
  { href: "/recherche", label: "Recherche", Icon: Search, m: 0 }, { href: "/agenda/calendrier", label: "Calendrier", Icon: CalendarRange, m: 0 },
  { href: "/constellation", label: "Constellation", Icon: Orbit, m: 0 }, { href: "/jeune", label: "Jeûne", Icon: Flame, m: 0 },
  { href: "/retrospective", label: "Rétrospective", Icon: BookMarked, m: 0 }, { href: "/reglages", label: "Réglages", Icon: Settings, m: 0 },
  { href: "/profil", label: "Profil", Icon: UserIcon, m: 0 },
];

export default function Nav() {
  const p = usePathname();
  const [open, setOpen] = useState(false);
  if (p === "/login") return null;
  return (
    <>
      {/* Bureau : liste défilante + pied toujours visible */}
      <aside className="glass fixed bottom-4 left-4 top-4 hidden w-64 flex-col overflow-hidden p-6 hover:!transform-none md:flex">
        <div className="shrink-0">
          <h1 className="gold-text font-serif text-4xl">Selah</h1>
          <p className="mt-1 text-xs opacity-60">Mon journal de vie, de foi et de vision</p>
        </div>
        <nav className="mt-6 flex-1 space-y-1 overflow-y-auto pr-1 [scrollbar-width:thin]">
          {items.map(({ href, label, Icon }) => (
            <Link key={href} href={href} className={`flex items-center gap-3 rounded-2xl px-4 py-2 text-sm transition ${p === href ? "bg-white/10 text-gold" : "opacity-70 hover:bg-white/5 hover:opacity-100"}`}>
              <Icon size={18} /> {label}
            </Link>
          ))}
        </nav>
        <div className="shrink-0 space-y-3 pt-4">
          <Link href="/journal#nouveau" className="btn block text-center">+ Nouvelle entrée</Link>
          <div className="flex items-center justify-between text-xs opacity-70">
            <ThemeToggle />
            <a href="/api/export" className="flex items-center gap-1"><Download size={14} />Export</a>
            <form action={logout}><button className="flex items-center gap-1"><LogOut size={14} />Sortir</button></form>
          </div>
        </div>
      </aside>

      {/* Mobile : bouton menu */}
      <button onClick={() => setOpen(true)} aria-label="Menu" className="glass fixed right-3 top-3 z-50 !rounded-full p-3 md:hidden">
        <Menu size={20} />
      </button>

      {/* Mobile : menu complet */}
      {open && (
        <div className="fixed inset-0 z-[60] overflow-y-auto bg-night/95 p-6 backdrop-blur md:hidden" onClick={() => setOpen(false)}>
          <button className="absolute right-4 top-4 p-3" aria-label="Fermer"><X size={24} /></button>
          <h1 className="gold-text mt-2 font-serif text-4xl">Selah</h1>
          <nav className="mt-8 grid grid-cols-2 gap-3">
            {items.map(({ href, label, Icon }) => (
              <Link key={href} href={href} className={`glass flex items-center gap-3 !rounded-2xl p-4 ${p === href ? "text-gold" : ""}`}>
                <Icon size={18} /> {label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between px-2 pb-28" onClick={(e) => e.stopPropagation()}>
            <ThemeToggle />
            <a href="/api/export" className="flex items-center gap-1 text-sm"><Download size={14} />Export</a>
            <form action={logout}><button className="btn !px-5 !py-2 text-sm">Se déconnecter</button></form>
          </div>
        </div>
      )}

      {/* Mobile : barre du bas */}
      <nav className="glass fixed bottom-3 left-3 right-3 z-50 flex items-center justify-around py-2 md:hidden" style={{ borderRadius: "2rem" }}>
        {items.filter((i) => i.m).map(({ href, label, Icon }) => (
          <Link key={href} href={href} className={`flex flex-col items-center text-[10px] ${p === href ? "text-gold" : "opacity-70"}`}><Icon size={20} />{label}</Link>
        ))}
        <Link href="/journal#nouveau" className="btn !p-3" aria-label="Nouvelle entrée"><Plus size={20} /></Link>
      </nav>
    </>
  );
}